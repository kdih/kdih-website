/// KDIH Admin App - Members Provider

import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../models/member.dart';

class MembersProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<Member> _members = [];
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Member> get members => _members;
  int get count => _members.length;
  
  Future<void> loadMembers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getMembers();
      if (response.data['message'] == 'success') {
        _members = (response.data['data'] as List? ?? [])
            .map((item) => Member.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load members';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<bool> createMember(Map<String, dynamic> data) async {
    try {
      final response = await _api.createMember(data);
      if (response.data['message'] == 'success') {
        await loadMembers();
        return true;
      }
    } catch (e) {
      _error = 'Failed to create member';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> updateMember(int id, Map<String, dynamic> data) async {
    try {
      final response = await _api.updateMember(id, data);
      if (response.data['message'] == 'success') {
        await loadMembers();
        return true;
      }
    } catch (e) {
      _error = 'Failed to update member';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> deleteMember(int id) async {
    try {
      final response = await _api.deleteMember(id);
      if (response.data['message'] == 'success') {
        _members.removeWhere((m) => m.id == id);
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = 'Failed to delete member';
    }
    notifyListeners();
    return false;
  }
  
  List<Member> search(String query) {
    if (query.isEmpty) return _members;
    final lower = query.toLowerCase();
    return _members.where((m) =>
      m.fullName.toLowerCase().contains(lower) ||
      m.email.toLowerCase().contains(lower) ||
      (m.phone?.contains(query) ?? false)
    ).toList();
  }
}
