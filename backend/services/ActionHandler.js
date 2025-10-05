// services/ActionHandler.js
const ApiClient = require('./api/ApiClient');
const ContactAction = require('./actions/ContactAction');
const CollaborationAction = require('./actions/CollaborationAction');
const PartnershipAction = require('./actions/PartnershipAction');
const JobAction = require('./actions/JobAction');
const EventAction = require('./actions/EventAction');
const VolunteerAction = require('./actions/VolunteerAction');
const DonationAction = require('./actions/DonationAction');
const NewsletterAction = require('./actions/NewsletterAction');
const TeamAction = require('./actions/TeamAction');
const CountryContactAction = require('./actions/CountryContactAction');
const MissionVisionAction = require('./actions/MissionVisionAction');
const CoreValuesAction = require('./actions/CoreValuesAction');

class ActionHandler {
  constructor(apiBase) {
    this.api = new ApiClient(apiBase);
    
    // Initialize all action classes
    this.actions = {
      // Form submission actions
      contact_inquiry: new ContactAction(this.api),
      collaboration_inquiry: new CollaborationAction(this.api),
      partnership_inquiry: new PartnershipAction(this.api),
      job_inquiry: new JobAction(this.api),
      event_inquiry: new EventAction(this.api),
      volunteer_inquiry: new VolunteerAction(this.api),
      donation_inquiry: new DonationAction(this.api),
      newsletter_subscription: new NewsletterAction(this.api),
      
      // Information retrieval actions (read-only)
      team: new TeamAction(this.api),
      country_contact: new CountryContactAction(this.api),
      mission_vision: new MissionVisionAction(this.api),
      core_values: new CoreValuesAction(this.api)
    };
  }

  static get ACTION_CONFIG() {
    return {
      // Actions that require form submission
      contact_inquiry: ContactAction.config,
      collaboration_inquiry: CollaborationAction.config,
      partnership_inquiry: PartnershipAction.config,
      job_inquiry: JobAction.config,
      event_inquiry: EventAction.config,
      volunteer_inquiry: VolunteerAction.config,
      donation_inquiry: DonationAction.config,
      newsletter_subscription: NewsletterAction.config
    };
  }

  getAction(actionType) {
    const action = this.actions[actionType];
    if (!action) {
      throw new Error(`Unknown action type: ${actionType}`);
    }
    return action;
  }

  async submitAction(actionType, data) {
    const action = this.getAction(actionType);
    return action.submit(data);
  }

  getMissingFields(collectedData, actionType) {
    const action = this.getAction(actionType);
    return action.getMissingFields(collectedData);
  }

  isReadyToSubmit(collectedData, actionType) {
    const action = this.getAction(actionType);
    return action.isReadyToSubmit(collectedData);
  }

  // ============================================
  // JOB-RELATED METHODS
  // ============================================
  
  /**
   * Get all jobs with optional filters
   */
  async getJobs(filters = {}) {
    return this.actions.job_inquiry.getJobs(filters);
  }

  /**
   * Get single job by ID
   */
  async getJobById(jobId) {
    return this.actions.job_inquiry.getJobById(jobId);
  }

  /**
   * Get jobs by country
   */
  async getJobsByCountry(country) {
    return this.actions.job_inquiry.getJobsByCountry(country);
  }

  /**
   * Get filter options for jobs
   */
  async getJobFilterOptions() {
    return this.actions.job_inquiry.getFilterOptions();
  }

  /**
   * Search jobs by keyword
   */
  async searchJobs(keyword) {
    return this.actions.job_inquiry.searchJobs(keyword);
  }

  /**
   * Get jobs by level (Entry Level, Mid-level, Senior)
   */
  async getJobsByLevel(level) {
    return this.actions.job_inquiry.getJobsByLevel(level);
  }

  /**
   * Get jobs by location (Remote, In-Person, Hybrid)
   */
  async getJobsByLocation(location) {
    return this.actions.job_inquiry.getJobsByLocation(location);
  }

  /**
   * Apply for a job
   */
  async applyForJob(data) {
    return this.actions.job_inquiry.submit(data);
  }

  /**
   * Format single job for display
   */
  formatJob(job) {
    return this.actions.job_inquiry.formatJob(job);
  }

  /**
   * Format multiple jobs list
   */
  formatJobsList(jobs, title) {
    return this.actions.job_inquiry.formatJobsList(jobs, title);
  }

  // ============================================
  // EVENT-RELATED METHODS
  // ============================================
  
  /**
   * Get all events with optional filters
   */
  async getEvents(filters = {}) {
    return this.actions.event_inquiry.getEvents(filters);
  }

  /**
   * Get single event by ID
   */
  async getEventById(eventId) {
    return this.actions.event_inquiry.getEventById(eventId);
  }

