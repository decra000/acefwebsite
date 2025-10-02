// services/actions/JobAction.js
const BaseAction = require('./BaseAction');

class JobAction extends BaseAction {
  static get config() {
    return {
      required: ['fullName', 'email', 'position'],
      optional: ['phone', 'coverLetter', 'experience'],
      endpoint: '/job-applications',
      steps: ['Personal info', 'Position details', 'Submit']
    };
  }

  async getJobs(filters = {}) {
    return this.api.get('/jobs', filters);
  }

  async getJobById(jobId) {
    return this.api.get(`/jobs/${jobId}`);
  }

  async getFilterOptions() {
    return this.api.get('/jobs/filter-options');
  }

  async submit(data) {
    const errors = this.validateBasic(data);
    if (errors.length > 0) {
      return { success: false, message: errors.join(', '), errors };
    }

    try {
      const payload = {
        job_id: data.jobId || 1,
        name: data.fullName || data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone || '',
        position: data.position,
        cover_letter: data.coverLetter || '',
        experience: data.experience || '',
        location: data.location || ''
      };

      const response = await this.api.post('/job-applications', payload);

      return {
        success: true,
        message: this.getSuccessMessage(data),
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to submit: ${error.message}`,
        error
      };
    }
  }

  getSuccessMessage(data) {
    return `✅ **Application Submitted!**

Thank you ${data.fullName || data.name}! Your application for **${data.position}** has been received.

📧 We'll review your application and contact you at **${data.email}** within 5-7 business days.`;
  }
}

module.exports = JobAction;