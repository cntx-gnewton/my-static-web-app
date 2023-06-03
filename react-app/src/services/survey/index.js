// Filename: src/services/survey/index.js

import {  createSurvey } from './survey';

function useSurvey() {
  return {
    createSurvey: createSurvey,
  }
};

export {
    useSurvey,
}