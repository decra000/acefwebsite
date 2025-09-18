


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Import CSS files in the correct order - most specific last
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './theme';
import { LogoProvider } from './context/LogoContext';
import { PermissionRoute, PrivateRoute } from './ProtectedRoutes';
import BlogNewsPage from './pages/Insights/blognews';
import ChatAssistant from './components/ChatAssistant.jsx';
import VisitCounter from './components/visitCounters';

import HomePage from './pages/HomePage';
import LoginForm from './components/LoginForm';
import Profile from './pages/Auths/Profile';
import EventsPublicDisplay from './pages/Events/eventDisplay';
import FindbyCountry from './components/FindbyCountry';
import PublicProjectsDisplay from './pages/Projects/displayProjects';
import DisplayImpact from './pages/Impact/DisplayImpact.js';
import CountriesReached from './pages/Impact/countriesReached.jsx'; 
import Chatbot from './pages/GetInvolved/getinvolved.jsx';
import Impact from './pages/Impact/Impact';
import ForgotPassword from './pages/Auths/ForgotPassword';
import ResetPassword from './pages/Auths/ResetPassword';
import ActivateAccount from './pages/Auths/ActivateAccount';
import AboutUsPage from './pages/AboutUs/AboutUs';
import ProjectsDisplay from './pages/Projects/ProjectsDisplay';
import ContactUsPage from './pages/ContactUs';
import ProjectDetail from './pages/Projects/ProjectDetail';
import Unauthorized from './pages/Auths/Unauthorized';
import Programs from './pages/Programs/programs';
import CompanyLocationsMap from './components/CompanyLocationsMap';
import PrivacyPolicy from './pages/Legals/privacyPolicy';
import TermsOfService from './pages/Legals/termsofservice';
import Sitemap from './pages/sitemap.xml';
import DonationPage from './pages/Donations/DonationModal';
import DonorWall from './pages/Donations/DonorWall';
import CountryInfoDisplay from './pages/AboutUs/CountrySpecificDisplay'; // Import the actual component
import PublicJobDisplay from './pages/PublicJobDisplay'; // Import the actual component

import BadgeGenerator from './pages/admin_dashboard/donorBadge';


import AdminAddCountries from './pages/admin_dashboard/Admin_AddCountries';
import AdminManageContacts from './pages/admin_dashboard/AdminManageContacts';
import AdminAddCategories from './pages/admin_dashboard/Admin_AddCategories';
import AdminManagePartners from './pages/admin_dashboard/Admin_ManagePartners';
import AdminManageTeam from './pages/admin_dashboard/Admin_ManageTeam';
import AdminManageUsers from './pages/admin_dashboard/Admin_ManageUsers';
import AdminDashboard from './pages/admin_dashboard/AdminDashboard';
import AdminManageWhatsapp from './pages/admin_dashboard/AdminManageWhatsapp';
import AdminManageVolunteerForms from './pages/admin_dashboard/AdminManageVolunteerForms';
import AdminManageProjects from './pages/admin_dashboard/AdminManageProjects';
import AdminManageImpact from './pages/admin_dashboard/AdminManageImpact';
import DashboardOverview from './pages/admin_dashboard/Overview';
import ManageBlogs from './pages/admin_dashboard/ManageBlogs';
import AdminDonationManagement from './pages/admin_dashboard/AdminDonationManagement';
import AdminManageLogo from './pages/admin_dashboard/AdminManageLogo';
import NewsletterManagement from './pages/admin_dashboard/NewsletterManagement';
import TransactionDetails from './pages/admin_dashboard/Admin_ManageTransactions';
import AdminManageVideos from './pages/admin_dashboard/AdminManageVideos';
import AdminManagePillars from './pages/admin_dashboard/AdminManagePillars';
import AdminManageEvents from './pages/admin_dashboard/AdminManageEvents';
import AdminManageJobs from './pages/admin_dashboard/AdminManageJobs';
import AdminCollaborationManagement from './pages/admin_dashboard/AdminCollaborationManagement';
import AdminManageHighlights from './pages/admin_dashboard/AdminManageHighlights';
import GalleryManager from './pages/admin_dashboard/GalleryManager';
import AdminManageGeneralTestimonials from './pages/admin_dashboard/AdminManageGeneralTestimonials';



