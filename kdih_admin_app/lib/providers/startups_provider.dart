/// KDIH Admin App - Startups Provider

import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../models/startup_application.dart';

class StartupsProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<StartupApplication> _applications = [];
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<StartupApplication> get applications => _applications;
  
  List<StartupApplication> get pendingApplications =>
      _applications.where((a) => a.applicationStatus == 'pending').toList();
  List<StartupApplication> get approvedApplications =>
      _applications.where((a) => a.applicationStatus == 'approved').toList();
  List<StartupApplication> get rejectedApplications =>
      _applications.where((a) => a.applicationStatus == 'rejected').toList();
  
  Future<void> loadApplications() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getStartups();
      if (response.data['message'] == 'success') {
        _applications = (response.data['data'] as List? ?? [])
            .map((item) => StartupApplication.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load applications';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<bool> updateStatus(int id, String status) async {
    try {
      final response = await _api.updateStartupStatus(id, status);
      if (response.data['message'] == 'success') {
        await loadApplications();
        return true;
      }
    } catch (e) {
      _error = 'Failed to update status';
    }
    notifyListeners();
    return false;
  }
}
