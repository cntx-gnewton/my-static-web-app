import DatabaseClient from './client';
import { databaseConfigs } from './configs';

function useUserDB() {
  return {
    userDB: new DatabaseClient(databaseConfigs.user),
  }
};

export {
    useUserDB,
}