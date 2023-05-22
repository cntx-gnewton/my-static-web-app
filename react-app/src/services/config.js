require('dotenv').config();

var config = {}

config.endpoint = process.env.COSMOS_ENDPOINT;
config.key = process.env.COSMOS_KEY;

config.database = {
  id: 'MyTestPersonDatabase'
}

config.container = {
  id: 'MyTestPersonContainer'
}

module.exports = config
