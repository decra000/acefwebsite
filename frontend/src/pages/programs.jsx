import React, { useState, useEffect, useRef } from 'react';
import './programs.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgrammePillarsSection from '../pages/programSlide';
import CrossCuttingStrategies from '../pages/CrossCuttingStrategies';
import ACEFDashboard from '../pages/AboutUs/strategicplan';

import JoinMovement from '../pages/JoinMovement'; 

const Programs = () => {
  const [activeProgram, setActiveProgram] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timelineActiveIndex, setTimelineActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const timeline = [
    { year: "2025", title: "Foundation", description: "Launch pilot projects across 14 African countries" },
    { year: "2027", title: "Scale-Up", description: "Expand networks and establish Green Energy Hubs" },
    { year: "2030", title: "Impact", description: "Continental reach with integrated solutions" }
  ];

  return (
    <div className="programs-page">
      {/* Progress Indicator */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
<Header/>
    <ProgrammePillarsSection/>

 

<CrossCuttingStrategies/>
<ACEFDashboard/>
      {/* Horizontal Timeline */}
      <section className="timeline">
        <div className="container">
          <h2>Implementation Roadmap</h2>
          <p className="section-subtitle">Our 5-year journey to environmental transformation</p>
          
          <div className="timeline-container">
            <div className="timeline-track">
              <div className="timeline-progress" style={{ width: `${((timelineActiveIndex + 1) / timeline.length) * 100}%` }}></div>
            </div>
            
            <div className="timeline-items">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`timeline-item ${timelineActiveIndex === index ? 'active' : ''}`}
                  onClick={() => setTimelineActiveIndex(index)}
                >
                  <div className="timeline-dot">
                    <span>{item.year}</span>
                  </div>
                  <div className="timeline-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
<JoinMovement/>
      <Footer/>
    </div>
  );
};

export default Programs;