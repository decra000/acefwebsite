// services/InformationExtractor.js
class InformationExtractor {
  constructor() {
    this.patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      phone: [
        /(?:\+254|0)[0-9]{9,10}/,
        /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
        /(?:\+\d{1,4}[-.\s]?)?\d{7,15}/
      ],
      name: [
        /(?:my name is|i'?m|i am|call me|this is)\s+([A-Za-z\s]{2,50})/i,
        /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)$/
      ],
      amount: [
        /\$(\d+(?:\.\d{2})?)/,
        /(\d+)\s*(?:dollars?|usd)/i,
        /amount.*?(\d+)/i
      ]
    };

    this.excludeWords = ['interested', 'looking', 'calling', 'writing', 'applying', 'want', 'need'];
  }

  extract(message, actionType = null) {
    const extracted = {};

    const emailMatch = message.match(this.patterns.email);
    if (emailMatch) {
      extracted.email = emailMatch[0].toLowerCase();
    }

    for (const pattern of this.patterns.phone) {
      const phoneMatch = message.match(pattern);
      if (phoneMatch) {
        extracted.phone = phoneMatch[0];
        break;
      }
    }

    const nameExtracted = this.extractName(message);
    if (nameExtracted) {
      extracted.name = nameExtracted;
      extracted.fullName = nameExtracted;
    }

    if (actionType) {
      Object.assign(extracted, this.extractActionSpecific(message, actionType));
    }

    return extracted;
  }

  extractName(message) {
    for (const pattern of this.patterns.name) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (this.isValidName(name)) {
          return this.capitalizeName(name);
        }
      }
    }

    const words = message.trim().split(/\s+/);
    if (words.length >= 2 && /^[A-Z]/.test(words[0])) {
      const potentialName = words.slice(0, 2).join(' ');
      if (this.isValidName(potentialName) && /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(potentialName)) {
        return potentialName;
      }
    }

    return null;
  }

  isValidName(name) {
    const lower = name.toLowerCase();
    return !this.excludeWords.some(word => lower.includes(word)) &&
           name.length >= 2 &&
           name.length <= 50 &&
           /^[A-Za-z\s]+$/.test(name);
  }

  capitalizeName(name) {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  extractActionSpecific(message, actionType) {
    const extracted = {};
    const lower = message.toLowerCase();

    switch (actionType) {
      case 'job_inquiry':
        extracted.position = this.extractJobTitle(message);
        extracted.experience = this.extractExperience(message);
        break;

      case 'volunteer_inquiry':
        extracted.country = this.extractCountry(message);
        extracted.availability = this.extractAvailability(message);
        extracted.skills = this.extractSkills(message);
        break;

      case 'partnership_inquiry':
        extracted.organizationName = this.extractOrganization(message);
        extracted.partnershipType = this.extractPartnershipType(message);
        break;

      case 'donation_inquiry':
        extracted.amount = this.extractAmount(message);
        extracted.anonymous = lower.includes('anonymous');
        break;

      case 'event_inquiry':
        extracted.eventName = this.extractEventName(message);
        extracted.organization = this.extractOrganization(message);
        break;

      case 'contact_inquiry':
        extracted.subject = this.extractSubject(message);
        break;
    }

    return extracted;
  }

  extractJobTitle(message) {
    const commonTitles = [
      'coordinator', 'manager', 'officer', 'assistant', 'director',
      'specialist', 'analyst', 'developer', 'engineer', 'consultant'
    ];

    const lower = message.toLowerCase();
    for (const title of commonTitles) {
      if (lower.includes(title)) {
        return title.charAt(0).toUpperCase() + title.slice(1);
      }
    }

    const positionMatch = message.match(/(?:for|as|position of)\s+(?:the\s+)?([a-z\s]+)/i);
    if (positionMatch) {
      return this.capitalizeName(positionMatch[1].trim());
    }

    return null;
  }

  extractExperience(message) {
    const expMatch = message.match(/(\d+)\s*(?:years?|yrs?)/i);
    if (expMatch) return `${expMatch[1]} years`;
    
    if (/experienced|senior/i.test(message)) return 'Experienced professional';
    if (/entry.level|junior/i.test(message)) return 'Entry level';

    return null;
  }

  extractCountry(message) {
    const countries = [
      'kenya', 'rwanda', 'tanzania', 'uganda', 'ghana', 'cameroon',
      'ethiopia', 'nigeria', 'south africa', 'zambia'
    ];

    const lower = message.toLowerCase();
    for (const country of countries) {
      if (lower.includes(country)) {
        return country.charAt(0).toUpperCase() + country.slice(1);
      }
    }

    return null;
  }

  extractAvailability(message) {
    if (/full.time/i.test(message)) return 'Full-time';
    if (/part.time/i.test(message)) return 'Part-time';
    if (/weekend/i.test(message)) return 'Weekends';
    if (/evening/i.test(message)) return 'Evenings';
    return null;
  }

  extractSkills(message) {
    const skillKeywords = [
      'teaching', 'training', 'agriculture', 'solar', 'education',
      'community', 'project management', 'communications'
    ];

    const foundSkills = [];
    const lower = message.toLowerCase();
    
    for (const skill of skillKeywords) {
      if (lower.includes(skill)) {
        foundSkills.push(skill);
      }
    }

    return foundSkills.length > 0 ? foundSkills.join(', ') : null;
  }

  extractOrganization(message) {
    const orgPatterns = [
      /(?:from|represent|work at)\s+([A-Z][A-Za-z\s&]+(?:Foundation|Organization|NGO|Company))/i,
      /([A-Z][A-Za-z\s&]+(?:Foundation|Organization|NGO))/
    ];

    for (const pattern of orgPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  extractPartnershipType(message) {
    const lower = message.toLowerCase();
    if (/funding|financial/i.test(lower)) return 'Financial';
    if (/technical|expertise/i.test(lower)) return 'Technical';
    if (/project|program/i.test(lower)) return 'Project-based';
    return 'General collaboration';
  }

  extractAmount(message) {
    for (const pattern of this.patterns.amount) {
      const match = message.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }
    return null;
  }

  extractEventName(message) {
    const eventMatch = message.match(/(?:event|workshop)\s+(?:on|about)?\s*["']?([^"'.,!?]+)["']?/i);
    if (eventMatch) {
      return eventMatch[1].trim();
    }
    return null;
  }

  extractSubject(message) {
    const subjectMatch = message.match(/(?:about|regarding|subject:)\s+(.+?)(?:\.|$)/i);
    if (subjectMatch) {
      return subjectMatch[1].trim();
    }

    if (message.length < 100 && !message.includes('\n')) {
      return message.trim();
    }

    return null;
  }

  mergeWithExisting(extracted, existing) {
    const merged = { ...existing };

    for (const [key, value] of Object.entries(extracted)) {
      if (value && !merged[key]) {
        merged[key] = value;
      }
    }

    return merged;
  }

  validate(data, actionType) {
    const errors = [];

    if (data.email && !this.patterns.email.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && data.phone.length < 7) {
      errors.push('Phone number too short');
    }

    if (data.name && data.name.length < 2) {
      errors.push('Name too short');
    }

    return errors;
  }
}

module.exports = InformationExtractor;