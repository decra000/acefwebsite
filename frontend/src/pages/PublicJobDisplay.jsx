import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  TextField,
  Grid,
  Alert,
} from "@mui/material";
import { useTheme } from "../theme";
import { API_URL } from "../config";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PublicJobDisplay = () => {
  const { muiTheme, colors } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/jobs`);
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isDeadlinePassed = (deadline) =>
    deadline && new Date(deadline) < new Date();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    console.log(`Field changed: ${name}`, files ? files[0]?.name : value);
    
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    
    // Clear status when user makes changes
    if (submitStatus.message) {
      setSubmitStatus({ message: "", type: "" });
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.name.trim()) errors.push("Name is required");
    if (!form.email.trim()) errors.push("Email is required");
    if (!form.resume) errors.push("Resume file is required");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      errors.push("Please enter a valid email address");
    }
    
    // Check file size (5MB limit)
    if (form.resume && form.resume.size > 5 * 1024 * 1024) {
      errors.push("Resume file must be smaller than 5MB");
    }
    
    return errors;
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    
    if (!selectedJob) {
      setSubmitStatus({ message: "No job selected", type: "error" });
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSubmitStatus({ message: validationErrors.join(", "), type: "error" });
      return;
    }

    setSubmitting(true);
    setSubmitStatus({ message: "Submitting application...", type: "info" });

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("phone", form.phone.trim());
      formData.append("coverLetter", form.coverLetter.trim());
      formData.append("resume", form.resume);
      formData.append("job_id", selectedJob.id);

      console.log("Submitting to API:", `${API_URL}/job-applications`);

      const response = await axios.post(`${API_URL}/job-applications`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
        timeout: 30000,
      });

      console.log("API response:", response.data);

      if (response.data.success !== false) {
        setSubmitStatus({ message: "Application submitted successfully! We'll be in touch soon.", type: "success" });
        
        setTimeout(() => {
          setShowApplicationForm(false);
          setForm({
            name: "",
            email: "",
            phone: "",
            coverLetter: "",
            resume: null,
          });
          setSubmitStatus({ message: "", type: "" });
        }, 2000);
      } else {
        setSubmitStatus({ 
          message: response.data.error || "Failed to submit application. Please try again.", 
          type: "error" 
        });
      }

    } catch (error) {
      console.error("Error submitting application:", error);
      
      let errorMessage = "Error submitting application. Please try again.";
      
      if (error.response) {
        const serverError = error.response.data;
        if (serverError.error) {
          errorMessage = serverError.error;
        } else if (serverError.message) {
          errorMessage = serverError.message;
        }
        console.error("Server error:", serverError);
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection and try again.";
        console.error("Network error:", error.request);
      }
      
      setSubmitStatus({ message: errorMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowApplicationForm(false);
    setSelectedJob(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      coverLetter: "",
      resume: null,
    });
    setSubmitStatus({ message: "", type: "" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primaryLight} 100%)`,
      }}
    >
      {/* Header */}
      <Header />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          maxWidth: "1100px",
          mx: "auto",
          p: 4,
          width: "100%",
        }}
      >
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            textAlign: "center",
            fontWeight: 700,
            color: colors.secondary,
            mb: 4,
          }}
        >
          Available Jobs
        </Typography>

        {jobs.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center", color: colors.textSecondary }}>
            No jobs available right now.
          </Typography>
        ) : (
          jobs.map((job) => (
            <Card
              key={job.id}
              sx={{
                mb: 4,
                borderRadius: 4,
                background: `linear-gradient(145deg, ${colors.cardBg}, ${colors.accentLight})`,
                boxShadow: `0 8px 30px rgba(0,0,0,0.2)`,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px) scale(1.02)",
                  boxShadow: `0 12px 40px rgba(0,0,0,0.3)`,
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: colors.primary }}>
                  {job.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary, mb: 2 }}
                >
                  {job.location} • {job.level} • {job.salary || "Salary not specified"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {job.description}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    fontWeight: 500,
                    color: isDeadlinePassed(job.lastDate)
                      ? colors.error
                      : colors.success,
                  }}
                >
                  Deadline: {formatDate(job.lastDate)}
                </Typography>

                {!isDeadlinePassed(job.lastDate) && (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      mt: 3,
                      borderRadius: 3,
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                    }}
                    onClick={() => {
                      console.log("Apply button clicked for job:", job.id);
                      setSelectedJob(job);
                      setShowApplicationForm(true);
                    }}
                  >
                    Apply Now
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}

        {/* Application Modal - FIXED STRUCTURE */}
        <Modal
          open={showApplicationForm}
          onClose={closeModal}
          aria-labelledby="apply-job-title"
          aria-describedby="apply-job-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: muiTheme.palette.background.paper,
              boxShadow: 24,
              borderRadius: 3,
              p: 4,
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            {selectedJob && (
              <>
                <Typography id="apply-job-title" variant="h4" gutterBottom sx={{ fontWeight: 600, color: colors.primary }}>
                  Apply for {selectedJob.title}
                </Typography>

                {submitStatus.message && (
                  <Alert 
                    severity={submitStatus.type} 
                    sx={{ mb: 2 }}
                  >
                    {submitStatus.message}
                  </Alert>
                )}

                {/* FORM IS NOW PROPERLY STRUCTURED */}
                <Box component="form" onSubmit={handleSubmitApplication}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Cover Letter"
                        name="coverLetter"
                        value={form.coverLetter}
                        onChange={handleChange}
                        multiline
                        minRows={4}
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="outlined" 
                        component="label" 
                        fullWidth
                        disabled={submitting}
                      >
                        Upload Resume
                        <input
                          type="file"
                          name="resume"
                          hidden
                          accept=".pdf,.doc,.docx"
                          onChange={handleChange}
                          required
                        />
                      </Button>
                      {form.resume && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Selected: {form.resume.name}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                    <Button
                      onClick={closeModal}
                      sx={{ mr: 2 }}
                      color="secondary"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default PublicJobDisplay;