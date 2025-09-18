import React, { useState, useEffect, useRef } from 'react';
import '../../styles/programs.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProgrammePillarsSection from './programSlide';
import CrossCuttingStrategies from './CrossCuttingStrategies';
import ACEFDashboard from '../AboutUs/strategicplan';
import ProjectsDisplay from '../Projects/ProjectsDisplay';

import JoinMovement from '../../components/JoinMovement'; 

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
<ProjectsDisplay/>
<ACEFDashboard/>
<JoinMovement/>
      <Footer/>
    </div>
  );
};

export default Programs;