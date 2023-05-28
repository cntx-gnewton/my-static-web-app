// ./pages/Profile.js
import React, { useRef } from 'react';
import ProductTable from '../products/ProductTable'; 
import { useStore } from '../store';

const Profile = () => {
  const { userInfo, userProducts, generateUserProducts } = useStore();

  const fileInputRef = useRef(null);

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        const file = files[0];
        // Emit the fileUploaded event
        // const products = await handleUserProducts(file);
        console.log('userSNP file inputted')
        generateUserProducts(userInfo, file);
    } else {
        alert('Please select a file first...');
    }
  };

  return (
    <div className="content-container">
      {!userProducts.length && (
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
