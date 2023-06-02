// Filename: src/services/survey/survey.js

import { Model } from 'survey-core';
import { useUserDB } from '../database';
import { questionnaire } from './model';

export const sendDataToServer = async (survey, surveyActions, userId) => {
  const data = survey.data; // Prepare data
  const { userDB } = useUserDB(); // Send data to server
  console.log(`data | ${data} | ${userDB} | ${userId}`);
  try {
    await userDB.pushSurveyData(userId, data);
    // Replace 'userId' with the actual user id
    surveyActions.show(); // example action
  }
  catch (error) {
    console.error(`Error pushing survey data for user ${userId}:`, error);
  }

};

export function createSurvey() {
  const model = new Model(questionnaire);
  return model;
}