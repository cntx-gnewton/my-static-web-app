import React from 'react';
import { userDB } from '../services';

const Home = () => (
  <div className="home-container">
    <div className="home-title-group">
      <h1 className="home-title">COSNETIX</h1>
      <p className="home-motto">YOUR DNA, YOUR PERFECT SKINCARE MATCH</p>
      <div className='cosmos-buttons'>
        <button onClick={userDB.createDatabase}>
          Create CNTXUserDatabase
        </button> 
          <br />
          <br />
        <button onClick={userDB.createContainer}>
          Create CNTXUserContainer
        </button>
      </div>
    </div>
  </div>
);

export default Home;
