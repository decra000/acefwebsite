import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const JobApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume: null,
    coverLetter: '',
    cv: null, // Added CV state
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'resume' || name === 'cv' ? e.target.files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form submission logic (e.g., API call) can be added here

    setSnackbarMessage('Application submitted successfully!');
    setOpenSnackbar(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      resume: null,
      coverLetter: '',
      cv: null, // Reset CV after submission
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', p: 4, boxShadow: 3, borderRadius: '8px', backgroundColor: '#fff' }}>
      <Typography variant="h4" gutterBottom>
        Job Application Form
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          margin="normal"
          required
        />
        
        <input
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          required
          style={{ margin: '20px 0' }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload your resume (PDF or Word document).
        </Typography>

        <input
          type="file"
          name="cv"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          required
          style={{ margin: '20px 0' }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload your CV (PDF or Word document).
        </Typography>

        <TextField
          fullWidth
          label="Cover Letter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          multiline
          rows={4}
          margin="normal"
        />
        
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Submit Application
        </Button>
      </form>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobApplicationForm;
