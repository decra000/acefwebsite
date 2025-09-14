// ACEF Partnership Questions - Streamlined Version
export const questions = [
  {
    key: 'applicantType',
    question: "Are you applying as an individual or representing an organization?",
    type: 'select',
    options: ['Individual', 'Organization'],
    required: true
  },
  {
    key: 'fullName',
    question: (formData) => formData.applicantType === 'Individual' 
      ? "What's your full name?" 
      : "What's your organization's full name?",
    type: 'text',
    required: true,
    validation: (value) => value.trim().length >= 2 ? null : 'Name must be at least 2 characters'
  },
  {
    key: 'email',
    question: "What's your primary email address?",
    type: 'email',
    required: true,
    validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Please enter a valid email address'
  },
  {
    key: 'country',
    question: "Which country are you based in?",
    type: 'select',
    options: [
      "Cameroon", "Kenya", "Nigeria", "Ghana", "Uganda", "Tanzania", "Zimbabwe", "Zambia", 
      "Sierra Leone", "Liberia", "Rwanda", "Benin", "Togo", "DR Congo", "Somalia",
      "South Africa", "Ethiopia", "Senegal", "Mali", "Burkina Faso", "Ivory Coast",
      "Mozambique", "Madagascar", "Angola", "Chad", "Niger", "Guinea", "Malawi",
      "Botswana", "Namibia", "Mauritius", "Seychelles", "Gabon", "Equatorial Guinea",
      "Central African Republic", "Republic of Congo", "Djibouti", "Eritrea", 
      "South Sudan", "Lesotho", "Swaziland", "Gambia", "Guinea-Bissau", "Cape Verde",
      "Comoros", "Sao Tome and Principe", "Other"
    ],
    required: true
  },
  {
    key: 'organizationType',
    question: "What type of organization do you represent?",
    type: 'select',
    options: [
      'Youth-led NGO/Non-Profit', 
      'Environmental NGO', 
      'Climate Action Organization',
      'Community-Based Organization',
      'Educational Institution', 
      'Research Institute',
      'Government Institution', 
      'UN Agency/International Organization',
      'Private Company/Social Enterprise', 
      'Tech Company',
      'Legal/Advocacy Organization',
      'Healthcare Organization',
      'Faith-Based Organization',
      'Other'
    ],
    condition: (formData) => formData.applicantType === 'Organization',
    required: true
  },
  {
    key: 'individualProfession',
    question: "What's your current profession/occupation?",
    type: 'text',
    condition: (formData) => formData.applicantType === 'Individual',
    required: true,
    validation: (value) => value.trim().length >= 3 ? null : 'Please provide your profession'
  },
  {
    key: 'expertise',
    question: (formData) => formData.applicantType === 'Individual'
      ? "What are your key skills or areas of expertise? (e.g., Climate Science, Environmental Law, Community Development, Digital Technology, Agriculture, Marine Conservation)"
      : "What are your organization's core competencies and focus areas related to climate, environment, or sustainable development?",
    type: 'textarea',
    required: true,
    validation: (value) => value.trim().length >= 30 ? null : 'Please provide at least 30 characters describing your expertise'
  },
  {
    key: 'previousExperience',
    question: (formData) => formData.applicantType === 'Individual'
      ? "Do you have previous experience in climate action, environmental conservation, or sustainable development projects?"
      : "Does your organization have experience in climate action, environmental conservation, or sustainable development initiatives?",
    type: 'select',
    options: ['Yes - Extensive experience (5+ years)', 'Yes - Moderate experience (2-4 years)', 'Some experience (Less than 2 years)', 'No - New to this field but passionate to learn'],
    required: true
  },
  {
    key: 'acefFocusAreas',
    question: "Which ACEF programme areas align most with your interests/expertise? (Select your primary area of interest)",
    type: 'select',
    options: [
      'Climate Resilience & Adaptation',
      'Net Zero & Energy Access', 
      'Climate Migration, Peace & Security',
      'Chemicals & Waste Management',
      'Natural Resources Conservation (Terrestrial & Aquatic)',
      'WASH (Water, Sanitation, and Hygiene)',
      'Agriculture & Food Security',
      'Education Access & Environmental Literacy',
      'Health Access & Environmental Health',
      'Youth Empowerment & Green Job Creation',
      'Policy Advocacy & International Engagement',
      'Marine Conservation & Ocean Literacy',
      'All of the above'
    ],
    required: true
  },
  {
    key: 'collaborationIdea',
    question: "Describe your specific collaboration idea with ACEF. How do you envision working together to address climate and environmental challenges in Africa?",
    type: 'textarea',
    required: true,
    validation: (value) => value.trim().length >= 100 ? null : 'Please provide at least 100 characters describing your collaboration idea'
  },
  {
    key: 'resources',
    question: "What resources can you contribute to this partnership? (e.g., technical skills, funding, expertise, networks, time commitment, local knowledge)",
    type: 'textarea',
    required: true,
    validation: (value) => value.trim().length >= 30 ? null : 'Please describe the resources you can contribute (minimum 30 characters)'
  },
  {
    key: 'youthFocus',
    question: (formData) => formData.applicantType === 'Individual'
      ? "How do you see yourself contributing to ACEF's mission of youth empowerment in climate and environmental action?"
      : "How does your organization support or plan to support youth empowerment in climate and environmental initiatives?",
    type: 'textarea',
    required: true,
    validation: (value) => value.trim().length >= 50 ? null : 'Please describe your approach to youth empowerment (minimum 50 characters)'
  },
  {
    key: 'expectations',
    question: "What specific outcomes do you hope to achieve through this partnership with ACEF?",
    type: 'textarea',
    required: true,
    validation: (value) => value.trim().length >= 40 ? null : 'Please describe your expected outcomes (minimum 40 characters)'
  },
  {
    key: 'challenges',
    question: "What do you see as the main climate or environmental challenges in your region that this collaboration could help address?",
    type: 'textarea',
    required: true,
    validation: (value) => value.trim().length >= 40 ? null : 'Please describe the challenges you want to address (minimum 40 characters)'
  },
  {
    key: 'proposalLink',
    question: "If you have a detailed proposal, project document, or additional materials, please share the link here (optional):",
    type: 'text',
    required: false,
    validation: (value) => {
      if (!value.trim()) return null;
      const urlPattern = /^https?:\/\/.+\..+/;
      return urlPattern.test(value.trim()) ? null : 'Please enter a valid URL starting with http:// or https://';
    }
  },
  {
    key: 'additionalInfo',
    question: "Is there anything else you'd like ACEF to know about your collaboration proposal?",
    type: 'textarea',
    required: false
  }
]