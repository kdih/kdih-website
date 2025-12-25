/// KDIH Admin App - Certificates Provider

import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../models/certificate.dart';

class CertificatesProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<Certificate> _certificates = [];
  Map<String, dynamic> _stats = {};
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Certificate> get certificates => _certificates;
  Map<String, dynamic> get stats => _stats;
  
  List<Certificate> get pendingCertificates => 
      _certificates.where((c) => c.isPending).toList();
  List<Certificate> get financeConfirmedCertificates => 
      _certificates.where((c) => c.isFinanceConfirmed).toList();
  List<Certificate> get approvedCertificates => 
      _certificates.where((c) => c.isApproved).toList();
  
  Future<void> loadCertificates() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getCertificates();
      if (response.data['message'] == 'success') {
        _certificates = (response.data['data'] as List? ?? [])
            .map((item) => Certificate.fromJson(item))
            .toList();
        _stats = response.data['stats'] ?? {};
      }
    } catch (e) {
      _error = 'Failed to load certificates';
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<bool> initiateCertificate(Map<String, dynamic> data) async {
    try {
      final response = await _api.initiateCertificate(data);
      if (response.data['message'] == 'success') {
        await loadCertificates();
        return true;
      }
    } catch (e) {
      _error = 'Failed to initiate certificate';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> confirmFinance(int id, Map<String, dynamic> paymentData) async {
    try {
      final response = await _api.confirmFinance(id, paymentData);
      if (response.data['message'] == 'success') {
        await loadCertificates();
        return true;
      }
    } catch (e) {
      _error = 'Failed to confirm payment';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> approveCertificate(int id) async {
    try {
      final response = await _api.approveCertificate(id);
      if (response.data['message'] == 'success') {
        await loadCertificates();
        return true;
      }
    } catch (e) {
      _error = 'Failed to approve certificate';
    }
    notifyListeners();
    return false;
  }
  
  Future<bool> rejectCertificate(int id, String reason) async {
    try {
      final response = await _api.rejectCertificate(id, reason);
      if (response.data['message'] == 'success') {
        await loadCertificates();
        return true;
      }
    } catch (e) {
      _error = 'Failed to reject certificate';
    }
    notifyListeners();
    return false;
  }
}
