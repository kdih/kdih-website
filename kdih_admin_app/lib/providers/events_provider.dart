/// KDIH Admin App - Events Provider

import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../models/event.dart';

class EventsProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<Event> _events = [];
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Event> get events => _events;
  List<Event> get upcomingEvents => _events.where((e) => e.isUpcoming).toList();
  int get upcomingCount => upcomingEvents.length;
  
  Future<void> loadEvents() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getEvents();
      if (response.data['message'] == 'success') {
        _events = (response.data['data'] as List? ?? [])
            .map((item) => Event.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load events';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<bool> createEvent(Map<String, dynamic> data) async {
    try {
      final response = await _api.createEvent(data);
      if (response.data['message'] == 'success') {
        await loadEvents();
        return true;
      }
    } catch (e) {
      _error = 'Failed to create event';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> updateEvent(int id, Map<String, dynamic> data) async {
    try {
      final response = await _api.updateEvent(id, data);
      if (response.data['message'] == 'success') {
        await loadEvents();
        return true;
      }
    } catch (e) {
      _error = 'Failed to update event';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> deleteEvent(int id) async {
    try {
      final response = await _api.deleteEvent(id);
      if (response.data['message'] == 'success') {
        _events.removeWhere((e) => e.id == id);
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = 'Failed to delete event';
    }
    notifyListeners();
    return false;
  }
}
