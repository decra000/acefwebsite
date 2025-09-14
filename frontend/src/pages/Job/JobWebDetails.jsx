import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Divider } from '@mui/material';
import { useMediaQuery } from '@mui/material'; 
import { useState } from 'react';
import JobApplicationForm from './JobApplicationForm'; // Import your JobForm component

const JobWebDetails = ({ jobs }) => {
  const { id } = useParams(); // Get the job id from the URL
  const job = jobs ? jobs.find((job) => job.id === id) : null; // Find the job by matching the id as a string
  
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const [showForm, setShowForm] = useState(false); // State to control form visibility

  if (!job) {
    return (
      <Box sx={{ padding: '2rem', textAlign: 'center' }}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ margin: '4rem auto', maxWidth: '800px' }}>
      <Box
        sx={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white',
          padding: '2rem',
          textAlign: 'center',
          minHeight: isMobile ? '20vh' : '30vh',
          position: 'relative',
        }}
      >
        <Typography variant="h5" gutterBottom align="center" marginTop={15}>
          Job Details
        </Typography>
      </Box>

      <Box sx={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {job.role}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Level: {job.level} | Salary: {job.salary}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Application End Date: {new Date(job.endDate).toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Role Requirements
        </Typography>
        <Typography variant="body1" gutterBottom>
          {job.requirements}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Job Description
        </Typography>
        <Typography variant="body1" gutterBottom>
          {job.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 2, textTransform:'none' }}
          onClick={() => setShowForm(!showForm)} // Toggle form visibility
        >
          {showForm ? 'Cancel' : 'Apply Now'}
        </Button>

        {showForm && <JobApplicationForm />} {/* Render JobForm if showForm is true */}
      </Box>
    </Box>
  );
};

export default JobWebDetails;
