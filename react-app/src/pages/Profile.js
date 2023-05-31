// ./pages/Profile.js
import React, { useRef, useCallback } from 'react';
import ProductTable from '../products/ProductTable'; 
import { useStore, useSurvey, useApi, useUserDB  } from '../services';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';

const Profile = () => {
  // Store
  const { dispatchers, selectors } = useStore();
  const { productActions } = dispatchers();
  const { productCount, userInfo } = selectors();
  // API
  const { runProductPipeline } = useApi();
  // Survey
  const { sendDataToServer, createSurvey } = useSurvey();
  // Database
  const { userDB } = useUserDB();


  // Survey - Initialization
  const surveyModel = createSurvey();
  const handleSurveyCompletion = useCallback((sender) => {
    sendDataToServer(sender);
  }, []);
  surveyModel.onComplete.add(handleSurveyCompletion);

  // API Pipeline - File Upload
  const fileInputRef = useRef(null);
  const openFilePicker = () => {
    fileInputRef.current.click();
  };
  const handleFileUpload = async (event) => {
    console.log('handleFileUpload')
    const files = event.target.files;
    if (files.length > 0) {
        const file = files[0];
      const products = await runProductPipeline(file);
      console.log(`handleFileUpload: id: ${userInfo.id} products ${products}`)
      await userDB.pushProducts(userInfo.id, products);
      await productActions.push(userInfo.id, products);
      console.log('handleFileUpload: pushed')
    } else {
        alert('Please select a file first...');
    }
  };

  return (
    <div className="content-container">
      { !productCount && (
        <>
          <div className="content-title-group not-found">
            <h2 className="title">Welcome {userInfo && userInfo.userDetails}!</h2>
            <p>
              Congratulations on taking the first step towards a healthier you! We are excited to help you on your journey
            </p>
            <br />
            <h2 className='title'>Step 1. Questionnaire.</h2>
            <p>
              This is a 5 minute questionnaire that will help us understand your health goals and needs. We will use this
            </p>
            <Survey model={surveyModel} />
            <br />
            <h2 className='title'>Step 2. SNP Analysis Pipeline</h2>
            <div>
              <p>Upload your 23andme genome file below.</p>
              <br />
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <button onClick={openFilePicker}>Upload</button>     
            </div>
          </div>
        </>
      )}     
      <ProductTable />
    </div>
  );
};

export default Profile;
