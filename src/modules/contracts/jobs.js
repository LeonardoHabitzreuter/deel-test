const { sequelize } = require('#src/model');
const { getUnpaidJobsByUser } = require('#services/jobsService')

const jobsRoutes = (app) => {
    app.get('/jobs/unpaid',async (req, res) =>{
        const models = req.app.get('models')
        const profileId = +req.get('profile_id')

        try {
            const jobs = await getUnpaidJobsByUser(models, profileId)

            res.json(jobs)
        } catch (error) {
            res.status(500).send('An error occurred while searching for your unpaid jobs, please try again.')
        }
    })
    
    app.post('/jobs/:job_id/pay', async (req, res) =>{
        const {Job, Contract, Profile} = req.app.get('models')
        const jobId = +req.params.job_id
        const profileId = +req.get('profile_id')

        try {
            const job = await Job.findOne({
                where: { id: jobId },
                include: { model: Contract }
            })
            if (!job) {
                return res.status(404).send('Job not found!')
            }
            if(job.Contract.ClientId !== profileId) {
                return res.status(401).send("You are not the client of this job!")
            }
            if(job.paid) {
                return res.send('This job was already paid!')
            }
            
            const client = await Profile.findOne({ where: { id: profileId } })
            if (job.price > client.balance) {
                return res.send("Sorry, it looks like you don't have enough money to pay for this job.")
            }

            const contractor = await Profile.findOne({ where: { id: job.Contract.ContractorId } })
            await sequelize.transaction(async t => {
                await Profile.decrement(
                    { balance: job.price },
                    {
                        transaction: t,
                        where: { id: profileId },
                    },
                );

                await Profile.increment(
                    { balance: job.price },
                    {
                        transaction: t,
                        where: { id: contractor.id },
                    },
                );

                await Job.update(
                    { paid: true },
                    {
                        transaction: t,
                        where: { id: jobId },
                    },
                );
            });
            res.send('Ok')
        } catch (error) {
            res.status(500).send('An error occurred while paying this job, please try again.')
        }
    })
}

module.exports = jobsRoutes