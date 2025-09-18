import React from 'react';
import { useTheme } from '../theme';
import { Link } from 'react-router-dom';
import '../styles/JoinMovement.css';


const JoinMovement = () => {
  const { theme, colors } = useTheme();

  return (
    <section className="join-movement" data-theme={theme.name}>
      <div className="join-movement__texture-overlay"></div>
      <div className="join-movement__container">
        <div className="join-movement__content">
          
          <h2 className="join-movement__title">
            Shape Africa's Sustainable Future
          </h2>
          <p className="join-movement__description">
            Join industry leaders, policymakers, and innovators in driving transformative 
            change across the continent. Your partnership creates lasting impact.
          </p>

          <div className="join-movement__actions">
            <Link 
              to="/get-involved" 
              className="join-movement__button join-movement__button--primary"
            >
              <span>Join Us</span>
              <svg className="join-movement__button-icon" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link 
              to="/about-us" 
              className="join-movement__button join-movement__button--secondary"
            >
              <span>Learn More</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinMovement;