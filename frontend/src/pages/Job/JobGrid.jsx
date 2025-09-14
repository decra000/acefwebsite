import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Pagination,
} from '@mui/material';
import { Link } from 'react-router-dom'; // Keep Link for navigation

const JobGrid = ({ jobs = [], jobsPerPage = 6 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the index of the first and last jobs on the current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Available Jobs
      </Typography>
      <Grid container spacing={3}>
        {currentJobs.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job.id}> {/* Use job.id as key */}
            <Card sx={{ backgroundColor: '#f5f5f5', boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {job.role}
                </Typography>
                <Typography color="text.secondary" sx={{ marginTop: '0.5rem' }}>
                  Application Deadline: {new Date(job.endDate).toLocaleDateString()}
                </Typography>
                <Typography color="text.secondary" sx={{ marginTop: '0.5rem' }}>
                  Level: {job.level}
                </Typography>
              </CardContent>
              <CardActions>
                <Link to={`/job/${job.id}`} style={{ textDecoration: 'none', flexGrow: 1 }}>
                  <Button size="small" variant="contained" color="primary">
                    Apply Now
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <Pagination
          count={Math.ceil(jobs.length / jobsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default JobGrid;
