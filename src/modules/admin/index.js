const { Op } = require('sequelize')
const { sum, sumBy, sortBy, groupAndFormat } = require('#utils/array')
const { sequelize } = require('#src/model')

const groupByProfession = x => x._previousDataValues.profession
const sumByJobsPrice = (prev, contract) => sumBy(job => job.price, contract.Jobs) + (prev || 0)

const adminRoutes = (app) => {
    app.get('/admin/best-profession', async (req, res) =>{
        const {Contract, Job, Profile} = req.app.get('models')
        const { start, end } = req.query
        const paymentDate = (start && end) ? {[Op.between]: [start, end]} : undefined

        try {
            const contracts = await Contract.findAll({
                attributes: ['id', [sequelize.col('Contractor.profession'), 'profession']],
                include: [{
                    model: Profile,
                    as: 'Contractor',
                    attributes: []
                }, {
                    attributes: ['price'],
                    model: Job,
                    where: paymentDate ? { paid: true, paymentDate } : { paid: true },
                }]
            })
    
            if (!contracts.length || contracts.every(x => !x.Jobs.length)) {
                return res.json("We couldn't calculate the best profession in this period, try again with a different date")
            }

            const professions = groupAndFormat(
                groupByProfession,
                sumByJobsPrice,
                contracts
            )
            const [bestProfession, amountPaid] = sortBy(
                x => x[1],
                Object.entries(professions)
            ).shift()
            
            res.json(`The best profession is: ${bestProfession}, with the total of $${amountPaid} in paid jobs`)
        } catch (error) {
            res.status(500).send(error.message)
        }
    })

    app.get('/admin/best-clients', async (req, res) => {
        const {Contract, Job, Profile} = req.app.get('models')
        const { start, end, limit = 2 } = req.query
        const paymentDate = (start && end) ? {[Op.between]: [start, end]} : undefined

        try {
            const profiles = await Profile.findAll({
                attributes: ['id', 'firstName', 'lastName'],
                where: { type: 'client' },
                include: {
                    attributes: ['id'],
                    as: 'Client',
                    model: Contract,
                    include: {
                        attributes: ['price'],
                        model: Job,
                        where: paymentDate ? { paid: true, paymentDate } : { paid: true },
                    }
                }
            })

            const clients = profiles.map(x => ({
                id: x.id,
                fullName: x.fullName,
                paid: sum(x.Client.flatMap(contract => sumBy(job => job.price, contract.Jobs)))
            }))

            const sortedClients = sortBy(x => x.paid, clients).slice(0, limit)
            res.json(sortedClients)
        } catch (error) {
            res.status(500).send(error.message)
        }
    })
}

module.exports = adminRoutes
