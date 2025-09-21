const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontFamily:
      '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Header (non-sticky, shorter)
  stickyHeader: {
    position: 'relative', // no stickiness
    top: '0',
    zIndex: 10,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  },

  stickyHeaderContent: {
    maxWidth: '900px', // narrower than before
    margin: '0 auto',
    padding: '0.5rem 1rem', // reduced padding for shorter height
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    justifyContent: 'space-between',
  },

  backButton: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
  },

  countryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
  },

  countryIcon: {
    color: '#0a451c',
  },

  countryTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },

  dropdownContainer: {
    position: 'relative',
  },

  dropdownButton: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },

  dropdownChevron: {
    transition: 'transform 0.2s ease',
  },

  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 50,
    minWidth: '200px',
    maxHeight: '300px',
    overflow: 'hidden',
    marginTop: '0.25rem',
  },

  dropdownHeader: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  dropdownList: {
    maxHeight: '250px',
    overflowY: 'auto',
  },

  dropdownItem: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'left',
  },

  dropdownItemActive: {
    backgroundColor: '#f0fdf4',
    color: '#0a451c',
    fontWeight: '500',
  },

  exploreButton: {
    backgroundColor: '#0a451c',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    fontWeight: '500',
  },

  // Loading states
  loadingContainer: {
    minHeight: '50vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContent: {
    textAlign: 'center',
  },

  loadingSpinner: {
    width: '3rem',
    height: '3rem',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #0a451c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },

  loadingText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#64748b',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Hero Section
  heroSection: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderBottom: '1px solid #e5e7eb',
  },

  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
    textAlign: 'center',
  },

  heroTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },

  heroFlag: {
    fontSize: '3rem',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },

  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.1',
    color: '#0a451c',
    margin: 0,
    fontFamily: '"Nunito Sans", sans-serif',
  },

  heroSubtitle: {
    color: '#64748b',
    marginBottom: '2.5rem',
    fontSize: '1.125rem',
    lineHeight: 1.7,
    maxWidth: '600px',
    margin: '0 auto 2.5rem auto',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
  },

  statCard: {
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },

  statContent: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },

  statIcon: {
    width: '2rem',
    height: '2rem',
    color: '#0a451c',
    margin: '0 auto 0.75rem',
  },

  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0a451c',
    marginBottom: '0.5rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Main Container - Condensed Layout
  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },

  // Placeholder Section
  placeholderSection: {
    padding: '4rem 0',
  },

  placeholderCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '1rem',
    padding: '3rem 2rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    maxWidth: '600px',
    margin: '0 auto',
  },

  placeholderIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
  },

  placeholderTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  placeholderText: {
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: '1rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  placeholderSubtext: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '2rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  placeholderActions: {
    display: 'flex',
    justifyContent: 'center',
  },

  placeholderButton: {
    backgroundColor: '#0a451c',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Section Styles
  section: {
    padding: '3rem 0',
    position: 'relative',
  },

  sectionDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '2rem 0',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '2.5rem',
    textAlign: 'left',
  },

  sectionIcon: {
    width: '2rem',
    height: '2rem',
    color: '#0a451c',
    flexShrink: 0,
    marginTop: '0.25rem',
  },

  sectionTitle: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
    lineHeight: '1.2',
  },

  sectionSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: 1.6,
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Team
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },

  teamCard: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },

  teamCardContent: {
    padding: '1.5rem',
    textAlign: 'center',
  },

  teamAvatar: {
    position: 'relative',
    width: '4rem',
    height: '4rem',
    margin: '0 auto 1rem',
  },

  teamAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '2px solid #0a451c',
  },

  teamAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a451c',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '700',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamPosition: {
    color: '#0a451c',
    fontWeight: '500',
    marginBottom: '0.5rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamDepartment: {
    display: 'inline-block',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginBottom: '1rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamBio: {
    color: '#64748b',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '1rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  },

  teamAction: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Projects
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },

  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  projectImage: {
    position: 'relative',
    height: '10rem',
    overflow: 'hidden',
    background: 'linear-gradient(45deg, #f0fdf4, #dcfce7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  projectImageImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  projectStatus: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: '"Nunito Sans", sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },

  statusOngoing: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },

  statusPlanning: {
    backgroundColor: '#fef3c7',
    color: '#a16207',
  },

  statusOnHold: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },

  projectContent: {
    padding: '1.5rem',
  },

  projectTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  projectDescription: {
    color: '#64748b',
    marginBottom: '1rem',
    lineHeight: 1.6,
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  projectMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  projectMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Events
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },

  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  eventContent: {
    padding: '1.5rem',
  },

  eventHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    gap: '1rem',
  },

  eventTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    flex: '1',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  eventPricePaid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '0.375rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  eventPriceFree: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    padding: '0.375rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  eventDescription: {
    color: '#64748b',
    marginBottom: '1rem',
    lineHeight: 1.6,
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  eventMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  eventMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Contact
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
    maxWidth: '600px',
  },

  contactSection: {
    display: 'flex',
    flexDirection: 'column',
  },

  contactTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1.5rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  contactItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },

  contactItemIcon: {
    width: '1.25rem',
    height: '1.25rem',
    marginTop: '0.125rem',
    flexShrink: 0,
  },

  contactItemContent: {
    flex: 1,
  },

  contactItemLabel: {
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  contactItemValue: {
    color: '#0a451c',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  contactItemMeta: {
    color: '#64748b',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // News styles
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },

  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  newsImage: {
    position: 'relative',
    height: '10rem',
    overflow: 'hidden',
    background: 'linear-gradient(45deg, #f0fdf4, #dcfce7)',
  },

  newsImageImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  newsContent: {
    padding: '1.5rem',
  },

  newsTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  newsExcerpt: {
    color: '#64748b',
    marginBottom: '1rem',
    lineHeight: 1.6,
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  newsMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },

  newsMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Volunteer styles
  volunteerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },

  volunteerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },

  volunteerContent: {
    padding: '1.5rem',
  },

  volunteerTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  volunteerDescription: {
    color: '#64748b',
    marginBottom: '1rem',
    lineHeight: 1.6,
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  volunteerMeta: {
    marginBottom: '1rem',
  },

  volunteerStatus: {
    display: 'inline-block',
  },

  volunteerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  volunteerButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#0a451c',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: '"Nunito Sans", sans-serif',
  },
  
  // Loading States
  loadingContainer: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc'
  },

  loadingContent: {
    textAlign: 'center',
    padding: '2rem'
  },

  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #16a34a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  },

  loadingText: {
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '1rem'
  },

  retryButton: {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  // Layout
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },

  // Sticky Header
  stickyHeader: {
    position: 'sticky',
    top: '0',
    zIndex: '100',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e2e8f0',
    padding: '1rem 0'
  },

  stickyHeaderContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem'
  },

  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  countryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: '1'
  },

  countryIcon: {
    color: '#16a34a'
  },

  countryTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0'
  },

  // Dropdown
  dropdownContainer: {
    position: 'relative'
  },

  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  dropdownChevron: {
    transition: 'transform 0.2s ease'
  },

  dropdownChevronOpen: {
    transform: 'rotate(180deg)'
  },

  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: '0',
    marginTop: '0.5rem',
    width: '280px',
    maxHeight: '400px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    zIndex: '1000'
  },

  dropdownHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    background: '#f8fafc'
  },

  dropdownList: {
    maxHeight: '320px',
    overflowY: 'auto'
  },

  dropdownItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'none',
    color: '#374151',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    textAlign: 'left'
  },

  dropdownItemActive: {
    background: '#f0fdf4',
    color: '#16a34a',
    fontWeight: '500'
  },

  exploreButton: {
    padding: '0.5rem 1rem',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // Hero Section
  heroSection: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  },

  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 32px',
    textAlign: 'center',
    position: 'relative',
    zIndex: '2'
  },

  heroTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem'
  },

  heroFlag: {
    fontSize: '3rem'
  },

  heroTitle: {
    fontSize: '4rem',
    fontWeight: '800',
    margin: '0',
    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em'
  },

  heroSubtitle: {
    fontSize: '1.375rem',
    color: '#cbd5e1',
    marginBottom: '3rem',
    maxWidth: '600px',
    margin: '0 auto 3rem'
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1000px',
    margin: '0 auto'
  },

  statCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },

  statContent: {
    textAlign: 'center'
  },

  statIcon: {
    width: '2rem',
    height: '2rem',
    color: '#10b981',
    margin: '0 auto 0.75rem'
  },

  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'white',
    marginBottom: '0.25rem'
  },

  statLabel: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
    fontWeight: '500'
  },

  // Main Container
  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem'
  },

  // Sections
  section: {
    padding: '4rem 0',
    position: 'relative'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '2.5rem',
    maxWidth: '800px'
  },

  sectionIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: '#16a34a',
    marginTop: '0.25rem',
    flexShrink: '0'
  },

  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
    lineHeight: '1.2'
  },

  sectionSubtitle: {
    fontSize: '1.125rem',
    color: '#64748b',
    margin: '0',
    lineHeight: '1.6'
  },

  sectionDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)',
    marginBottom: '2rem'
  },

  // Placeholder Section
  placeholderSection: {
    padding: '4rem 0',
    display: 'flex',
    justifyContent: 'center'
  },

  placeholderCard: {
    maxWidth: '600px',
    textAlign: 'center',
    background: 'white',
    borderRadius: '16px',
    padding: '3rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },

  placeholderIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem'
  },

  placeholderTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1rem'
  },

  placeholderText: {
    fontSize: '1.125rem',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '1rem'
  },

  placeholderSubtext: {
    fontSize: '1rem',
    color: '#9ca3af',
    marginBottom: '2rem'
  },

  placeholderActions: {
    display: 'flex',
    justifyContent: 'center'
  },

  placeholderButton: {
    padding: '0.75rem 1.5rem',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // News Section
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem'
  },


  newsImage: {
    width: '100%',
    height: '200px',
    overflow: 'hidden'
  },

  newsImageImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },

  newsContent: {
    padding: '1.5rem'
  },

  newsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '0.75rem',
    lineHeight: '1.4'
  },

  newsExcerpt: {
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '1rem'
  },

  newsMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#9ca3af'
  },

  newsMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  // Team Section
  teamSection: {
    padding: '3rem 1rem',
    position: 'relative'
  },

  teamHeader: {
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center'
  },

  teamBadge: {
    display: 'inline-block',
    padding: '0.3rem 1rem',
    background: 'rgba(99,102,241,0.08)',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6366f1'
  },

  teamTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: '0.5rem 0'
  },

  teamSubtitle: {
    color: '#64748b',
    fontSize: '0.95rem'
  },

  teamCarouselWrapper: {
    position: 'relative',
    marginTop: '2rem'
  },

  teamCarouselButtonLeft: {
    position: 'absolute',
    left: '0',
    top: '40%',
    zIndex: '10',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  teamCarouselButtonRight: {
    position: 'absolute',
    right: '0',
    top: '40%',
    zIndex: '10',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  teamCarousel: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    paddingBottom: '1rem'
  },

  teamMemberCard: {
    flex: '0 0 300px',
    padding: '1rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },

  teamMemberHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },

  teamMemberAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '8px',
    objectFit: 'cover'
  },

  teamMemberAvatarPlaceholder: {
    width: '45px',
    height: '45px',
    borderRadius: '8px',
    background: '#6366f1',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  teamMemberInfo: {
    marginLeft: '0.5rem'
  },

  teamMemberName: {
    margin: '0',
    fontSize: '0.9rem'
  },

  teamMemberPosition: {
    color: '#6366f1'
  },

  teamMemberBio: {
    fontSize: '0.8rem',
    color: '#475569'
  },

  teamMemberActions: {
    display: 'flex',
    gap: '0.5rem'
  },

  teamMemberMoreButton: {
    flex: '1',
    fontSize: '0.7rem',
    padding: '0.3rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  teamMemberEmailButton: {
    flex: '1',
    fontSize: '0.7rem',
    padding: '0.3rem',
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#64748b'
  },

  teamBioModal: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000'
  },

  teamBioModalContent: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    maxWidth: '500px'
  },

  // Projects Section
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem'
  },

  projectCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },

  projectImage: {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    position: 'relative'
  },

  projectImageImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },

  projectStatus: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  statusCompleted: {
    background: 'rgba(34, 197, 94, 0.9)',
    color: 'white'
  },

  statusOngoing: {
    background: 'rgba(59, 130, 246, 0.9)',
    color: 'white'
  },

  statusPlanning: {
    background: 'rgba(245, 158, 11, 0.9)',
    color: 'white'
  },

  statusOnHold: {
    background: 'rgba(156, 163, 175, 0.9)',
    color: 'white'
  },

  statusIcon: {
    width: '14px',
    height: '14px'
  },

  projectContent: {
    padding: '1.5rem'
  },

  projectTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '0.75rem',
    lineHeight: '1.4'
  },

  projectDescription: {
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '1rem'
  },

  projectMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#9ca3af'
  },

  projectMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  // Volunteer Section
  volunteerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem'
  },

  volunteerCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  },

  volunteerContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },

  volunteerTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '0.75rem'
  },

  volunteerDescription: {
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '1rem',
    flex: '1'
  },

  volunteerMeta: {
    marginBottom: '1rem'
  },

  volunteerActions: {
    display: 'flex',
    gap: '0.5rem'
  },

  volunteerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: '#16a34a',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer'
  },

  // Events Section
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem'
  },

  eventCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },

  eventContent: {
    height: '100%'
  },

  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
    gap: '1rem'
  },

  eventTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0',
    lineHeight: '1.4'
  },

  eventPricePaid: {
    padding: '0.25rem 0.75rem',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    flexShrink: '0'
  },

  eventPriceFree: {
    padding: '0.25rem 0.75rem',
    background: '#dcfce7',
    color: '#16a34a',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    flexShrink: '0'
  },

  eventDescription: {
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '1rem'
  },

  eventMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#9ca3af'
  },

  eventMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  // Contact Section
  contactGrid: {
    display: 'grid',
    gap: '2rem'
  },

  contactSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },

  contactTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '1.5rem'
  },

  contactItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem'
  },

  contactItemIcon: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    flexShrink: '0'
  },

  contactIconEmail: {
    color: '#16a34a'
  },

  contactIconPhone: {
    color: '#3b82f6'
  },

  contactIconAddress: {
    color: '#8b5cf6'
  },

  contactItemContent: {
    flex: '1'
  },

  contactItemLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem'
  },

  contactItemValue: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#374151',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  },

  contactItemMeta: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    marginTop: '0.25rem'
  },

  // Modal Styles
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0'
  },

  modalHeaderContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem'
  },

  modalIcon: {
    width: '24px',
    height: '24px',
    color: '#16a34a',
    marginTop: '2px'
  },

  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.5rem 0'
  },

  modalSubtitle: {
    color: '#64748b',
    margin: '0'
  },

  modalCloseButton: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },

  modalBody: {
    padding: '1.5rem'
  },

  modalVolunteerGrid: {
    display: 'grid',
    gap: '1rem'
  },

  modalVolunteerCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem'
  },

  modalVolunteerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  modalVolunteerTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0'
  },

  modalVolunteerDescription: {
    color: '#64748b',
    margin: '0'
  },

  modalVolunteerMeta: {
    display: 'flex',
    alignItems: 'center'
  },

  modalVolunteerStatus: {
    display: 'flex',
    alignItems: 'center'
  },

  modalVolunteerActions: {
    display: 'flex',
    gap: '0.5rem'
  },

  modalVolunteerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  modalEmptyState: {
    textAlign: 'center',
    padding: '3rem 1rem'
  },

  modalEmptyIcon: {
    color: '#d1d5db',
    marginBottom: '1rem'
  },

};

export default styles;
