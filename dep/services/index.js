// ./services/index.js

import { getUserInfo, runSNPPipeline } from './handlers.js';
import { config } from './databaseConfig.user';
import DatabaseClient from './databaseClient.js';
import * as userDB from './cosmos.services';  

function useCosmos() {
  return {
    userDB: userDB,
    userInfo: getUserInfo,
    userPipeline: runSNPPipeline,
    config: config,
    createUser: userDB.createUser,
    createContainer: userDB.createContainer,
    createDatabase: userDB.createDatabase,
    deleteContainer: userDB.deleteContainer,
    deleteDatabase: userDB.deleteDatabase,
    deleteUser: userDB.deleteUser,
    getUserInfo: userDB.getUser,
    getProducts: userDB.getProducts,
    addUserProducts: userDB.addUserProducts,
  };
}

export {
  DatabaseClient,
  useCosmos,
  userDB,
  getUserInfo,
  runSNPPipeline,
}