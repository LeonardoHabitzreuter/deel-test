const { Op } = require('sequelize');

const contractsRoutes = (app) => {
    app.get('/contracts', async (req, res) =>{
        const {Contract} = req.app.get('models')
        const profileId = +req.get('profile_id')

        try {
            const contracts = await Contract.findAll({where: {
                status: { [Op.not]: 'terminated' },
                [Op.or]: [
                    { ContractorId: profileId },
                    { ClientId: profileId }, 
                ]
            }})
    
            res.json(contracts)
        } catch (error) {
            res.status(500).send('An error occurred while searching for your contracts, please try again.')
        }
    })
    
    app.get('/contracts/:id', async (req, res) =>{
        const {Contract} = req.app.get('models')
        const {id} = req.params
        const profileId = +req.get('profile_id')
        try {
            const contract = await Contract.findOne({where: {id}})
        
            if(!contract) {
                return res.status(404).send()
            }
            if(contract.ContractorId !== profileId && contract.ClientId !== profileId) {
                return res.status(401).send()
            }
            res.json(contract)
        } catch (error) {
            res.status(500).send('An error occurred while searching for your contract, please try again.')
        }
    })
}

module.exports = contractsRoutes