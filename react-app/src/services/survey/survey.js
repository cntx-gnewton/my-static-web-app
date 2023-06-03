// Filename: src/services/survey/survey.js

import { Model } from 'survey-core';
import { questionnaire } from './model';

export function createSurvey() {
  const model = new Model(questionnaire);
  return model;
}