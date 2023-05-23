import React, { useRef  } from 'react';
import { useSelector } from 'react-redux'; 

const Profile = () => {
  const userInfo = useSelector(state => state.userInfo);
  const fileInputRef = useRef(null);

  const openFilePicker = () => {
  fileInputRef.current.click();
  };

  const handleFileUploaded = (file) => {
    // Call your /api/newjob endpoint with the uploaded file here
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/newjob', {
        method: 'POST',
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('File uploaded and processed:', data);
    })
    .catch((error) => {
      console.error('Error uploading file:', error);
    });
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        const file = files[0];
        // Emit the fileUploaded event
        handleFileUploaded(file);
    } else {
        alert('Please select a file first...');
    }
  };

  return (
      <div className="content-container">
      <div className="content-title-group not-found">
        <h2 className="title">Welcome {userInfo && userInfo.userDetails}!</h2>
        <p>
          This project was created to help represent a fundamental app written
          with React. The shopping theme is used throughout the app.
        </p>
        <br />
        <h2 className="title">Step 1. Questionnaire.</h2>
        <ul>
          <li>
            <a href="https://github.com/MicrosoftDocs/mslearn-staticwebapp">
            </a>
          </li>
        </ul>
        <br />
        <h2 className="title">Step 2. SNP Analysis Pipeline</h2>      
        <div>
          <p> Upload your 23andme genome file below.</p>
          <br />
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            <button onClick={openFilePicker}>Upload</button>     
        </div>
      </div>
    </div>
  );
};

export default Profile;