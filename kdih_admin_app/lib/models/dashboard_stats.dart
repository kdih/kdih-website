/// KDIH Admin App - Dashboard Stats Model

class DashboardStats {
  final int totalMembers;
  final int courseEnrollments;
  final int upcomingEvents;
  final int pendingApplications;
  final int pendingRegistrations;
  final int coworkingMembers;
  final int todayBookings;
  final int pendingCertificates;
  final int unreadMessages;
  
  DashboardStats({
    this.totalMembers = 0,
    this.courseEnrollments = 0,
    this.upcomingEvents = 0,
    this.pendingApplications = 0,
    this.pendingRegistrations = 0,
    this.coworkingMembers = 0,
    this.todayBookings = 0,
    this.pendingCertificates = 0,
    this.unreadMessages = 0,
  });
  
  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalMembers: json['total_members'] ?? json['members_count'] ?? 0,
      courseEnrollments: json['course_enrollments'] ?? json['enrollments_count'] ?? 0,
      upcomingEvents: json['upcoming_events'] ?? json['events_count'] ?? 0,
      pendingApplications: json['pending_applications'] ?? 0,
      pendingRegistrations: json['pending_registrations'] ?? 0,
      coworkingMembers: json['coworking_members'] ?? 0,
      todayBookings: json['today_bookings'] ?? 0,
      pendingCertificates: json['pending_certificates'] ?? 0,
      unreadMessages: json['unread_messages'] ?? 0,
    );
  }
}

class RecentActivity {
  final String type;
  final String description;
  final DateTime? date;
  final String? icon;
  
  RecentActivity({
    required this.type,
    required this.description,
    this.date,
    this.icon,
  });
  
  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      type: json['type'] ?? '',
      description: json['description'] ?? '',
      date: json['date'] != null || json['created_at'] != null
          ? DateTime.tryParse(json['date'] ?? json['created_at'])
          : null,
      icon: json['icon'],
    );
  }
}
