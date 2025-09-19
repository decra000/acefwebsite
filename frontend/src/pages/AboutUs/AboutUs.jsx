import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PartnerSlider from '../../components/PartnerSlider'; 
import TeamSection from './TeamSection';
import '../../styles/AboutUs.css';
import JoinMovement from '../../components/JoinMovement'; 
import MissionVision from './MissionVision';
import CoreValues from './coreValues';
import FounderSection from './FounderSection';
import VisionObjectives2050 from './objectives';
import Timeline from './Timeline';

const AboutUs = () => {
  return (
    <div>
      <Header />

      <FounderSection />
      <MissionVision />
      <VisionObjectives2050 />
      <Timeline />
      <TeamSection />
      <CoreValues />
      <PartnerSlider />
      <JoinMovement />

      <Footer />
    </div>
  );
};

export default AboutUs;
