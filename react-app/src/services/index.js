import { handleFileUploaded } from './api.userProducts';
import { getUserInfo } from './api.userInfo';
import { config } from './cosmos.config';
import * as userDB from './cosmos.services';

function useServices() {
  return {
    userDB: userDB,
    userInfo: getUserInfo,
    userProducts: handleFileUploaded,
    config: config,
  };
}

export {
    useServices,
    userDB,
    getUserInfo,
    handleFileUploaded,
}