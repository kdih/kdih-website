/// KDIH Admin App - Messages Provider

import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../models/message.dart';

class MessagesProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<Message> _messages = [];
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Message> get messages => _messages;
  int get unreadCount => _messages.where((m) => !m.isRead).length;
  
  Future<void> loadMessages() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getMessages();
      if (response.data['message'] == 'success') {
        _messages = (response.data['data'] as List? ?? [])
            .map((item) => Message.fromJson(item))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load messages';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<bool> deleteMessage(int id) async {
    try {
      final response = await _api.deleteMessage(id);
      if (response.data['message'] == 'success') {
        _messages.removeWhere((m) => m.id == id);
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = 'Failed to delete message';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> replyToMessage(int id, String reply) async {
    try {
      final response = await _api.replyToMessage(id, reply);
      return response.data['message'] == 'success';
    } catch (e) {
      _error = 'Failed to send reply';
      notifyListeners();
      return false;
    }
  }
}