// Inner App component that uses theme context
const AppContent = () => {
  const { muiTheme } = useTheme();

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthProvider>
        <LogoProvider>
          <div className="appWrapper">
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/activate-account/:token" element={<ActivateAccount />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/get-involved" element={<Chatbot />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/donate" element={<DonationPage />} />
                <Route path="/donor-wall" element={<DonorWall />} />
                <Route path="/insights" element={<BlogNewsPage />} />
                <Route path="/projects" element={<ProjectsDisplay />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/impact-statistics" element={<DisplayImpact />} />
                <Route path="/CompanyLocationsMap" element={<CompanyLocationsMap />} />
                <Route path="/CountryInfoDisplay" element={<CountryInfoDisplay />} />
                <Route path="/events" element={<EventsPublicDisplay />} />
                <Route path="/jobs" element={<PublicJobDisplay />} />
                 <Route path="/countries" element={<CountriesReached />} />
                <Route path="/country/:countryName" element={<CountryInfoDisplay />} />
                <Route path="/findbycountry" element={<FindbyCountry />} />
                <Route path="/projectscatalogue" element={<PublicProjectsDisplay />} />

 
                {/* Legal Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/sitemap.xml" element={<Sitemap />} />

                {/* Protected Routes with Permission-Based Access Control */}
                <Route element={<PrivateRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Admin Dashboard with nested permission-based routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />}>
                    {/* Dashboard Overview - accessible to all authenticated users */}
                    <Route index element={<DashboardOverview />} />
                    
                    {/* Admin-only routes */}
                    <Route 
                      path="categories" 
                      element={
                        <PermissionRoute path="/admin/dashboard/categories">
                          <AdminAddCategories />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="countries" 
                      element={
                        <PermissionRoute path="/admin/dashboard/countries">
                          <AdminAddCountries />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="users" 
                      element={
                        <PermissionRoute path="/admin/dashboard/users">
                          <AdminManageUsers />
                        </PermissionRoute>
                      } 
                    />

                    <Route 
                      path="jobmanager" 
                      element={
                        <PermissionRoute path="/admin/dashboard/jobmanager">
                          <AdminManageJobs />
                        </PermissionRoute>
                      } 
                    />



                     <Route 
                      path="collaboration" 
                      element={
                        <PermissionRoute path="/admin/dashboard/collaboration">
                          <AdminCollaborationManagement />
                        </PermissionRoute>
                      } 
                    />


                     <Route 
                      path="highlights" 
                      element={
                        <PermissionRoute path="/admin/dashboard/highlights">
                          <AdminManageHighlights />
                        </PermissionRoute>
                      } 
                    />

                      <Route 
                      path="gallerymanager" 
                      element={
                        <PermissionRoute path="/admin/dashboard/gallerymanager">
                          <GalleryManager />
                        </PermissionRoute>
                      } 
                    />


 <Route 
                      path="adminmanagegeneraltestimonials" 
                      element={
                        <PermissionRoute path="/admin/dashboard/adminmanagegeneraltestimonials">
                          <AdminManageGeneralTestimonials />
                        </PermissionRoute>
                      } 
                    />











                    <Route 
                      path="generator" 
                      element={
                        <PermissionRoute path="/admin/dashboard/generator">
                          <BadgeGenerator />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="manage-logo" 
                      element={
                        <PermissionRoute path="/admin/dashboard/manage-logo">
                          <AdminManageLogo />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="manage-transactions" 
                      element={
                        <PermissionRoute path="/admin/dashboard/manage-transactions">
                          <TransactionDetails />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="whatsapp" 
                      element={
                        <PermissionRoute path="/admin/dashboard/whatsapp">
                          <AdminManageWhatsapp />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="managedonate" 
                      element={
                        <PermissionRoute path="/admin/dashboard/managedonate">
                          <AdminDonationManagement />
                        </PermissionRoute>
                      } 
                    />

                    {/* Permission-based routes (Admin + Assistant Admin with specific permissions) */}
                    <Route 
                      path="manage-blogs" 
                      element={
                        <PermissionRoute path="/admin/dashboard/manage-blogs">
                          <ManageBlogs />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="projects" 
                      element={
                        <PermissionRoute path="/admin/dashboard/projects">
                          <AdminManageProjects />
                        </PermissionRoute>
                      } 
                    />

                     <Route 
                      path="pillars" 
                      element={
                        <PermissionRoute path="/admin/dashboard/pillars">
                          <AdminManagePillars />
                        </PermissionRoute>
                      } 
                    />

                  
                  
                    <Route 
                      path="team" 
                      element={
                        <PermissionRoute path="/admin/dashboard/team">
                          <AdminManageTeam />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="partners" 
                      element={
                        <PermissionRoute path="/admin/dashboard/partners">
                          <AdminManagePartners />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="newsletter" 
                      element={
                        <PermissionRoute path="/admin/dashboard/newsletter">
                          <NewsletterManagement />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="manage-videos" 
                      element={
                        <PermissionRoute path="/admin/dashboard/manage-videos">
                          <AdminManageVideos />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="contacts" 
                      element={
                        <PermissionRoute path="/admin/dashboard/contacts">
                          <AdminManageContacts />
                        </PermissionRoute>
                      } 
                    />
 <Route 
                      path="events" 
                      element={
                        <PermissionRoute path="/admin/dashboard/events">
                          <AdminManageEvents />
                        </PermissionRoute>
                      } 
                    />

                    
                    <Route 
                      path="volunteers" 
                      element={
                        <PermissionRoute path="/admin/dashboard/volunteers">
                          <AdminManageVolunteerForms />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="impact" 
                      element={
                        <PermissionRoute path="/admin/dashboard/impact">
                          <AdminManageImpact />
                        </PermissionRoute>
                      } 
                    />

                    {/* Analytics route - accessible to all authenticated users */}
                    <Route path="analytics" element={<VisitCounter />} />
                  </Route>
                </Route>
              </Routes>

              {/* Chat Assistant available on all pages */}
              <ChatAssistant />
            </Router>
          </div>
        </LogoProvider>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

// Main App component
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;