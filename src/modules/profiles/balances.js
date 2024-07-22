const { sumBy } = require('#utils/array')
const { getUnpaidJobsByUser } = require('#services/jobsService')

const getDepositLimit = (jobs) => (
    sumBy(x => x.price, jobs) / 4
)

const balancesRoutes = (app) => {
    app.post('/balances/deposit/:userId', async (req, res) =>{
        const models = req.app.get('models')
        const userId = +req.params.userId
        const deposit = req.body.deposit
        
        try {
            const profile = await models.Profile.findOne({ where: { id: userId } })

            if (!profile) {
                return res.status(404).send("We couldn't find this user, try again with a different id")
            }

            if (profile.type !== 'client') {
                return res.status(401).send('Only clients can deposit money!')
            }
    
            const jobs = await getUnpaidJobsByUser(models, userId)
            if (jobs.length && (deposit > getDepositLimit(jobs))) {
                return res.status(400).send("You can't deposit more than 25% of your total of jobs to pay!")
            }

            await models.Profile.increment({ balance: deposit }, { where: { id: userId } });
            res.json('Ok')
        } catch (error) {
            res.status(500).send('An error occurred while depositing money, please try again.')
        }
    })
}

module.exports = balancesRoutes