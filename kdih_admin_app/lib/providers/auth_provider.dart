/// KDIH Admin App - Auth Provider
/// Manages authentication state with JWT tokens

import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants/app_constants.dart';
import '../core/services/api_service.dart';
import '../models/user.dart';

enum AuthStatus { initial, authenticated, unauthenticated, loading }

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  AuthStatus _status = AuthStatus.initial;
  User? _user;
  String? _error;
  
  AuthStatus get status => _status;
  User? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isLoading => _status == AuthStatus.loading;
  
  AuthProvider() {
    _checkAuth();
  }
  
  Future<void> _checkAuth() async {
    _status = AuthStatus.loading;
    notifyListeners();
    
    try {
      await _api.initSession();
      
      // Check if we have a stored token
      final token = _api.authToken;
      if (token == null) {
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        return;
      }
      
      // Load cached user data
      final userData = await _storage.read(key: AppConstants.userDataKey);
      if (userData != null) {
        _user = User.fromJson(jsonDecode(userData));
        _status = AuthStatus.authenticated;
        notifyListeners();
        return;
      }
      
      // Verify token with server
      final response = await _api.checkAuth();
      if (response.data['authenticated'] == true) {
        _user = User.fromJson(response.data['user']);
        await _storage.write(
          key: AppConstants.userDataKey,
          value: jsonEncode(_user!.toJson()),
        );
        _status = AuthStatus.authenticated;
      } else {
        await _api.clearSession();
        _status = AuthStatus.unauthenticated;
      }
    } catch (e) {
      // If verification fails, check if we have cached data
      if (_user != null) {
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    }
    
    notifyListeners();
  }
  
  Future<bool> login(String username, String password) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.login(username, password);
      
      if (response.data['message'] == 'success' && response.data['token'] != null) {
        // Store the JWT token
        final token = response.data['token'];
        await _api.setAuthToken(token);
        
        // Parse user data
        _user = User.fromJson(response.data['user']);
        await _storage.write(
          key: AppConstants.userDataKey,
          value: jsonEncode(_user!.toJson()),
        );
        
        _status = AuthStatus.authenticated;
        notifyListeners();
        return true;
      } else {
        _error = response.data['error'] ?? 'Login failed';
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        return false;
      }
    } on DioException catch (e) {
      if (e.response?.data != null && e.response?.data['error'] != null) {
        _error = e.response?.data['error'];
      } else if (e.response?.statusCode == 401) {
        _error = 'Invalid username or password';
      } else if (e.type == DioExceptionType.connectionTimeout) {
        _error = 'Connection timeout. Please check your internet.';
      } else if (e.type == DioExceptionType.connectionError) {
        _error = 'Cannot connect to server. Check your internet.';
      } else {
        _error = 'Network error: ${e.message}';
      }
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Error: ${e.toString()}';
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }
  
  Future<void> logout() async {
    _status = AuthStatus.loading;
    notifyListeners();
    
    try {
      await _api.logout();
    } catch (e) {
      // Ignore errors during logout
    }
    
    await _api.clearSession();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
  
  Future<void> refreshSession() async {
    try {
      final response = await _api.refreshToken();
      if (response.data['token'] != null) {
        await _api.setAuthToken(response.data['token']);
      }
    } catch (e) {
      // If refresh fails, logout
      await logout();
    }
  }
  
  Future<bool> changePassword(String currentPassword, String newPassword) async {
    try {
      final response = await _api.changePassword(currentPassword, newPassword);
      if (response.data['message'] == 'success') {
        return true;
      }
      _error = response.data['error'] ?? 'Failed to change password';
      return false;
    } catch (e) {
      _error = 'Error: ${e.toString()}';
      return false;
    }
  }
}
