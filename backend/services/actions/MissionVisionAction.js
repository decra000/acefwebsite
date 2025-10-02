// services/actions/MissionVisionAction.js
const BaseAction = require('./BaseAction');

class MissionVisionAction extends BaseAction {
  static get config() {
    return {
      required: [],
      optional: [],
      endpoint: null,
      steps: []
    };
  }

  // Get mission and vision data
  async getMissionVision() {
    return this.api.get('/mission-vision');
  }

  // Get only mission text
  async getMission() {
    try {
      const response = await this.getMissionVision();
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            text: response.data.mission_text,
            image_url: response.data.mission_image_url
          }
        };
      }
      return { success: false, data: null };
    } catch (error) {
      console.error('Error fetching mission:', error);
      return { success: false, data: null };
    }
  }

  // Get only vision text
  async getVision() {
    try {
      const response = await this.getMissionVision();
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            text: response.data.vision_text,
            image_url: response.data.vision_image_url
          }
        };
      }
      return { success: false, data: null };
    } catch (error) {
      console.error('Error fetching vision:', error);
      return { success: false, data: null };
    }
  }

  // Get both mission and vision formatted for display
  async getFormattedMissionVision() {
    try {
      const response = await this.getMissionVision();
      if (!response.success || !response.data) {
        return {
          success: false,
          message: 'Mission and Vision information is currently unavailable.'
        };
      }

      const data = response.data;
      return {
        success: true,
        data: {
          mission: {
            text: data.mission_text,
            image_url: data.mission_image_url
          },
          vision: {
            text: data.vision_text,
            image_url: data.vision_image_url
          }
        }
      };
    } catch (error) {
      console.error('Error fetching formatted mission vision:', error);
      return {
        success: false,
        message: 'Failed to retrieve Mission and Vision information.'
      };
    }
  }

  // Format mission and vision for chatbot response
  getFormattedResponse(data) {
    if (!data || !data.mission_text || !data.vision_text) {
      return 'Mission and Vision information is currently unavailable.';
    }

    let response = '🎯 **Our Mission & Vision**\n\n';
    
    response += '**Mission:**\n';
    response += `${data.mission_text}\n\n`;
    
    response += '**Vision:**\n';
    response += `${data.vision_text}\n\n`;
    
    response += '---\n';
    response += '💡 These guiding principles drive everything we do at ACEF.';
    
    return response;
  }

  // Submit method (not used for mission/vision - read-only)
  async submit(data) {
    return {
      success: false,
      message: 'Mission and Vision data is read-only through this interface.'
    };
  }

  getSuccessMessage(data) {
    return 'Mission and Vision information retrieved successfully.';
  }
}

module.exports = MissionVisionAction;