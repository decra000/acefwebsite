import React, { createContext, useContext, useState } from 'react';

// Create the donation context
const DonationContext = createContext();

// Custom hook to use the donation context
export const useDonation = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
};

// Donation Provider component
export const DonationProvider = ({ children }) => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const openDonationModal = () => {
    setIsDonationModalOpen(true);
  };

  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
  };

  const value = {
    isDonationModalOpen,
    openDonationModal,
    closeDonationModal
  };

  return (
    <DonationContext.Provider value={value}>
      {children}
    </DonationContext.Provider>
  );
};

export default DonationProvider;