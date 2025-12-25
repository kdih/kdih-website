/// KDIH Admin App - Dashboard Provider
/// Manages dashboard data and statistics

import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../models/dashboard_stats.dart';

class DashboardProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  DashboardStats? _stats;
  List<RecentActivity> _recentActivity = [];
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  DashboardStats? get stats => _stats;
  List<RecentActivity> get recentActivity => _recentActivity;
  
  Future<void> loadDashboard() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Load stats from analytics endpoint
      final statsResponse = await _api.getAnalytics();
      if (statsResponse.data['message'] == 'success') {
        _stats = DashboardStats.fromJson(statsResponse.data['data'] ?? {});
      }
      
      // Load recent activity if available
      if (statsResponse.data['recent_activity'] != null) {
        _recentActivity = (statsResponse.data['recent_activity'] as List)
            .map((item) => RecentActivity.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load dashboard data';
      // Use default stats if loading fails
      _stats = DashboardStats();
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<void> refresh() async {
    await loadDashboard();
  }
}
