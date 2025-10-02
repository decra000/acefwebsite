// services/actions/CoreValuesAction.js
const BaseAction = require('./BaseAction');

class CoreValuesAction extends BaseAction {
  static get config() {
    return {
      required: [],
      optional: [],
      endpoint: null,
      steps: []
    };
  }

  // Get all active core values
  async getCoreValues() {
    return this.api.get('/core-values');
  }

  // Get core values count
  async getCount() {
    try {
      const response = await this.getCoreValues();
      return {
        success: true,
        count: response.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching core values count:', error);
      return { success: false, count: 0 };
    }
  }

  // Get formatted core values for display
  async getFormattedCoreValues() {
    try {
      const response = await this.getCoreValues();
      if (!response.success || !response.data || response.data.length === 0) {
        return {
          success: false,
          message: 'Core values information is currently unavailable.'
        };
      }

      return {
        success: true,
        data: response.data.map((value, index) => ({
          number: index + 1,
          title: value.title,
          description: value.description,
          display_order: value.display_order
        }))
      };
    } catch (error) {
      console.error('Error fetching formatted core values:', error);
      return {
        success: false,
        message: 'Failed to retrieve core values information.'
      };
    }
  }

  // Format core values for chatbot response
  getFormattedResponse(coreValues) {
    if (!coreValues || !Array.isArray(coreValues) || coreValues.length === 0) {
      return 'Core values information is currently unavailable.';
    }

    let response = '💎 **Our Core Values**\n\n';
    response += 'These are the principles that guide our work at ACEF:\n\n';
    
    coreValues.forEach((value, index) => {
      response += `**${index + 1}. ${value.title}**\n`;
      response += `${value.description}\n\n`;
    });
    
    response += '---\n';
    response += `We are committed to upholding these ${coreValues.length} core values in everything we do.`;
    
    return response;
  }

  // Get core values as a simple list (titles only)
  async getCoreValuesList() {
    try {
      const response = await this.getCoreValues();
      if (!response.success || !response.data) {
        return { success: false, data: [] };
      }

      return {
        success: true,
        data: response.data.map(value => value.title)
      };
    } catch (error) {
      console.error('Error fetching core values list:', error);
      return { success: false, data: [] };
    }
  }

  // Search for a specific core value by title
  async searchCoreValue(searchTerm) {
    try {
      const response = await this.getCoreValues();
      if (!response.success || !response.data) {
        return { success: false, data: null };
      }

      const searchLower = searchTerm.toLowerCase().trim();
      const found = response.data.find(value => 
        value.title.toLowerCase().includes(searchLower)
      );

      if (found) {
        return {
          success: true,
          data: {
            title: found.title,
            description: found.description
          }
        };
      }

      return {
        success: false,
        message: `No core value found matching "${searchTerm}"`
      };
    } catch (error) {
      console.error('Error searching core value:', error);
      return { success: false, data: null };
    }
  }

  // Get core values statistics
  async getStats() {
    try {
      const response = await this.getCoreValues();
      if (!response.success || !response.data) {
        return {
          success: false,
          stats: { total: 0, active: 0 }
        };
      }

      return {
        success: true,
        stats: {
          total: response.data.length,
          active: response.data.filter(v => v.is_active).length,
          titles: response.data.map(v => v.title)
        }
      };
    } catch (error) {
      console.error('Error fetching core values stats:', error);
      return {
        success: false,
        stats: { total: 0, active: 0 }
      };
    }
  }

  // Submit method (not used for core values - read-only)
  async submit(data) {
    return {
      success: false,
      message: 'Core values data is read-only through this interface.'
    };
  }

  getSuccessMessage(data) {
    return 'Core values information retrieved successfully.';
  }
}

module.exports = CoreValuesAction;