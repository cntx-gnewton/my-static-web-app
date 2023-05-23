import React from 'react';
import { useSelector } from 'react-redux'; 

const About = () => {
  const userInfo = useSelector(state => state.userInfo);

  return (
    <div className="content-container">
      <div className="content-title-group not-found">
        <h2 className="title">Product Wish List</h2>
        <p>
          This project was created to help represent a fundamental app written
          with React. The shopping theme is used throughout the app.
        </p>
        <br />
        <h2 className="title">Resources</h2>
        <ul>
          <li>
            <a href="https://github.com/MicrosoftDocs/mslearn-staticwebapp">
              Code in GitHub
            </a>
          </li>
        </ul>
        <div>
          <p>User Details: {userInfo && userInfo.userDetails}</p>
        </div>
      </div>
    </div>
  );
};

export default About;
