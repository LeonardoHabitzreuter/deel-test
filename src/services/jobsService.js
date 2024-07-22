const { Op } = require('sequelize');

const getUnpaidJobsByUser = (models, profileId) => (
    models.Job.findAll({
        where: { paid: { [Op.not]: true } },
        include: {
            attributes: [],
            model: models.Contract,
            where: {
                status: 'in_progress',
                [Op.or]: [
                    { ContractorId: profileId },
                    { ClientId: profileId }, 
                ]
            },
        }
    })
)

module.exports = { getUnpaidJobsByUser }
