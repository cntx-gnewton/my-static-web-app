// Survey.js
import React, { useCallback } from 'react';
import { Survey } from 'survey-react-ui';
import { useStore, useSurvey } from '../services';
import { useHistory } from 'react-router-dom';

const SurveyPage = () => {
  // Store
  const { dispatchers, selectors } = useStore();
  const { surveyActions } = dispatchers;
  const { userInfo, userId } = selectors;
  // Survey
  const { createSurvey } = useSurvey();

  // History
  const history = useHistory();

  // Survey - Initialization
  const surveyModel = createSurvey();
  
  const handleSurveyCompletion = useCallback((sender) => {
    console.log(`handleSurveyCompletion ${userId} ${userInfo['id']} ${userInfo}`)
    
    try { surveyActions.push(sender.data, userInfo['id']); } // push survey data to server
    catch (error) { console.log(error); }
    console.log(`Survey data pushed to server and set in store ${sender.data}`)
    surveyActions.show() // hide survey
    console.log(`Survey hidden`)
    history.push('/profile'); // redirect to profile page
    console.log(`Redirected to profile page`)
  }, [ history]);

  surveyModel.onComplete.add(handleSurveyCompletion);

  return (
    <div className="content-container">
      <h2 className='title'>Step 1. Questionnaire.</h2>
      <p>
        This is a 5 minute questionnaire that will help us understand your health goals and needs. We will use this
      </p>
      <Survey model={surveyModel} />
    </div>
  );
};

export default SurveyPage;
