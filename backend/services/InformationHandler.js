// services/InformationHandler.js
const TeamAction = require('./actions/TeamAction');
const CountryContactAction = require('./actions/CountryContactAction');
const MissionVisionAction = require('./actions/MissionVisionAction');
const CoreValuesAction = require('./actions/CoreValuesAction');

class InformationHandler {
  constructor(api) {
    this.teamAction = new TeamAction(api);
    this.countryAction = new CountryContactAction(api);
    this.missionVisionAction = new MissionVisionAction(api);
    this.coreValuesAction = new CoreValuesAction(api);
    this.api = api;
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

        case 'about':
          return await this.handleAboutQuery();

        case 'blog_info':
          return await this.handleBlogQuery(lowerQuery);

        case 'project_info':
          return await this.handleProjectQuery(lowerQuery);

        case 'partner_info':
          return await this.handlePartnerQuery();

        case 'impact_info':
          return await this.handleImpactQuery();

        case 'testimonial_info':
          return await this.handleTestimonialQuery();

        default:
          return this.getGeneralInfo();
      }
    } catch (error) {
      console.error('Error handling information query:', error);
      return 'I encountered an error retrieving that information. Please try again or contact us directly.';
    }
  }

  async handleTeamQuery(query) {
    try {
      if (query.includes('department')) {
        const departments = await this.teamAction.getDepartments();
        if (departments.success && departments.data) {
          let response = '🏢 **ACEF Departments:**\n\n';
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
          let response = '🌍 **ACEF Team Locations:**\n\n';
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

      let response = '👥 **Our Team at ACEF**\n\n';
      response += `We have **${stats.totalMembers} team members** across **${stats.totalCountries} countries**.\n\n`;

      if (stats.departments && stats.departments.length > 0) {
        response += '**Departments:**\n';
        stats.departments.forEach(dept => {
          response += `• ${dept.department || dept.name}\n`;
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
        response += '**Leadership Team:**\n';
        leadership.forEach(member => {
          response += `• **${member.name}** - ${member.position}`;
          if (member.country) response += ` (${member.country})`;
          response += '\n';
        });
      }

      response += '\n💡 Want to know more about a specific department or team member? Just ask!';
      return response;

    } catch (error) {
      console.error('Error handling team query:', error);
      return 'I\'m having trouble retrieving team information. Please visit our website for the latest team details.';
    }
  }

  async handleCountryQuery(query) {
    try {
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes('contact') || lowerQuery.includes('email') || 
          lowerQuery.includes('phone') || lowerQuery.includes('reach')) {
        
        const contacts = await this.countryAction.getAllCountryContacts();
        const countryNames = contacts.map(c => c.country.toLowerCase());
        const mentionedCountry = countryNames.find(name => lowerQuery.includes(name));
        
        if (mentionedCountry) {
          const contact = contacts.find(c => c.country.toLowerCase() === mentionedCountry);
          if (contact) {
            return this.countryAction.getFormattedResponse(contact);
          }
        }
        
        let response = '📞 **ACEF Contact Information**\n\n';
        response += 'Which country would you like contact information for?\n\n';
        response += 'We have offices in:\n';
        contacts.filter(c => c.is_active).forEach((c, i) => {
          response += `${i + 1}. ${c.country}\n`;
        });
        response += '\nJust tell me the country name!';
        return response;
      }
      
      const countriesResponse = await this.countryAction.getCountries();
      
      if (!countriesResponse || !Array.isArray(countriesResponse)) {
        return 'I\'m having trouble retrieving country information. Please try again later.';
      }

      let response = '🌍 **ACEF Countries**\n\n';
      response += `We operate in **${countriesResponse.length} countries**:\n\n`;

      countriesResponse.forEach((country, index) => {
        response += `${index + 1}. ${country.name}\n`;
      });

      response += '\n💡 Need contact information for a specific country? Just ask!';
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

  async handleBlogQuery(query) {
    try {
      const response = await this.api.get('/blogs');
      
      if (!response.success || !response.data || response.data.length === 0) {
        return 'I\'m having trouble retrieving blog posts. Please visit our website to read our latest articles.';
      }

      let result = '📰 **ACEF Blog Posts**\n\n';
      result += 'Here are some of our recent articles:\n\n';

      const recentPosts = response.data.slice(0, 5);
      recentPosts.forEach((post, index) => {
        result += `${index + 1}. **${post.title}**\n`;
        if (post.excerpt) result += `   ${post.excerpt.substring(0, 100)}...\n`;
        if (post.category) result += `   Category: ${post.category}\n`;
        if (post.published_date) result += `   Published: ${new Date(post.published_date).toLocaleDateString()}\n`;
        result += '\n';
      });

      result += '💡 Visit our website to read the full articles!';
      return result;

    } catch (error) {
      console.error('Error handling blog query:', error);
      return 'I\'m having trouble retrieving blog information. Please visit our website to see our latest posts.';
    }
  }

  async handleProjectQuery(query) {
    try {
      const response = await this.api.get('/projects');
      
      if (!response.success || !response.data || response.data.length === 0) {
        return 'I\'m having trouble retrieving project information. Please visit our website to see our current projects.';
      }

      let result = 'Projects at ACEF\n\n';
      result += 'Here are some of our ongoing projects:\n\n';

      const projects = response.data.slice(0, 5);
      projects.forEach((project, index) => {
        result += `${index + 1}. ${project.title || project.name}\n`;
        if (project.description) result += `   ${project.description.substring(0, 150)}...\n`;
        if (project.country) result += `   Location: ${project.country}\n`;
        if (project.status) result += `   Status: ${project.status}\n`;
        result += '\n';
      });

      result += 'Want to learn more about a specific project? Just ask!';
      return result;

    } catch (error) {
      console.error('Error handling project query:', error);
      return 'I\'m having trouble retrieving project information. Please visit our website to see our initiatives.';
    }
  }

  async handlePartnerQuery() {
    try {
      const response = await this.api.get('/partners');
      
      if (!response.success || !response.data || response.data.length === 0) {
        return 'I\'m having trouble retrieving partner information. Please visit our website to see our partners.';
      }

      let result = 'Our Partners\n\n';
      result += `We proudly work with ${response.data.length} partners:\n\n`;

      response.data.slice(0, 10).forEach((partner, index) => {
        result += `${index + 1}. ${partner.name}`;
        if (partner.type) result += ` (${partner.type})`;
        result += '\n';
        if (partner.description) result += `   ${partner.description.substring(0, 100)}...\n`;
      });

      result += '\nInterested in becoming a partner? Let me know!';
      return result;

    } catch (error) {
      console.error('Error handling partner query:', error);
      return 'I\'m having trouble retrieving partner information. Please visit our website for details about our partnerships.';
    }
  }

  async handleImpactQuery() {
    try {
      const response = await this.api.get('/impacts');
      
      if (!response.success || !response.data || response.data.length === 0) {
        return 'I\'m having trouble retrieving impact information. Please visit our website to see our achievements.';
      }

      let result = 'Our Impact\n\n';
      result += 'Here are some of our key achievements:\n\n';

      response.data.forEach((impact, index) => {
        result += `${index + 1}. ${impact.title}\n`;
        if (impact.value) result += `   ${impact.value}`;
        if (impact.metric) result += ` ${impact.metric}`;
        result += '\n';
        if (impact.description) result += `   ${impact.description}\n`;
        result += '\n';
      });

      result += 'These numbers represent real change in communities across our regions.';
      return result;

    } catch (error) {
      console.error('Error handling impact query:', error);
      return 'I\'m having trouble retrieving impact information. Please visit our website to see our results.';
    }
  }

  async handleTestimonialQuery() {
    try {
      const response = await this.api.get('/testimonials');
      
      if (!response.success || !response.data || response.data.length === 0) {
        return 'I\'m having trouble retrieving testimonials. Please visit our website to read stories from our community.';
      }

      let result = 'What People Say About ACEF\n\n';
      
      const testimonials = response.data.slice(0, 3);
      testimonials.forEach((testimonial, index) => {
        result += `${index + 1}. ${testimonial.author_name}`;
        if (testimonial.role) result += ` - ${testimonial.role}`;
        result += '\n';
        result += `   "${testimonial.content.substring(0, 200)}${testimonial.content.length > 200 ? '...' : ''}"\n\n`;
      });

      result += 'Visit our website to read more testimonials from our community.';
      return result;

    } catch (error) {
      console.error('Error handling testimonial query:', error);
      return 'I\'m having trouble retrieving testimonials. Please visit our website to read community feedback.';
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

      response += '\nWant to learn more? Ask me about our team, programs, or how to get involved!';
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
- Current programs and projects
- Blog posts and news
- Our partners
- Impact and achievements
- Testimonials

Actions:
- Job applications
- Volunteer opportunities
- Event registration
- Partnership inquiries
- Collaboration proposals
- Donations
- Newsletter subscription
- General contact

What would you like to know?`;
  }

  static isInformationalQuery(query) {
    const infoKeywords = [
      'what is', 'who are', 'where', 'when', 'how many',
      'tell me about', 'information about', 'know more',
      'show me', 'list', 'describe', 'explain',
      'team members', 'countries', 'mission', 'vision', 'values',
      'about acef', 'learn about', 'find out', 'blog', 'projects',
      'partners', 'impact', 'testimonials'
    ];

    const lowerQuery = query.toLowerCase();
    return infoKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  static classifyInformationQuery(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('team') || lowerQuery.includes('member') || 
        lowerQuery.includes('staff') || lowerQuery.includes('department')) {
      return 'team_info';
    }

    if (lowerQuery.includes('country') || lowerQuery.includes('countries') ||
        lowerQuery.includes('where') || lowerQuery.includes('location')) {
      return 'country_info';
    }

    if (lowerQuery.includes('mission') || lowerQuery.includes('vision')) {
      return 'mission_vision';
    }

    if (lowerQuery.includes('value') || lowerQuery.includes('principle')) {
      return 'core_values';
    }

    if (lowerQuery.includes('blog') || lowerQuery.includes('article') ||
        lowerQuery.includes('post') || lowerQuery.includes('news')) {
      return 'blog_info';
    }

    if (lowerQuery.includes('project') || lowerQuery.includes('program') ||
        lowerQuery.includes('initiative')) {
      return 'project_info';
    }

    if (lowerQuery.includes('partner') && !lowerQuery.includes('partnership')) {
      return 'partner_info';
    }

    if (lowerQuery.includes('impact') || lowerQuery.includes('achievement') ||
        lowerQuery.includes('result')) {
      return 'impact_info';
    }

    if (lowerQuery.includes('testimonial') || lowerQuery.includes('review') ||
        lowerQuery.includes('feedback')) {
      return 'testimonial_info';
    }

    if (lowerQuery.includes('about') || lowerQuery.includes('who is') ||
        lowerQuery.includes('what is')) {
      return 'about';
    }

    return 'general';
  }
}

module.exports = InformationHandler;