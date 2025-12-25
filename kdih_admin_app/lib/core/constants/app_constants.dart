/// KDIH Admin App - Core Constants
/// API endpoints and app-wide configuration

class AppConstants {
  // Base API URL - Production
  static const String baseUrl = 'https://kdih.org/api';
  
  // For local development, uncomment below:
  // static const String baseUrl = 'http://localhost:3000/api';
  // For Android emulator: 'http://10.0.2.2:3000/api'
  
  // App Info
  static const String appName = 'KDIH Admin';
  static const String appVersion = '1.0.0';
  
  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const String sessionIdKey = 'session_id';
  static const String rememberMeKey = 'remember_me';
  
  // API Endpoints - Mobile JWT Authentication
  static const String loginEndpoint = '/mobile/login';
  static const String checkAuthEndpoint = '/mobile/check-auth';
  static const String refreshTokenEndpoint = '/mobile/refresh-token';
  static const String logoutEndpoint = '/logout';
  static const String changePasswordEndpoint = '/change-password';
  
  // Members
  static const String membersEndpoint = '/members';
  static const String quickAddMemberEndpoint = '/members/quick-add';
  
  // Messages
  static const String messagesEndpoint = '/messages';
  
  // Courses
  static const String coursesEndpoint = '/courses';
  static const String adminCoursesEndpoint = '/admin/courses';
  
  // Course Registrations
  static const String registrationsEndpoint = '/admin/registrations';
  
  // Events
  static const String eventsEndpoint = '/events';
  
  // Startups
  static const String startupsEndpoint = '/admin/startups';
  
  // Coworking
  static const String coworkingMembersEndpoint = '/admin/coworking/members';
  static const String coworkingBookingsEndpoint = '/admin/coworking/bookings';
  static const String bookingsEndpoint = '/admin/coworking/bookings';
  static const String expiredBookingsEndpoint = '/admin/coworking/expired-bookings';
  static const String assignDeskEndpoint = '/admin/coworking/assign-desk';
  
  // Gallery
  static const String galleryEndpoint = '/gallery';
  
  // Certificates
  static const String certificatesEndpoint = '/admin/certificates';
  
  // Analytics
  static const String analyticsEndpoint = '/admin/analytics';
  static const String statsEndpoint = '/stats';
  
  // Finance
  static const String financeOverviewEndpoint = '/admin/finance/dashboard-summary';
  static const String revenueAnalyticsEndpoint = '/admin/finance/revenue-analytics';
  static const String paymentRecordsEndpoint = '/admin/finance/payment-records';
  
  // Jobs
  static const String jobsEndpoint = '/admin/jobs';
  static const String jobApplicationsEndpoint = '/admin/job-applications';
  
  // Backups
  static const String backupsEndpoint = '/admin/backups';
  
  // Services
  static const String servicesEndpoint = '/services';
  
  // Admins
  static const String adminsEndpoint = '/admin/users';
  
  // Trainers
  static const String trainersEndpoint = '/admin/trainers';
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
