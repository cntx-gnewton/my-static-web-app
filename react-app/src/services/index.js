// ./services/index.js

import {
  runProductPipeline,
  getUserAuthInfo, 
} from './api';
 
import {
  DatabaseClient,
  databaseConfigs,
} from './database';

const userDB = new DatabaseClient(databaseConfigs.user);

function userServices() {
  return {
    api: {
      getUserAuthInfo: getUserAuthInfo,
      runProductPipeline: runProductPipeline
    },
    db: userDB,
  }
};

export {
  userServices,
  getUserAuthInfo,
  runProductPipeline,
  userDB,
}