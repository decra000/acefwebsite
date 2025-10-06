// volunteerQuestions.js - Question flow for volunteer applications

export const volunteerQuestions = [
  // Step 1: Basic Information
  {
    key: 'email',
    question: 'Let\'s start with your email address so we can stay in touch.',
    type: 'email',
    required: true,
    validation: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  {
    key: 'nationality',
    question: 'What is your nationality?',
    type: 'text',
    required: true
  },
  {
    key: 'country_of_residence',
    question: 'Which country do you currently reside in?',
    type: 'text',
    required: true
  },
  {
    key: 'city_of_residence',
    question: 'What city do you live in?',
    type: 'text',
    required: true
  },
  {
    key: 'application_country',
    question: (formData) => {
      return `Which country would you like to volunteer in with ACEF?`;
    },
    type: 'text',
    required: true
  },

  // Step 2: Professional Background
  {
    key: 'core_professional_area',
    question: 'What is your core professional area or field of expertise?',
    type: 'text',
    required: false,
    placeholder: 'e.g., Environmental Science, Education, Legal, Technology'
  },
  {
    key: 'skills',
    question: 'What relevant skills can you bring to your volunteer work?',
    type: 'textarea',
    required: false,
    placeholder: 'e.g., project management, research, writing, community outreach'
  },
  {
    key: 'interests',
    question: 'What areas or causes are you most passionate about?',
    type: 'textarea',
    required: false,
    placeholder: 'e.g., environmental justice, education access, legal reform'
  },

  // Step 3: Availability
  {
    key: 'time_commitment_weeks',
    question: 'How many weeks can you commit to volunteering?',
    type: 'number',
    required: false,
    validation: (value) => {
      if (value && (isNaN(value) || value < 1)) {
        return 'Please enter a valid number of weeks (minimum 1)';
      }
      return null;
    }
  },
  {
    key: 'preferred_duration',
    question: 'What is your preferred duration of engagement?',
    type: 'select',
    options: ['1-3 months', '3-6 months', '6-12 months', '1+ year'],
    required: false
  },
  {
    key: 'anticipated_start_date',
    question: 'When would you ideally like to start volunteering?',
    type: 'date',
    required: false
  },
  {
    key: 'engagement_preference',
    question: 'How would you prefer to engage with us?',
    type: 'select',
    options: ['In-Person', 'Remote', 'Hybrid'],
    required: true
  },
  {
    key: 'confirmed_in_person',
    question: (formData) => {
      return `To confirm: You are available to volunteer in person in ${formData.application_country || 'your selected country'}. Is this correct?`;
    },
    type: 'select',
    options: ['Yes, I confirm', 'No, I need to reconsider'],
    required: true,
    condition: (formData) => formData.engagement_preference === 'In-Person'
  },

  // Step 4: Motivation
  {
    key: 'why_volunteer',
    question: 'Why would you like to volunteer with ACEF? What motivates you to contribute to our mission?',
    type: 'textarea',
    required: true,
    validation: (value) => {
      if (value && value.trim().length < 50) {
        return 'Please provide a more detailed response (at least 50 characters)';
      }
      return null;
    }
  },

  // Step 5: Study Program & Sponsorship
  {
    key: 'is_study_program',
    question: 'Are you doing this volunteer work as part of a study program or academic requirement?',
    type: 'select',
    options: ['Yes', 'No'],
    required: false
  },
  {
    key: 'has_sponsor',
    question: 'Do you currently have a sponsor or instructing institution supporting your volunteer work?',
    type: 'select',
    options: ['Yes', 'No'],
    required: false
  },
  {
    key: 'sponsor_name',
    question: 'What is the name of your sponsor or institution?',
    type: 'text',
    required: true,
    condition: (formData) => formData.has_sponsor === 'Yes'
  },
  {
    key: 'sponsor_type',
    question: 'What type of organization is your sponsor?',
    type: 'select',
    options: ['University', 'Organization', 'Government', 'Private', 'Other'],
    required: false,
    condition: (formData) => formData.has_sponsor === 'Yes'
  },
  {
    key: 'sponsor_documents_url',
    question: 'If you have supporting documents (letters, agreements, etc.), please share a link to them (Google Drive, Dropbox, etc.)',
    type: 'url',
    required: false,
    condition: (formData) => formData.has_sponsor === 'Yes',
    validation: (value) => {
      if (value && value.trim()) {
        try {
          new URL(value);
          return null;
        } catch {
          return 'Please enter a valid URL';
        }
      }
      return null;
    }
  },
  {
    key: 'sponsor_notes',
    question: 'Any additional notes about your sponsorship or institutional arrangement?',
    type: 'textarea',
    required: false,
    condition: (formData) => formData.has_sponsor === 'Yes'
  },
  {
    key: 'open_to_sponsorship_connections',
    question: 'Would you be interested in being connected with potential sponsorship opportunities?',
    type: 'select',
    options: ['Yes, I\'m interested', 'No, thank you'],
    required: false
  },

  // Step 6: Final Remarks
  {
    key: 'additional_remarks',
    question: 'Is there anything else you\'d like us to know about your application?',
    type: 'textarea',
    required: false,
    placeholder: 'Any additional information, special requirements, or questions you have'
  }
];

export default volunteerQuestions;