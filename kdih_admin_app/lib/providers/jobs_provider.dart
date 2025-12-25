// KDIH Admin App - Jobs Provider

import 'package:flutter/foundation.dart';
import '../core/services/api_service.dart';

class Job {
  final int id;
  final String title;
  final String? department;
  final String? location;
  final String? type; // full-time, part-time, contract
  final String? description;
  final String? requirements;
  final String? salaryRange;
  final String status;
  final DateTime? deadline;
  final DateTime? createdAt;
  final int applicationCount;
  
  Job({
    required this.id,
    required this.title,
    this.department,
    this.location,
    this.type,
    this.description,
    this.requirements,
    this.salaryRange,
    required this.status,
    this.deadline,
    this.createdAt,
    this.applicationCount = 0,
  });
  
  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      department: json['department'],
      location: json['location'],
      type: json['job_type'] ?? json['type'],
      description: json['description'],
      requirements: json['requirements'],
      salaryRange: json['salary_range'],
      status: json['status'] ?? 'active',
      deadline: json['deadline'] != null ? DateTime.tryParse(json['deadline']) : null,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
      applicationCount: json['application_count'] ?? 0,
    );
  }
  
  bool get isActive => status.toLowerCase() == 'active';
  bool get isExpired => deadline != null && deadline!.isBefore(DateTime.now());
  String get typeText => type ?? 'Full-time';
  String get locationText => location ?? 'Katsina, Nigeria';
}

class JobApplication {
  final int id;
  final int jobId;
  final String applicantName;
  final String email;
  final String? phone;
  final String? coverLetter;
  final String? resumeUrl;
  final String status;
  final DateTime? appliedAt;
  final String? jobTitle;
  
  JobApplication({
    required this.id,
    required this.jobId,
    required this.applicantName,
    required this.email,
    this.phone,
    this.coverLetter,
    this.resumeUrl,
    required this.status,
    this.appliedAt,
    this.jobTitle,
  });
  
  factory JobApplication.fromJson(Map<String, dynamic> json) {
    return JobApplication(
      id: json['id'] ?? 0,
      jobId: json['job_id'] ?? 0,
      applicantName: json['applicant_name'] ?? json['full_name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      coverLetter: json['cover_letter'],
      resumeUrl: json['resume_url'],
      status: json['status'] ?? 'pending',
      appliedAt: json['applied_at'] != null ? DateTime.tryParse(json['applied_at']) : null,
      jobTitle: json['job_title'],
    );
  }
}

class JobsProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  List<Job> _jobs = [];
  List<JobApplication> _applications = [];
  bool _isLoading = false;
  String? _error;
  
  List<Job> get jobs => _jobs;
  List<Job> get activeJobs => _jobs.where((j) => j.isActive).toList();
  List<JobApplication> get applications => _applications;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  Future<void> loadJobs() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _api.getJobs();
      final data = response.data;
      _jobs = (data['jobs'] ?? data ?? [])
          .map<Job>((j) => Job.fromJson(j))
          .toList();
    } catch (e) {
      _error = e.toString();
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<void> loadApplications() async {
    try {
      final response = await _api.getJobApplications();
      final data = response.data;
      _applications = (data['applications'] ?? data ?? [])
          .map<JobApplication>((a) => JobApplication.fromJson(a))
          .toList();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }
  
  Future<bool> createJob(Map<String, dynamic> data) async {
    try {
      await _api.createJob(data);
      await loadJobs();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }
  
  Future<bool> updateJob(int id, Map<String, dynamic> data) async {
    try {
      await _api.updateJob(id, data);
      await loadJobs();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }
  
  Future<bool> deleteJob(int id) async {
    try {
      await _api.deleteJob(id);
      _jobs.removeWhere((j) => j.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }
}
