import React from 'react';
import Hero from './Hero';
import Main from './Main';
import FollowACEF from '../../pages/FollowAcef'; // Import your theme hook

import CompanyLocationsMap from '../CompanyLocationsMap'

import Header from '../../components/Header'; // ✅ Correct path to Header.jsx
import Footer from '../../components/Footer'; // ✅ Correct path to Header.jsx

const ContactUs = () => {
  return (
    <>
      <Header />         {/* ✅ Header appears at the top */}
    
      <Hero />
      
      <Main />

      <FollowACEF/>
<CompanyLocationsMap/>


      <Footer />         {/* ✅ Header appears at the top */}

    </>
  );
};

export default ContactUs;
