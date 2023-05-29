// ./pages/Profile.js
import React, { useRef } from 'react';
import ProductTable from '../products/ProductTable'; 
import { useStore } from '../store';
import { userDB, runProductPipeline } from '../services';
  
const Profile = () => {
  const {  productActions, productCount, userInfo  } = useStore();
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
