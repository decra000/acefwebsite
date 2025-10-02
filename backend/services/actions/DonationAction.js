// services/actions/DonationAction.js
const BaseAction = require('./BaseAction');

class DonationAction extends BaseAction {
  static get config() {
    return {
      required: ['donorName', 'email'],
      optional: ['phone', 'message', 'amount'],
      endpoint: null,
      steps: ['Donor info', 'Donation details']
    };
  }

  async getDonorWall() {
    return this.api.get('/donations/donor-wall');
  }

  async submit(data) {
    return {
      success: true,
      message: this.getSuccessMessage(data),
      data: data
    };
  }

  getSuccessMessage(data) {
    return `Thank you for your interest in supporting ACEF${data.amount ? ` with $${data.amount}` : ''}!

💰 **Donation Methods:**
- Bank transfers (multiple currencies)
- Mobile money (MTN, Orange, M-Pesa)
- International wire transfer

📧 **Next Steps:**
Contact us for detailed donation information:
- Email: donations@acef-ngo.org

We'll provide account details and guide you through the process.`;
  }
}

module.exports = DonationAction;