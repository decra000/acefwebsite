// services/actions/BaseAction.js
class BaseAction {
  constructor(apiClient) {
    this.api = apiClient;
  }

  static get config() {
    throw new Error('Must implement static config getter');
  }

  getMissingFields(data) {
    return this.constructor.config.required.filter(field => 
      !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
    );
  }

  isReadyToSubmit(data) {
    return this.getMissingFields(data).length === 0;
  }

  validateBasic(data) {
    const errors = [];
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
    if (data.phone && data.phone.trim() && data.phone.length < 7) {
      errors.push('Phone number too short');
    }
    return errors;
  }

  async submit(data) {
    throw new Error('Must implement submit method');
  }
}

module.exports = BaseAction;
