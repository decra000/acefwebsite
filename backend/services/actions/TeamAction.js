// services/actions/TeamAction.js
const BaseAction = require('./BaseAction');

class TeamAction extends BaseAction {
  static get config() {
    return {
      required: [],
      optional: [],
      endpoint: null,
      steps: []
    };
  }

  // Get all team members
  async getAllMembers() {
    return this.api.get('/team');
  }

  // Get team member by ID
  async getMemberById(id) {
    return this.api.get(`/team/${id}`);
  }

  // Get all departments
  async getDepartments() {
    return this.api.get('/team/departments');
  }

  // Get department by ID
  async getDepartmentById(id) {
    return this.api.get(`/team/departments/${id}`);
  }

  // Get team members by department
  async getMembersByDepartment(department) {
    return this.api.get(`/team/department/${department}`);
  }

  // Get all countries where team members are located
  async getCountries() {
    return this.api.get('/team/countries');
  }

  // Get team members by country
  async getMembersByCountry(country) {
    return this.api.get(`/team/country/${country}`);
  }

  // Get team statistics
  async getTeamStats() {
    try {
      const [members, departments, countries] = await Promise.all([
        this.getAllMembers(),
        this.getDepartments(),
        this.getCountries()
      ]);

      return {
        totalMembers: members.data?.length || 0,
        totalDepartments: departments.data?.length || 0,
        totalCountries: countries.data?.length || 0,
        departments: departments.data || [],
        countries: countries.data || []
      };
    } catch (error) {
      console.error('Error fetching team stats:', error);
      throw error;
    }
  }

  async submit(data) {
    // TeamAction doesn't have a submit function
    // It's primarily used for fetching team data
    return {
      success: false,
      message: 'Team data is read-only through this interface'
    };
  }

  getSuccessMessage(data) {
    return 'Team information retrieved successfully';
  }
}

module.exports = TeamAction;