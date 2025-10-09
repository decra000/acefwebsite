// services/InformationHandler.js
const TeamAction = require('./actions/TeamAction');
const CountryContactAction = require('./actions/CountryContactAction');
const MissionVisionAction = require('./actions/MissionVisionAction');
const CoreValuesAction = require('./actions/CoreValuesAction');
const EventAction = require('./actions/EventAction');
const JobAction = require('./actions/JobAction');

class InformationHandler {
  constructor(api) {
    this.teamAction = new TeamAction(api);
    this.countryAction = new CountryContactAction(api);
    this.missionVisionAction = new MissionVisionAction(api);
    this.coreValuesAction = new CoreValuesAction(api);
    this.eventAction = new EventAction(api);
    this.jobAction = new JobAction(api);
  }

  async handleInformationQuery(query, queryType) {
    const lowerQuery = query.toLowerCase();

    try {
      switch (queryType) {
        case 'team_info':
          return await this.handleTeamQuery(lowerQuery);

        case 'country_info':
          return await this.handleCountryQuery(lowerQuery);

        case 'mission_vision':
          return await this.handleMissionVisionQuery();

        case 'core_values':
          return await this.handleCoreValuesQuery();

        case 'events':
          return await this.handleEventsQuery(lowerQuery);

        case 'jobs':
          return await this.handleJobsQuery(lowerQuery);

        case 'about':
          return await this.handleAboutQuery();

        default:
          return this.getGeneralInfo();
      }
    } catch (error) {
      console.error('Error handling information query:', error);
      return 'I encountered an error retrieving that information. Please try again or contact us directly.';
    }
  }