  /**
   * Get upcoming events only
   */
  async getUpcomingEvents() {
    return this.actions.event_inquiry.getUpcomingEvents();
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents() {
    return this.actions.event_inquiry.getFeaturedEvents();
  }

  /**
   * Get events by country
   */
  async getEventsByCountry(country) {
    return this.actions.event_inquiry.getEventsByCountry(country);
  }

  /**
   * Search events by keyword
   */
  async searchEvents(keyword) {
    return this.actions.event_inquiry.searchEvents(keyword);
  }

  /**
   * Get free events only
   */
  async getFreeEvents() {
    return this.actions.event_inquiry.getFreeEvents();
  }

  /**
   * Get paid events only
   */
  async getPaidEvents() {
    return this.actions.event_inquiry.getPaidEvents();
  }

  /**
   * Register interest for an event
   */
  async registerForEvent(data) {
    return this.actions.event_inquiry.submit(data);
  }

  /**
   * Get event registrations (admin)
   */
  async getEventRegistrations(eventId) {
    return this.actions.event_inquiry.getEventRegistrations(eventId);
  }

  /**
   * Format single event for display
   */
  formatEvent(event) {
    return this.actions.event_inquiry.formatEvent(event);
  }

  /**
   * Format multiple events list
   */
  formatEventsList(events, title) {
    return this.actions.event_inquiry.formatEventsList(events, title);
  }

  // ============================================
  // VOLUNTEER-RELATED METHODS
  // ============================================
  async getVolunteerCountries() {
    return this.actions.volunteer_inquiry.getCountries();
  }

  async getVolunteerStats() {
    return this.actions.volunteer_inquiry.getStats();
  }

  async getVolunteerFormByCountry(country) {
    return this.actions.volunteer_inquiry.getFormByCountry(country);
  }

  async getActiveVolunteerOpportunities() {
    return this.actions.volunteer_inquiry.getActiveOpportunities();
  }

  // ============================================
  // DONATION-RELATED METHODS
  // ============================================
  async getDonorWall() {
    return this.actions.donation_inquiry.getDonorWall();
  }

  // ============================================
  // TEAM-RELATED METHODS
  // ============================================
  async getTeamMembers() {
    return this.actions.team.getAllMembers();
  }

  async getTeamMemberById(id) {
    return this.actions.team.getMemberById(id);
  }

  async getDepartments() {
    return this.actions.team.getDepartments();
  }

  async getDepartmentById(id) {
    return this.actions.team.getDepartmentById(id);
  }

  async getTeamByDepartment(department) {
    return this.actions.team.getMembersByDepartment(department);
  }

  async getTeamCountries() {
    return this.actions.team.getCountries();
  }

  async getTeamByCountry(country) {
    return this.actions.team.getMembersByCountry(country);
  }

  async getTeamStats() {
    return this.actions.team.getTeamStats();
  }

  // ============================================
  // COUNTRY CONTACT METHODS
  // ============================================
  async getCountryContacts() {
    return this.actions.country_contact.getAllCountryContacts();
  }

  async getCountryContact(country) {
    return this.actions.country_contact.getCountryContact(country);
  }

  async getCountries() {
    return this.actions.country_contact.getCountries();
  }

  async getNearbyContacts(latitude, longitude, radiusKm) {
    return this.actions.country_contact.getNearbyContacts(latitude, longitude, radiusKm);
  }

  async getFormattedCountryContact(country) {
    return this.actions.country_contact.getFormattedContact(country);
  }

  async getActiveCountries() {
    return this.actions.country_contact.getActiveCountries();
  }

  async searchCountry(searchTerm) {
    return this.actions.country_contact.searchCountry(searchTerm);
  }

  async sendEmail(country, emailOptions) {
    return this.actions.country_contact.sendEmail(country, emailOptions);
  }

  // Email account methods
  async getEmailAccounts() {
    return this.actions.country_contact.getEmailAccounts();
  }

  async getEmailAccount(accountKey) {
    return this.actions.country_contact.getEmailAccount(accountKey);
  }

  async validateEmailAccount(accountKey) {
    return this.actions.country_contact.validateEmailAccount(accountKey);
  }

  async testEmailAccount(accountKey) {
    return this.actions.country_contact.testEmailAccount(accountKey);
  }

  async getEmailAccountStats() {
    return this.actions.country_contact.getEmailAccountStats();
  }

  // ============================================
  // MISSION & VISION METHODS
  // ============================================
  async getMissionVision() {
    return this.actions.mission_vision.getMissionVision();
  }

  async getMission() {
    return this.actions.mission_vision.getMission();
  }

  async getVision() {
    return this.actions.mission_vision.getVision();
  }

  async getFormattedMissionVision() {
    return this.actions.mission_vision.getFormattedMissionVision();
  }

  // ============================================
  // CORE VALUES METHODS
  // ============================================
  async getCoreValues() {
    return this.actions.core_values.getCoreValues();
  }

  async getFormattedCoreValues() {
    return this.actions.core_values.getFormattedCoreValues();
  }

  async getCoreValuesList() {
    return this.actions.core_values.getCoreValuesList();
  }

  async searchCoreValue(searchTerm) {
    return this.actions.core_values.searchCoreValue(searchTerm);
  }

  async getCoreValuesStats() {
    return this.actions.core_values.getStats();
  }

  async getCoreValuesCount() {
    return this.actions.core_values.getCount();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  clearCache(pattern = null) {
    this.api.clearCache(pattern);
  }

  // Get all available action types
  getAvailableActions() {
    return Object.keys(this.actions);
  }

  // Check if action type exists
  hasAction(actionType) {
    return actionType in this.actions;
  }

  // Get action configuration
  getActionConfig(actionType) {
    return ActionHandler.ACTION_CONFIG[actionType] || null;
  }
}

module.exports = ActionHandler;