/// KDIH Admin App - Member Model

class Member {
  final int id;
  final String fullName;
  final String email;
  final String? phone;
  final String? gender;
  final String? interest;
  final DateTime? createdAt;
  
  Member({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    this.gender,
    this.interest,
    this.createdAt,
  });
  
  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['id'] ?? 0,
      fullName: json['full_name'] ?? json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      gender: json['gender'],
      interest: json['interest'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'email': email,
      'phone': phone,
      'gender': gender,
      'interest': interest,
    };
  }
  
  String get initials {
    final parts = fullName.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return fullName.isNotEmpty ? fullName[0].toUpperCase() : '?';
  }
}
