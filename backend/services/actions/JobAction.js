// services/actions/JobAction.js
const BaseAction = require('./BaseAction');

class JobAction extends BaseAction {
  static get config() {
    return {
      required: ['name', 'email', 'job_id'],
      optional: ['phone', 'coverLetter', 'resume'],
      endpoint: '/job-applications',
      steps: ['Personal info', 'Job selection', 'Submit']
    };
  }

  // ============================================
  // JOB BROWSING METHODS (Information - No Form)
  // ============================================

  /**
   * Get all jobs with optional filters
   */
  async getJobs(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.level) params.append('level', filters.level);
      if (filters.location) params.append('location', filters.location);
      if (filters.country) params.append('country', filters.country);
      if (filters.salary) params.append('salary', filters.salary);

      const queryString = params.toString();
      const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
      
      const response = await this.api.get(endpoint);
      
      return {
        success: true,
        data: response.data || response,
        count: response.data?.length || response?.length || 0
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return {
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get single job by ID
   */
  async getJobById(jobId) {
    try {
      const response = await this.api.get(`/jobs/${jobId}`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error(`Error fetching job ${jobId}:`, error);
      return {
        success: false,
        message: 'Job not found',
        error: error.message
      };
    }
  }

  /**
   * Get jobs by country
   */
  async getJobsByCountry(country) {
    try {
      const response = await this.api.get(`/jobs/country/${encodeURIComponent(country)}`);
      return {
        success: true,
        data: response.data || response,
        country: country
      };
    } catch (error) {
      return {
        success: false,
        message: `No jobs found in ${country}`,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get filter options for jobs
   */
  async getFilterOptions() {
    try {
      const response = await this.api.get('/jobs/filter-options');
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch filter options',
        error: error.message
      };
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats() {
    try {
      const response = await this.api.get('/jobs/stats');
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch job statistics',
        error: error.message
      };
    }
  }

  /**
   * Search jobs by keyword
   */
  async searchJobs(keyword) {
    try {
      const allJobs = await this.getJobs();
      if (!allJobs.success) return allJobs;

      const searchTerm = keyword.toLowerCase();
      const filtered = allJobs.data.filter(job => 
        job.title?.toLowerCase().includes(searchTerm) ||
        job.description?.toLowerCase().includes(searchTerm) ||
        job.requirements?.toLowerCase().includes(searchTerm) ||
        job.level?.toLowerCase().includes(searchTerm) ||
        job.location?.toLowerCase().includes(searchTerm)
      );

      return {
        success: true,
        data: filtered,
        count: filtered.length,
        keyword: keyword
      };
    } catch (error) {
      return {
        success: false,
        message: 'Search failed',
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get jobs by experience level
   */
  async getJobsByLevel(level) {
    return this.getJobs({ level });
  }

  /**
   * Get jobs by location type
   */
  async getJobsByLocation(location) {
    return this.getJobs({ location });
  }

  // ============================================
  // JOB APPLICATION METHODS (Action - Needs Form)
  // ============================================

  /**
   * Submit job application
   */
  async submit(data) {
    const errors = this.validateBasic(data);
    if (errors.length > 0) {
      return { 
        success: false, 
        message: errors.join(', '), 
        errors 
      };
    }

    try {
      // Handle FormData for file uploads
      let payload;
      
      if (data.resume instanceof File || data.resume instanceof Blob) {
        payload = new FormData();
        payload.append('job_id', data.job_id || data.jobId);
        payload.append('name', data.name || data.fullName);
        payload.append('email', data.email.toLowerCase().trim());
        payload.append('phone', data.phone || '');
        payload.append('coverLetter', data.coverLetter || data.cover_letter || '');
        payload.append('resume', data.resume);
      } else {
        payload = {
          job_id: data.job_id || data.jobId,
          name: data.name || data.fullName,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || '',
          cover_letter: data.coverLetter || data.cover_letter || ''
        };
      }

      const response = await this.api.post('/job-applications', payload);

      return {
        success: true,
        message: this.getSuccessMessage(data),
        data: response
      };
    } catch (error) {
      console.error('Job application submission error:', error);
      return {
        success: false,
        message: `Failed to submit application: ${error.message}`,
        error
      };
    }
  }

  getSuccessMessage(data) {
    const name = data.name || data.fullName;
    return `✅ **Application Submitted Successfully!**

Thank you ${name}! Your job application has been received.

📧 We'll review your application and contact you at **${data.email}** within 5-7 business days.

Good luck! 🍀`;
  }

  // ============================================
  // FORMATTING METHODS
  // ============================================

  /**
   * Format single job for display
   */
  formatJob(job) {
    if (!job) return 'Job information not available.';

    let formatted = `**${job.title}**\n`;
    formatted += `📍 Location: ${job.location || 'Not specified'}`;
    if (job.country) formatted += ` - ${job.country}`;
    formatted += '\n';
    
    if (job.level) formatted += `👔 Level: ${job.level}\n`;
    if (job.salary) formatted += `💰 Salary: ${job.salary}\n`;
    
    formatted += '\n';
    
    if (job.description) {
      formatted += `**Description:**\n${job.description}\n\n`;
    }
    
    if (job.requirements) {
      formatted += `**Requirements:**\n${job.requirements}\n\n`;
    }
    
    if (job.lastDate) {
      const deadline = new Date(job.lastDate);
      const isExpired = deadline < new Date();
      formatted += `📅 Application Deadline: ${deadline.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
      formatted += isExpired ? ' ⚠️ (EXPIRED)' : ' ✅ (OPEN)';
      formatted += '\n';
    }

    return formatted;
  }

  /**
   * Format multiple jobs list
   */
  formatJobsList(jobs, title = 'Available Jobs') {
    if (!jobs || jobs.length === 0) {
      return 'No jobs available at the moment. Check back soon!';
    }

    let formatted = `💼 **${title}** (${jobs.length})\n\n`;

    jobs.forEach((job, index) => {
      formatted += `**${index + 1}. ${job.title}**\n`;
      formatted += `   📍 ${job.location || 'Remote'}`;
      if (job.country) formatted += ` - ${job.country}`;
      formatted += '\n';
      
      if (job.level) formatted += `   👔 ${job.level}\n`;
      if (job.salary) formatted += `   💰 ${job.salary}\n`;
      
      if (job.description) {
        const shortDesc = job.description.length > 100 
          ? job.description.substring(0, 100) + '...'
          : job.description;
        formatted += `   📝 ${shortDesc}\n`;
      }
      
      if (job.lastDate) {
        const deadline = new Date(job.lastDate);
        const isOpen = deadline >= new Date();
        formatted += `   📅 Deadline: ${deadline.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })} ${isOpen ? '✅' : '⚠️'}\n`;
      }
      
      formatted += '\n';
    });

    formatted += '\n💡 Want to apply for a specific position? Just let me know the job number or title!';

    return formatted;
  }

  /**
   * Format job with apply prompt
   */
  formatJobWithApplyPrompt(job) {
    let formatted = this.formatJob(job);
    formatted += '\n\n💡 **Interested in applying?** Just say "I want to apply" and I\'ll help you with the application!';
    return formatted;
  }

  /**
   * Format jobs by category
   */
  formatJobsByCategory(jobs) {
    const categorized = {
      'Entry Level': [],
      'Mid-level': [],
      'Senior': [],
      'Other': []
    };

    jobs.forEach(job => {
      const level = job.level || 'Other';
      if (categorized[level]) {
        categorized[level].push(job);
      } else {
        categorized['Other'].push(job);
      }
    });

    let formatted = '💼 **Jobs by Experience Level**\n\n';

    Object.entries(categorized).forEach(([level, levelJobs]) => {
      if (levelJobs.length > 0) {
        formatted += `**${level}** (${levelJobs.length})\n`;
        levelJobs.forEach(job => {
          formatted += `• ${job.title}`;
          if (job.location) formatted += ` - ${job.location}`;
          formatted += '\n';
        });
        formatted += '\n';
      }
    });

    return formatted;
  }
}

module.exports = JobAction;