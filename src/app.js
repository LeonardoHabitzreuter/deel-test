const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.use(getProfile)
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

require('./modules/admin')(app)
require('./modules/contracts')(app)
require('./modules/contracts/jobs')(app)
require('./modules/profiles/balances')(app)

module.exports = app;
