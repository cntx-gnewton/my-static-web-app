// require('dotenv').config();

var config = {}

config.endpoint = 'https://cntxsql.documents.azure.com:443/';
  // process.env.COSMOS_ENDPOINT;
config.key = 'jwfcBnHV4UTbU608w76OBGpoJje0mSVUwksfrFcoJFQCOsTf2ZY8JCXSowfyzqkwrxr2tr1VMHvjACDbQfhJKg==';
  // process.env.COSMOS_KEY;

config.database = {
  id: 'MyTestPersonDatabase'
}

config.container = {
  id: 'MyTestPersonContainer'
}

module.exports = config
