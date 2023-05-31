// Filename: src/services/survey/index.js

import { sendDataToServer, createSurvey } from './survey';

function useSurvey() {
  return {
    sendDataToServer: sendDataToServer,
    createSurvey: createSurvey,
  }
};

export {
    useSurvey,
}