  // ============================================
  // JOB BROWSING HANDLER (NEW)
  // ============================================
  async handleJobsQuery(query) {
    try {
      // Check for country-specific job queries
      const countryMatch = query.match(/in\s+([a-z\s]+)/i);
      if (countryMatch) {
        const country = countryMatch[1].trim();
        const jobs = await this.jobAction.getJobsByCountry(country);
        if (jobs.success && jobs.data.length > 0) {
          return this.jobAction.formatJobsList(jobs.data, `Jobs in ${country}`);
        }
        return `No jobs found in ${country} at the moment. Would you like to see all available positions?`;
      }

      // Check for level-specific queries
      if (query.includes('entry level') || query.includes('entry-level')) {
        const jobs = await this.jobAction.getJobsByLevel('Entry Level');
        if (jobs.success && jobs.data.length > 0) {
          return this.jobAction.formatJobsList(jobs.data, 'Entry Level Positions');
        }
        return 'No entry level positions available at the moment.';
      }

      if (query.includes('senior')) {
        const jobs = await this.jobAction.getJobsByLevel('Senior');
        if (jobs.success && jobs.data.length > 0) {
          return this.jobAction.formatJobsList(jobs.data, 'Senior Positions');
        }
        return 'No senior positions available at the moment.';
      }

      if (query.includes('mid-level') || query.includes('mid level')) {
        const jobs = await this.jobAction.getJobsByLevel('Mid-level');
        if (jobs.success && jobs.data.length > 0) {
          return this.jobAction.formatJobsList(jobs.data, 'Mid-level Positions');
        }
        return 'No mid-level positions available at the moment.';
      }

      // Check for location type queries
      if (query.includes('remote')) {
        const jobs = await this.jobAction.getJobsByLocation('Remote');
        if (jobs.success && jobs.data.length > 0) {
          return this.jobAction.formatJobsList(jobs.data, 'Remote Jobs');
        }
        return 'No remote positions available at the moment.';
      }

      if (query.includes('hybrid')) {
        const jobs = await this.jobAction.getJobsByLocation('Hybrid');
        if (jobs.success && jobs.data.length > 0) {
          return this.jobAction.formatJobsList(jobs.data, 'Hybrid Jobs');
        }
        return 'No hybrid positions available at the moment.';
      }

      if (query.includes('in-person') || query.includes('in person') || query.includes('office')) {
        const jobs = await this.jobAction.getJobsByLocation('In-Person');
        if (jobs.success && jobs.data.length > 0) {
          return this.jobAction.formatJobsList(jobs.data, 'In-Person Jobs');
        }
        return 'No in-person positions available at the moment.';
      }

      // Check for specific job search by keyword
      const searchKeywords = ['looking for', 'interested in', 'search for', 'find'];
      const hasSearchKeyword = searchKeywords.some(k => query.includes(k));
      
      if (hasSearchKeyword) {
        // Extract keyword after the search phrase
        const searchMatch = query.match(/(?:looking for|interested in|search for|find)\s+(.+)/i);
        if (searchMatch) {
          const keyword = searchMatch[1].trim();
          const jobs = await this.jobAction.searchJobs(keyword);
          if (jobs.success && jobs.data.length > 0) {
            return this.jobAction.formatJobsList(jobs.data, `Jobs matching "${keyword}"`);
          }
          return `No jobs found matching "${keyword}". Would you like to see all available positions?`;
        }
      }

      // Check for specific job ID or number
      const jobIdMatch = query.match(/job\s+(?:#)?(\d+)/i);
      if (jobIdMatch) {
        const jobId = jobIdMatch[1];
        const job = await this.jobAction.getJobById(jobId);
        if (job.success && job.data) {
          return this.jobAction.formatJobWithApplyPrompt(job.data);
        }
        return `Job #${jobId} not found. Would you like to see all available positions?`;
      }

      // Default: Show all available jobs
      const allJobs = await this.jobAction.getJobs();
      
      if (!allJobs.success) {
        return 'I\'m having trouble retrieving job listings right now. Please try again later or visit our careers page.';
      }

      if (allJobs.data.length === 0) {
        return 'We don\'t have any open positions at the moment. Would you like to subscribe to our newsletter to get notified when new jobs are posted?';
      }

      // Get job statistics
      const stats = await this.jobAction.getJobStats();
      let response = '';

      if (stats.success && stats.data) {
        response += `We currently have ${allJobs.data.length} open positions across ${stats.data.countries || 'multiple'} countries.\n\n`;
      }

      response += this.jobAction.formatJobsList(allJobs.data, 'Current Job Openings');
      
      return response;

    } catch (error) {
      console.error('Error handling jobs query:', error);
      return 'I\'m having trouble retrieving job information. Please visit our careers page or try again later.';
    }
  }

  // ============================================
  // EXISTING HANDLERS
  // ============================================
  async handleTeamQuery(query) {
    try {
      if (query.includes('department')) {
        const departments = await this.teamAction.getDepartments();
        if (departments.success && departments.data) {
          let response = 'ACEF Departments:\n\n';
          departments.data.forEach((dept, index) => {
            response += `${index + 1}. ${dept.name}`;
            if (dept.description) response += ` - ${dept.description}`;
            response += '\n';
          });
          return response;
        }
      }

      if (query.includes('country') || query.includes('countries') || query.includes('where')) {
        const countries = await this.teamAction.getCountries();
        if (countries.success && countries.data) {
          let response = 'ACEF Team Locations:\n\n';
          response += 'Our team members are located in:\n';
          countries.data.forEach((country, index) => {
            response += `${index + 1}. ${country.country || country.name}\n`;
          });
          return response;
        }
      }

      const stats = await this.teamAction.getTeamStats();
      const members = await this.teamAction.getAllMembers();

      if (!members.success || !members.data) {
        return 'I\'m having trouble retrieving team information right now. Please visit our website or contact us directly.';
      }

      let response = 'Our Team at ACEF\n\n';
      response += `We have ${stats.totalMembers} team members across ${stats.totalCountries} countries.\n\n`;

      if (stats.departments && stats.departments.length > 0) {
        response += 'Departments:\n';
        stats.departments.forEach(dept => {
          response += `- ${dept.department || dept.name}\n`;
        });
        response += '\n';
      }

      const leadership = members.data
        .filter(m => m.position && (
          m.position.toLowerCase().includes('director') ||
          m.position.toLowerCase().includes('coordinator') ||
          m.position.toLowerCase().includes('manager')
        ))
        .slice(0, 5);

      if (leadership.length > 0) {
        response += 'Leadership Team:\n';
        leadership.forEach(member => {
          response += `- ${member.name} - ${member.position}`;
          if (member.country) response += ` (${member.country})`;
          response += '\n';
        });
      }

      response += '\nWant to know more about a specific department or team member? Just ask!';
      return response;

    } catch (error) {
      console.error('Error handling team query:', error);
      return 'I\'m having trouble retrieving team information. Please visit our website for the latest team details.';
    }
  }



  

  async handleCountryQuery(query) {
    try {
      const contacts = await this.countryAction.getAllCountryContacts();
      
      if (!contacts || !Array.isArray(contacts)) {
        return 'I\'m having trouble retrieving country information. Please try again later.';
      }

      const activeCountries = contacts.filter(c => c.is_active);

      let response = 'ACEF Countries\n\n';
      response += `We operate in ${activeCountries.length} countries:\n\n`;

      activeCountries.forEach((country, index) => {
        response += `${index + 1}. ${country.country}\n`;
        if (country.email) response += `   Email: ${country.email}\n`;
        if (country.phone) response += `   Phone: ${country.phone}\n`;
        if (country.city) response += `   Location: ${country.city}\n`;
        response += '\n';
      });

      response += 'Need specific contact information for a country? Just let me know which one!';
      return response;

    } catch (error) {
      console.error('Error handling country query:', error);
      return 'I\'m having trouble retrieving country information. Please visit our website or contact us directly.';
    }
  }

  async handleMissionVisionQuery() {
    try {
      const data = await this.missionVisionAction.getMissionVision();
      
      if (!data.success || !data.data) {
        return 'I\'m having trouble retrieving our mission and vision. Please visit our website for this information.';
      }

      return this.missionVisionAction.getFormattedResponse(data.data);
    } catch (error) {
      console.error('Error handling mission/vision query:', error);
      return 'I\'m having trouble retrieving our mission and vision. Please visit our website for this information.';
    }
  }

  async handleCoreValuesQuery() {
    try {
      const response = await this.coreValuesAction.getCoreValues();
      
      if (!response.success || !response.data) {
        return 'I\'m having trouble retrieving our core values. Please visit our website for this information.';
      }

      return this.coreValuesAction.getFormattedResponse(response.data);
    } catch (error) {
      console.error('Error handling core values query:', error);
      return 'I\'m having trouble retrieving our core values. Please visit our website for this information.';
    }
  }

  async handleEventsQuery(query) {
    try {
      if (query.includes('upcoming') || query.includes('future') || query.includes('next')) {
        const events = await this.eventAction.getUpcomingEvents();
        if (events.success && events.data.length > 0) {
          return this.eventAction.formatEventsList(events.data, 'Upcoming Events');
        }
        return 'No upcoming events scheduled at the moment. Check back soon!';
      }

      if (query.includes('featured') || query.includes('highlight')) {
        const events = await this.eventAction.getFeaturedEvents();
        if (events.success && events.data.length > 0) {
          return this.eventAction.formatEventsList(events.data, 'Featured Events');
        }
        return 'No featured events at the moment.';
      }

      if (query.includes('free')) {
        const events = await this.eventAction.getFreeEvents();
        if (events.success && events.data.length > 0) {
          return this.eventAction.formatEventsList(events.data, 'Free Events');
        }
        return 'No free events available at the moment.';
      }

      if (query.includes('paid') || query.includes('ticket')) {
        const events = await this.eventAction.getPaidEvents();
        if (events.success && events.data.length > 0) {
          return this.eventAction.formatEventsList(events.data, 'Paid Events');
        }
        return 'No paid events at the moment.';
      }

      const countryMatch = query.match(/in\s+([a-z\s]+)/i);
      if (countryMatch) {
        const country = countryMatch[1].trim();
        const events = await this.eventAction.getEventsByCountry(country);
        if (events.success && events.data.length > 0) {
          return this.eventAction.formatEventsList(events.data, `Events in ${country}`);
        }
        return `No events found in ${country} at the moment.`;
      }

      const events = await this.eventAction.getUpcomingEvents();
      if (!events.success) {
        return 'I\'m having trouble retrieving events. Please try again later.';
      }

      if (events.data.length === 0) {
        return 'No events scheduled at the moment. Check back soon for updates!';
      }

      let response = this.eventAction.formatEventsList(events.data, 'Available Events');
      response += '\n\nWant to register for an event? Just tell me which one!';
      return response;

    } catch (error) {
      console.error('Error handling events query:', error);
      return 'I\'m having trouble retrieving event information. Please visit our website for the latest events.';
    }
  }

  async handleAboutQuery() {
    try {
      const [missionVision, coreValues, teamStats, countries] = await Promise.all([
        this.missionVisionAction.getMissionVision(),
        this.coreValuesAction.getCoreValues(),
        this.teamAction.getTeamStats(),
        this.countryAction.getAllCountryContacts()
      ]);

      let response = 'About ACEF\n\n';

      if (missionVision.success && missionVision.data?.mission_text) {
        response += 'Our Mission:\n';
        response += `${missionVision.data.mission_text}\n\n`;
      }

      if (missionVision.success && missionVision.data?.vision_text) {
        response += 'Our Vision:\n';
        response += `${missionVision.data.vision_text}\n\n`;
      }

      response += 'At a Glance:\n';
      response += `- ${teamStats.totalMembers} team members\n`;
      response += `- Operating in ${countries?.length || 0} countries\n`;
      if (coreValues.success) {
        response += `- ${coreValues.data.length} core values guiding our work\n`;
      }

      response += '\nWant to learn more? Ask me about our team, programs, events, jobs, or how to get involved!';
      return response;

    } catch (error) {
      console.error('Error handling about query:', error);
      return 'I\'m having trouble retrieving information about ACEF. Please visit our website for comprehensive details.';
    }
  }

  getGeneralInfo() {
    return `I can help you with:

Information:
- About ACEF (mission, vision, values)
- Our team and departments
- Countries we operate in
- Current events and programs
- Available job openings

Actions:
- Apply for jobs
- Register for events
- Volunteer opportunities
- Partnership inquiries
- Donations
- General contact

What would you like to know?`;
  }

  static isInformationalQuery(query) {
    const infoKeywords = [
      'what is', 'who are', 'where', 'when', 'how many',
      'tell me about', 'information about', 'know more',
      'show me', 'list', 'describe', 'explain',
      'team members', 'countries', 'mission', 'vision', 'values',
      'about acef', 'learn about', 'find out', 'events',
      'upcoming', 'explore', 'see', 'view', 'jobs', 'openings',
      'positions', 'careers', 'available'
    ];

    const lowerQuery = query.toLowerCase();
    return infoKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  static classifyInformationQuery(query) {
    const lowerQuery = query.toLowerCase();

    // Check for job browsing (not applying)
    if ((lowerQuery.includes('job') || lowerQuery.includes('position') || 
         lowerQuery.includes('opening') || lowerQuery.includes('career')) &&
        (lowerQuery.includes('show') || lowerQuery.includes('see') || 
         lowerQuery.includes('list') || lowerQuery.includes('available') ||
         lowerQuery.includes('what') || lowerQuery.includes('view') ||
         lowerQuery.includes('explore') || lowerQuery.includes('have'))) {
      return 'jobs';
    }

    // Check for events
    if (lowerQuery.includes('event') || lowerQuery.includes('upcoming') ||
        lowerQuery.includes('program') || lowerQuery.includes('workshop') ||
        lowerQuery.includes('conference') || lowerQuery.includes('seminar')) {
      return 'events';
    }

    if (lowerQuery.includes('team') || lowerQuery.includes('member') || 
        lowerQuery.includes('staff') || lowerQuery.includes('department')) {
      return 'team_info';
    }

    if (lowerQuery.includes('country') || lowerQuery.includes('countries') ||
        lowerQuery.includes('location')) {
      return 'country_info';
    }

    if (lowerQuery.includes('mission') || lowerQuery.includes('vision')) {
      return 'mission_vision';
    }

    if (lowerQuery.includes('value') || lowerQuery.includes('principle')) {
      return 'core_values';
    }

    if (lowerQuery.includes('about') || lowerQuery.includes('who is') ||
        lowerQuery.includes('what is')) {
      return 'about';
    }

    return 'general';
  }
}

module.exports = InformationHandler;