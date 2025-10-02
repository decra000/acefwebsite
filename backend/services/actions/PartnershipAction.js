
// services/actions/PartnershipAction.js
const BaseAction = require('./BaseAction');

class PartnershipAction extends BaseAction {
  static get config() {
    return {
      // Minimal requirements - chatbot collects everything
      required: ['name', 'email'],
      optional: ['organization', 'country', 'expertise', 'collaborationIdea'],
      endpoint: '/collaboration/submit',
      steps: ['Chatbot handles collection']
    };
  }

  async submit(data) {
    try {
      // Your chatbot already prepared everything in the correct format
      // Just pass it through to your existing endpoint
      const submissionData = {
        flowType: data.flowType || 'partner',
        formData: data.formData || data,
        additionalData: data.additionalData || {
          submissionMethod: 'chatbot',
          completionTime: data.completionTime || null,
          questionHistory: data.questionHistory || []
        }
      };

      const response = await this.api.post('/collaboration/submit', submissionData);

      if (response.success) {
        return {
          success: true,
          message: this.getSuccessMessage(data),
          data: response.data
        };
      }

      throw new Error(response.message || 'Submission failed');
    } catch (error) {
      console.error('Partnership submission failed:', error);
      return {
        success: false,
        message: `Failed to submit: ${error.message}`,
        error
      };
    }
  }

  getSuccessMessage(data) {
    const formData = data.formData || data;
    const name = formData.fullName || formData.name || 'there';
    
    return `✅ **Partnership Request Submitted!**

Thank you ${name}! Your partnership inquiry has been received.

📧 Our team will review your proposal and contact you within 2-3 business days.

**Reference ID:** ${data.collaborationId || 'Pending'}`;
  }
}

module.exports = PartnershipAction;
