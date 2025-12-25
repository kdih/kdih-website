/// KDIH Admin App - Coworking Models

class CoworkingMember {
  final int id;
  final String memberCode;
  final String fullName;
  final String email;
  final String? phone;
  final String? gender;
  final String membershipType;
  final String status;
  final DateTime? startDate;
  final DateTime? endDate;
  final DateTime? createdAt;
  
  CoworkingMember({
    required this.id,
    required this.memberCode,
    required this.fullName,
    required this.email,
    this.phone,
    this.gender,
    required this.membershipType,
    this.status = 'active',
    this.startDate,
    this.endDate,
    this.createdAt,
  });
  
  factory CoworkingMember.fromJson(Map<String, dynamic> json) {
    return CoworkingMember(
      id: json['id'] ?? 0,
      memberCode: json['member_code'] ?? '',
      fullName: json['full_name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      gender: json['gender'],
      membershipType: json['membership_type'] ?? 'daily',
      status: json['status'] ?? 'active',
      startDate: json['start_date'] != null 
          ? DateTime.tryParse(json['start_date']) 
          : null,
      endDate: json['end_date'] != null 
          ? DateTime.tryParse(json['end_date']) 
          : null,
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  bool get isExpired {
    if (endDate == null) return false;
    return endDate!.isBefore(DateTime.now());
  }
  
  String get membershipText {
    switch (membershipType.toLowerCase()) {
      case 'daily':
        return 'Daily Pass';
      case 'weekly':
        return 'Weekly Pass';
      case 'monthly':
        return 'Monthly';
      default:
        return membershipType;
    }
  }
}

class DeskBooking {
  final int id;
  final int? memberId;
  final String? memberName;
  final String? memberCode;
  final String? memberEmail;
  final String? deskNumber;
  final DateTime? bookingDate;
  final String? bookingType;
  final String status;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;
  final double? amountPaid;
  final String? paymentReference;
  final DateTime? expiresAt;
  
  DeskBooking({
    required this.id,
    this.memberId,
    this.memberName,
    this.memberCode,
    this.memberEmail,
    this.deskNumber,
    this.bookingDate,
    this.bookingType,
    this.status = 'pending',
    this.checkInTime,
    this.checkOutTime,
    this.amountPaid,
    this.paymentReference,
    this.expiresAt,
  });
  
  factory DeskBooking.fromJson(Map<String, dynamic> json) {
    return DeskBooking(
      id: json['id'] ?? 0,
      memberId: json['member_id'],
      memberName: json['full_name'] ?? json['member_name'],
      memberCode: json['member_code'],
      memberEmail: json['email'],
      deskNumber: json['desk_number'],
      bookingDate: json['booking_date'] != null 
          ? DateTime.tryParse(json['booking_date']) 
          : null,
      bookingType: json['booking_type'],
      status: json['status'] ?? 'pending',
      checkInTime: json['check_in_time'] != null 
          ? DateTime.tryParse(json['check_in_time']) 
          : null,
      checkOutTime: json['check_out_time'] != null 
          ? DateTime.tryParse(json['check_out_time']) 
          : null,
      amountPaid: json['amount_paid'] != null 
          ? double.tryParse(json['amount_paid'].toString()) 
          : null,
      paymentReference: json['payment_reference'],
      expiresAt: json['expires_at'] != null 
          ? DateTime.tryParse(json['expires_at']) 
          : null,
    );
  }
  
  bool get isCheckedIn => checkInTime != null && checkOutTime == null;
  bool get isCompleted => checkOutTime != null;
  bool get canCheckIn => status == 'confirmed' && checkInTime == null;
  bool get canCheckOut => isCheckedIn;
}
