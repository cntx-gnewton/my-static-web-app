// ./pages/Profile.js

import React, { useRef, useEffect } from 'react'; // Import useEffect
import ProductTable from '../products/ProductTable'; 
import { handleFileUploaded, userDB } from '../services';
import { useManage } from '../store';

const Profile = () => {
  const { setProducts, userInfo, userProducts } = useManage();
  const fileInputRef = useRef(null);

  const openFilePicker = () => {
  fileInputRef.current.click();
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        const file = files[0];
        // Emit the fileUploaded event
        handleFileUploaded(file, setProducts);
    } else {
        alert('Please select a file first...');
    }
  };
  const logUserInfo = () => {
    console.log(userInfo);
  }
  const logUserProducts = () => {
    console.log(userProducts);
  }
  const logFetchUser = () => {
    // fetchUserData();
    console.log(userInfo);
    console.log(userProducts);
  }
  // const handleCreateUser = () => {
    // Replace these values with the actual user id, user name, and products
    // const userId = userInfo.userId;
    // const userName = userInfo.userDetails;
    // const products = userProducts;
    // userDB.createUserWithProducts(userId, userName, products);
  // };



  useEffect(() => {
    // Fetch the user's data when the component is mounted
    const fetchUserData = async () => {
      if (userInfo && userInfo.userId && userProducts.length === 0) {
        const user = await userDB.getUserById(userInfo.userId);
        console.log(user.userDetails);  
        if (user && user.products) {
          // Set the user's products in your state
          console.log(user.products); 
          setProducts(user.products);
        }
      }
    };
    fetchUserData();
  }, [userInfo, setProducts, userProducts]);

  return (
    <div className="content-container">
      <button onClick={logUserInfo}>Log User Info</button> <button onClick={logUserProducts}>Log Products</button>
      {/* <button onClick={handleCreateUser}>Create User and Products</button> */}
      <button onClick={logFetchUser}>Log Fetch User</button>
      <br />
      <br />
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