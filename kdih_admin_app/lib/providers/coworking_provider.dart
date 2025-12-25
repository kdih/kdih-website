/// KDIH Admin App - Coworking Provider

import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../models/coworking.dart';

class CoworkingProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<CoworkingMember> _members = [];
  List<DeskBooking> _bookings = [];
  List<DeskBooking> _expiredBookings = [];
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<CoworkingMember> get members => _members;
  List<DeskBooking> get bookings => _bookings;
  List<DeskBooking> get expiredBookings => _expiredBookings;
  
  List<DeskBooking> get todayBookings {
    final today = DateTime.now();
    return _bookings.where((b) {
      if (b.bookingDate == null) return false;
      return b.bookingDate!.year == today.year &&
             b.bookingDate!.month == today.month &&
             b.bookingDate!.day == today.day;
    }).toList();
  }
  
  Future<void> loadMembers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getCoworkingMembers();
      if (response.data['message'] == 'success') {
        _members = (response.data['data'] as List? ?? [])
            .map((item) => CoworkingMember.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load coworking members';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<void> loadBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getCoworkingBookings();
      if (response.data['message'] == 'success') {
        _bookings = (response.data['data'] as List? ?? [])
            .map((item) => DeskBooking.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load bookings';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<void> loadExpiredBookings() async {
    try {
      final response = await _api.getExpiredBookings();
      if (response.data['message'] == 'success') {
        final desks = response.data['data']?['desks'] as List? ?? [];
        _expiredBookings = desks.map((item) => DeskBooking.fromJson(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      _error = 'Failed to load expired bookings';
      notifyListeners();
    }
  }
  
  Future<bool> assignDesk(Map<String, dynamic> data) async {
    try {
      final response = await _api.assignDesk(data);
      if (response.data['message']?.toString().contains('success') == true ||
          response.data['booking_id'] != null) {
        await loadBookings();
        return true;
      }
    } catch (e) {
      _error = 'Failed to assign desk';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> checkIn(int bookingId) async {
    try {
      final response = await _api.checkIn(bookingId);
      if (response.data['message']?.toString().contains('success') == true) {
        await loadBookings();
        return true;
      }
    } catch (e) {
      _error = 'Failed to check in';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> checkOut(int bookingId) async {
    try {
      final response = await _api.checkOut(bookingId);
      if (response.data['message']?.toString().contains('success') == true) {
        await loadBookings();
        return true;
      }
    } catch (e) {
      _error = 'Failed to check out';
    }
    notifyListeners();
    return false;
  }
}
