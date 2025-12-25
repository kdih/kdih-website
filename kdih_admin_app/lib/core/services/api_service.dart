/// KDIH Admin App - API Service
/// Handles all HTTP requests to the backend with JWT authentication

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  String? _authToken;
  
  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: AppConstants.connectionTimeout,
      receiveTimeout: AppConstants.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    // Add interceptors for JWT authentication
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add JWT token if available
        if (_authToken != null) {
          options.headers['Authorization'] = 'Bearer $_authToken';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        // Handle 401 errors - token expired
        if (error.response?.statusCode == 401) {
          clearSession();
        }
        return handler.next(error);
      },
    ));
  }
  
  // Initialize stored session - load token from storage
  Future<void> initSession() async {
    _authToken = await _storage.read(key: AppConstants.authTokenKey);
  }
  
  // Set auth token
  Future<void> setAuthToken(String token) async {
    _authToken = token;
    await _storage.write(key: AppConstants.authTokenKey, value: token);
  }
  
  // Get current auth token
  String? get authToken => _authToken;
  
  // Clear session data
  Future<void> clearSession() async {
    _authToken = null;
    await _storage.delete(key: AppConstants.authTokenKey);
    await _storage.delete(key: AppConstants.userDataKey);
  }
  
  // ==================== AUTH ====================
  
  Future<Response> login(String username, String password) async {
    return await _dio.post(
      AppConstants.loginEndpoint,
      data: {'username': username, 'password': password},
    );
  }
  
  Future<Response> checkAuth() async {
    return await _dio.get(AppConstants.checkAuthEndpoint);
  }
  
  Future<Response> refreshToken() async {
    return await _dio.post(AppConstants.refreshTokenEndpoint);
  }
  
  Future<Response> logout() async {
    final response = await _dio.post(AppConstants.logoutEndpoint);
    await clearSession();
    return response;
  }
  
  // ==================== MEMBERS ====================
  
  Future<Response> getMembers({int page = 1, int limit = 20, String? search}) async {
    return await _dio.get(
      AppConstants.membersEndpoint,
      queryParameters: {
        'page': page,
        'limit': limit,
        if (search != null && search.isNotEmpty) 'search': search,
      },
    );
  }
  
  Future<Response> getMember(int id) async {
    return await _dio.get('${AppConstants.membersEndpoint}/$id');
  }
  
  Future<Response> createMember(Map<String, dynamic> data) async {
    return await _dio.post(AppConstants.membersEndpoint, data: data);
  }
  
  Future<Response> quickAddMember(Map<String, dynamic> data) async {
    return await _dio.post(AppConstants.quickAddMemberEndpoint, data: data);
  }
  
  Future<Response> updateMember(int id, Map<String, dynamic> data) async {
    return await _dio.put('${AppConstants.membersEndpoint}/$id', data: data);
  }
  
  Future<Response> deleteMember(int id) async {
    return await _dio.delete('${AppConstants.membersEndpoint}/$id');
  }
  
  // ==================== MESSAGES ====================
  
  Future<Response> getMessages({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.messagesEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  Future<Response> deleteMessage(int id) async {
    return await _dio.delete('${AppConstants.messagesEndpoint}/$id');
  }
  
  // ==================== COURSES ====================
  
  Future<Response> getCourses() async {
    return await _dio.get(AppConstants.adminCoursesEndpoint);
  }
  
  Future<Response> createCourse(Map<String, dynamic> data) async {
    return await _dio.post(AppConstants.coursesEndpoint, data: data);
  }
  
  Future<Response> updateCourse(int id, Map<String, dynamic> data) async {
    return await _dio.put('${AppConstants.coursesEndpoint}/$id', data: data);
  }
  
  Future<Response> deleteCourse(int id) async {
    return await _dio.delete('${AppConstants.coursesEndpoint}/$id');
  }
  
  // ==================== REGISTRATIONS ====================
  
  Future<Response> getRegistrations({int page = 1, int limit = 20, String? status}) async {
    return await _dio.get(
      AppConstants.registrationsEndpoint,
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
    );
  }
  
  Future<Response> updateRegistration(int id, Map<String, dynamic> data) async {
    return await _dio.put('${AppConstants.registrationsEndpoint}/$id', data: data);
  }
  
  // ==================== COWORKING ====================
  
  Future<Response> getBookings({String? status, int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.bookingsEndpoint,
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
    );
  }
  
  Future<Response> updateBooking(int id, Map<String, dynamic> data) async {
    return await _dio.put('${AppConstants.bookingsEndpoint}/$id', data: data);
  }
  
  Future<Response> getCoworkingMembers({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.coworkingMembersEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  // ==================== EVENTS ====================
  
  Future<Response> getEvents({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.eventsEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  Future<Response> createEvent(Map<String, dynamic> data) async {
    return await _dio.post(AppConstants.eventsEndpoint, data: data);
  }
  
  Future<Response> updateEvent(int id, Map<String, dynamic> data) async {
    return await _dio.put('${AppConstants.eventsEndpoint}/$id', data: data);
  }
  
  Future<Response> deleteEvent(int id) async {
    return await _dio.delete('${AppConstants.eventsEndpoint}/$id');
  }
  
  // ==================== STARTUPS ====================
  
  Future<Response> getStartups({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.startupsEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  Future<Response> updateStartup(int id, Map<String, dynamic> data) async {
    return await _dio.put('${AppConstants.startupsEndpoint}/$id', data: data);
  }
  
  // ==================== CERTIFICATES ====================
  
  Future<Response> getCertificates({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.certificatesEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  Future<Response> createCertificate(Map<String, dynamic> data) async {
    return await _dio.post(AppConstants.certificatesEndpoint, data: data);
  }
  
  // ==================== GALLERY ====================
  
  Future<Response> getGallery({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.galleryEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  // ==================== JOBS ====================
  
  Future<Response> getJobs({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.jobsEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  Future<Response> createJob(Map<String, dynamic> data) async {
    return await _dio.post(AppConstants.jobsEndpoint, data: data);
  }
  
  Future<Response> updateJob(int id, Map<String, dynamic> data) async {
    return await _dio.put('${AppConstants.jobsEndpoint}/$id', data: data);
  }
  
  Future<Response> deleteJob(int id) async {
    return await _dio.delete('${AppConstants.jobsEndpoint}/$id');
  }
  
  Future<Response> getJobApplications({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.jobApplicationsEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  // ==================== ANALYTICS ====================
  
  Future<Response> getAnalytics() async {
    return await _dio.get(AppConstants.analyticsEndpoint);
  }
  
  // ==================== COWORKING ADDITIONAL ====================
  
  Future<Response> assignDesk(Map<String, dynamic> data) async {
    return await _dio.post(AppConstants.assignDeskEndpoint, data: data);
  }
  
  Future<Response> checkIn(int bookingId) async {
    return await _dio.post('${AppConstants.bookingsEndpoint}/$bookingId/check-in');
  }
  
  Future<Response> checkOut(int bookingId) async {
    return await _dio.post('${AppConstants.bookingsEndpoint}/$bookingId/check-out');
  }
  
  // ==================== GALLERY ADDITIONAL ====================
  
  Future<Response> createGalleryItem(Map<String, dynamic> data) async {
    return await _dio.post(AppConstants.galleryEndpoint, data: data);
  }
  
  Future<Response> deleteGalleryItem(int id) async {
    return await _dio.delete('${AppConstants.galleryEndpoint}/$id');
  }
  
  // ==================== FINANCE ====================
  
  Future<Response> getFinanceOverview() async {
    return await _dio.get(AppConstants.financeOverviewEndpoint);
  }
  
  Future<Response> getRevenueAnalytics() async {
    return await _dio.get(AppConstants.revenueAnalyticsEndpoint);
  }
  
  // ==================== CERTIFICATES ADDITIONAL ====================
  
  Future<Response> initiateCertificate(Map<String, dynamic> data) async {
    return await _dio.post('${AppConstants.certificatesEndpoint}/initiate', data: data);
  }
  
  Future<Response> confirmFinance(int id, Map<String, dynamic> data) async {
    return await _dio.post('${AppConstants.certificatesEndpoint}/$id/confirm-payment', data: data);
  }
  
  Future<Response> approveCertificate(int id) async {
    return await _dio.post('${AppConstants.certificatesEndpoint}/$id/approve');
  }
  
  Future<Response> rejectCertificate(int id, String reason) async {
    return await _dio.post('${AppConstants.certificatesEndpoint}/$id/reject', data: {'reason': reason});
  }
  
  // ==================== STARTUPS ADDITIONAL ====================
  
  Future<Response> updateStartupStatus(int id, String status) async {
    return await _dio.put('${AppConstants.startupsEndpoint}/$id', data: {'status': status});
  }
  
  // ==================== AUTH ADDITIONAL ====================
  
  Future<Response> changePassword(String currentPassword, String newPassword) async {
    return await _dio.post(AppConstants.changePasswordEndpoint, data: {
      'current_password': currentPassword,
      'new_password': newPassword,
    });
  }
  
  // ==================== REGISTRATION STATUS ====================
  
  Future<Response> updateRegistrationStatus(int id, String status) async {
    return await _dio.put('${AppConstants.registrationsEndpoint}/$id', data: {'status': status});
  }
  
  // ==================== COWORKING BOOKINGS ====================
  
  Future<Response> getCoworkingBookings({String? status, int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.coworkingBookingsEndpoint,
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
    );
  }
  
  Future<Response> getExpiredBookings({int page = 1, int limit = 20}) async {
    return await _dio.get(
      AppConstants.expiredBookingsEndpoint,
      queryParameters: {'page': page, 'limit': limit},
    );
  }
  
  // ==================== MESSAGES REPLY ====================
  
  Future<Response> replyToMessage(int id, String reply) async {
    return await _dio.post('${AppConstants.messagesEndpoint}/$id/reply', data: {'reply': reply});
  }
}
