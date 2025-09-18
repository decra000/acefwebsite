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
};

export default styles;
