const model = require('#src/model');

module.exports = async () => {
    await model.Profile.sync({ force: true });
    await model.Contract.sync({ force: true });
    await model.Job.sync({ force: true });
}