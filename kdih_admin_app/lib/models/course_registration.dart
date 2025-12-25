/// KDIH Admin App - Course Registration Model

class CourseRegistration {
  final int id;
  final String courseTitle;
  final String? schedule;
  final String? title;
  final String surname;
  final String firstname;
  final String? othernames;
  final String? gender;
  final String? nationality;
  final String? phone;
  final String? emailPersonal;
  final String? emailOfficial;
  final String? organization;
  final String? jobTitle;
  final String? country;
  final String? state;
  final String? city;
  final String? paymentStatus;
  final double? courseFee;
  final String? paymentReference;
  final DateTime? createdAt;
  
  CourseRegistration({
    required this.id,
    required this.courseTitle,
    this.schedule,
    this.title,
    required this.surname,
    required this.firstname,
    this.othernames,
    this.gender,
    this.nationality,
    this.phone,
    this.emailPersonal,
    this.emailOfficial,
    this.organization,
    this.jobTitle,
    this.country,
    this.state,
    this.city,
    this.paymentStatus,
    this.courseFee,
    this.paymentReference,
    this.createdAt,
  });
  
  factory CourseRegistration.fromJson(Map<String, dynamic> json) {
    return CourseRegistration(
      id: json['id'] ?? 0,
      courseTitle: json['course_title'] ?? '',
      schedule: json['schedule'],
      title: json['title'],
      surname: json['surname'] ?? '',
      firstname: json['firstname'] ?? '',
      othernames: json['othernames'],
      gender: json['gender'],
      nationality: json['nationality'],
      phone: json['phone'],
      emailPersonal: json['email_personal'],
      emailOfficial: json['email_official'],
      organization: json['organization'],
      jobTitle: json['job_title'],
      country: json['country'],
      state: json['state'],
      city: json['city'],
      paymentStatus: json['payment_status'],
      courseFee: json['course_fee'] != null 
          ? double.tryParse(json['course_fee'].toString()) 
          : null,
      paymentReference: json['payment_reference'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  String get fullName {
    final parts = <String>[];
    if (title != null && title!.isNotEmpty) parts.add(title!);
    parts.add(firstname);
    parts.add(surname);
    if (othernames != null && othernames!.isNotEmpty) parts.add(othernames!);
    return parts.join(' ');
  }
  
  String get email => emailPersonal ?? emailOfficial ?? '';
  
  bool get isPaid => paymentStatus == 'paid';
  
  String get paymentStatusText {
    return paymentStatus ?? 'pending';
  }
}
