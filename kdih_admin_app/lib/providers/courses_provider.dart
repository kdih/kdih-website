/// KDIH Admin App - Courses Provider

import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../models/course.dart';
import '../models/course_registration.dart';

class CoursesProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<Course> _courses = [];
  List<CourseRegistration> _registrations = [];
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Course> get courses => _courses;
  List<CourseRegistration> get registrations => _registrations;
  int get activeCourseCount => _courses.where((c) => c.status == 'active').length;
  int get pendingRegistrationCount => _registrations.where((r) => !r.isPaid).length;
  
  Future<void> loadCourses() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getCourses();
      if (response.data['message'] == 'success') {
        _courses = (response.data['data'] as List? ?? [])
            .map((item) => Course.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load courses';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<void> loadRegistrations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getRegistrations();
      if (response.data['message'] == 'success') {
        _registrations = (response.data['data'] as List? ?? [])
            .map((item) => CourseRegistration.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load registrations';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<bool> createCourse(Map<String, dynamic> data) async {
    try {
      final response = await _api.createCourse(data);
      if (response.data['message'] == 'success') {
        await loadCourses();
        return true;
      }
    } catch (e) {
      _error = 'Failed to create course';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> updateCourse(int id, Map<String, dynamic> data) async {
    try {
      final response = await _api.updateCourse(id, data);
      if (response.data['message'] == 'success') {
        await loadCourses();
        return true;
      }
    } catch (e) {
      _error = 'Failed to update course';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> deleteCourse(int id) async {
    try {
      final response = await _api.deleteCourse(id);
      if (response.data['message'] == 'success') {
        _courses.removeWhere((c) => c.id == id);
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = 'Failed to delete course';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> updateRegistrationStatus(int id, String status) async {
    try {
      final response = await _api.updateRegistrationStatus(id, status);
      if (response.data['message'] == 'success') {
        await loadRegistrations();
        return true;
      }
    } catch (e) {
      _error = 'Failed to update registration';
    }
    notifyListeners();
    return false;
  }
}
