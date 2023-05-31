// Filename: src/services/survey/survey.js

import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { setShowSurvey } from 'survey-react-ui';

const surveyJson = {
  elements: [{
    name: 'FirstName',
    title: 'Enter your first name:',
    type: 'text'
  }, {
    name: 'LastName',
    title: 'Enter your last name:',
    type: 'text'
  }]
};

export const sendDataToServer = (survey) => {
  //send Ajax request to your web server.
  console.log('The results are:' + JSON.stringify(survey.data));
  setShowSurvey(false); // Hide the survey after it's been submitted
};

export function createSurvey() {
  const model = new Model(surveyJson);
  return model;
}