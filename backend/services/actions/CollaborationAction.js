// services/actions/CollaborationAction.js  
const BaseAction = require('./BaseAction');

class CollaborationAction extends BaseAction {
  static get config() {
    return {
      required: ['name', 'email'],
      optional: ['organization', 'country', 'expertise', 'collaborationIdea'],
      endpoint: '/collaboration/submit',
      steps: ['Chatbot handles collection']
    };
  }

  async submit(data) {
    try {
      const submissionData = {
        flowType: data.flowType || 'collaborate',
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
      console.error('Collaboration submission failed:', error);
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
    
    return `✅ **Collaboration Request Submitted!**

Thank you ${name}! Your collaboration proposal has been received.

📧 Our team will review your request and contact you within 2-3 business days.

**Reference ID:** ${data.collaborationId || 'Pending'}`;
  }
}

module.exports = CollaborationAction;