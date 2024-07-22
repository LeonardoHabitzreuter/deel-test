const model = require('#src/model');

module.exports = async () => {
    await model.Job.destroy({ truncate: true });
    await model.Contract.destroy({ truncate: true });
    await model.Profile.destroy({ truncate: true });
}