// controllers/volunteerFormsController.js
const volunteerFormsService = require('../services/volunteerFormsService');

class VolunteerFormsController {
  // ✅ GET /api/volunteer-forms - Get all volunteer forms
  async getAllForms(req, res) {
    try {
      const forms = await volunteerFormsService.getAllForms();
      res.status(200).json({
        success: true,
        data: forms,
        count: forms.length
      });
    } catch (error) {
      console.error('❌ Error fetching volunteer forms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch volunteer forms',
        error: error.message
      });
    }
  }

  // ✅ GET /api/volunteer-forms/country/:countryName - Get form by country name
  async getFormByCountry(req, res) {
    try {
      const { countryName } = req.params;
      const form = await volunteerFormsService.getFormByCountryName(countryName);
      
      if (!form) {
        return res.status(404).json({
          success: false,
          message: `No volunteer form found for ${countryName}`
        });
      }

      res.status(200).json({
        success: true,
        data: form
      });
    } catch (error) {
      console.error('❌ Error fetching form by country:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch volunteer form',
        error: error.message
      });
    }
  }

  // ✅ GET /api/volunteer-forms/:id - Get form by ID
  async getFormById(req, res) {
    try {
      const { id } = req.params;
      const query = `
        SELECT vf.*, c.name as country_name 
        FROM volunteer_forms vf
        LEFT JOIN countries c ON vf.country_id = c.id
        WHERE vf.id = ?
      `;
      const { executeQuery } = require('../config/database');
      const results = await executeQuery(query, [id]);
      const form = results[0];
      
      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Volunteer form not found'
        });
      }

      res.status(200).json({
        success: true,
        data: form
      });
    } catch (error) {
      console.error('❌ Error fetching form by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch volunteer form',
        error: error.message
      });
    }
  }

  // ✅ POST /api/volunteer-forms - Create new volunteer form
  async createForm(req, res) {
    try {
      const { country_id, form_url, form_title, description, is_active } = req.body;

      // Validation
      if (!country_id || !form_url || !form_title) {
        return res.status(400).json({
          success: false,
          message: 'Country ID, form URL, and form title are required'
        });
      }

      // Validate form URL
      if (!volunteerFormsService.validateFormUrl(form_url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid form URL. Please provide a valid HTTPS URL'
        });
      }

      const formData = {
        country_id,
        form_url,
        form_title,
        description: description || '',
        is_active: is_active !== undefined ? is_active : true
      };

      const newForm = await volunteerFormsService.createForm(formData);
      
      res.status(201).json({
        success: true,
        message: 'Volunteer form created successfully',
        data: newForm
      });
    } catch (error) {
      console.error('❌ Error creating volunteer form:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create volunteer form',
        error: error.message
      });
    }
  }

  // ✅ PUT /api/volunteer-forms/:id - Update volunteer form
  async updateForm(req, res) {
    try {
      const { id } = req.params;
      const { country_id, form_url, form_title, description, is_active } = req.body;

      // Validation
      if (!country_id || !form_url || !form_title) {
        return res.status(400).json({
          success: false,
          message: 'Country ID, form URL, and form title are required'
        });
      }

      // Validate form URL
      if (!volunteerFormsService.validateFormUrl(form_url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid form URL. Please provide a valid HTTPS URL'
        });
      }

      const formData = {
        country_id,
        form_url,
        form_title,
        description: description || '',
        is_active: is_active !== undefined ? is_active : true
      };

      const updatedForm = await volunteerFormsService.updateForm(id, formData);
      
      res.status(200).json({
        success: true,
        message: 'Volunteer form updated successfully',
        data: updatedForm
      });
    } catch (error) {
      console.error('❌ Error updating volunteer form:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update volunteer form',
        error: error.message
      });
    }
  }

  // ✅ DELETE /api/volunteer-forms/:id - Delete volunteer form
  async deleteForm(req, res) {
    try {
      const { id } = req.params;
      const deleted = await volunteerFormsService.deleteForm(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Volunteer form not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Volunteer form deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting volunteer form:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete volunteer form',
        error: error.message
      });
    }
  }

  // ✅ PATCH /api/volunteer-forms/:id/toggle - Toggle form status
  async toggleFormStatus(req, res) {
    try {
      const { id } = req.params;
      const updatedForm = await volunteerFormsService.toggleFormStatus(id);
      
      if (!updatedForm) {
        return res.status(404).json({
          success: false,
          message: 'Volunteer form not found'
        });
      }

      res.status(200).json({
        success: true,
        message: `Form status updated to ${updatedForm.is_active ? 'active' : 'inactive'}`,
        data: updatedForm
      });
    } catch (error) {
      console.error('❌ Error toggling form status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle form status',
        error: error.message
      });
    }
  }

  // ✅ GET /api/volunteer-forms/countries/available - Get countries without forms
  async getAvailableCountries(req, res) {
    try {
      const countries = await volunteerFormsService.getCountriesWithoutForms();
      res.status(200).json({
        success: true,
        data: countries,
        count: countries.length
      });
    } catch (error) {
      console.error('❌ Error fetching available countries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available countries',
        error: error.message
      });
    }
  }

  // ✅ GET /api/volunteer-forms/stats - Get form statistics
  async getFormStats(req, res) {
    try {
      const stats = await volunteerFormsService.getFormStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error fetching form stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch form statistics',
        error: error.message
      });
    }
  }
}

module.exports = new VolunteerFormsController();