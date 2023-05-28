// ./services/index.js

import { getUserInfo, runSNPPipeline } from './handlers.js';
import { config } from './cosmos.config';
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
    getUserInfo: userDB.getUserInfoById,
    getUserProductsById: userDB.getUserProductsById,
    addUserProducts: userDB.addUserProducts,
  };
}

export {
    useCosmos,
    userDB,
    getUserInfo,
    runSNPPipeline,
}