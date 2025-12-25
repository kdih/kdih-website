/// KDIH Admin App - User Model

class User {
  final int? id;
  final String username;
  final String? email;
  final String role;
  final String? fullName;
  final DateTime? createdAt;
  
  User({
    this.id,
    required this.username,
    this.email,
    required this.role,
    this.fullName,
    this.createdAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'] ?? '',
      email: json['email'],
      role: json['role'] ?? 'admin',
      fullName: json['full_name'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'full_name': fullName,
      'created_at': createdAt?.toIso8601String(),
    };
  }
  
  bool get isSuperAdmin => role == 'super_admin';
  bool get isFinance => role == 'finance';
  bool get isAdmin => role == 'admin' || role == 'super_admin';
  
  String get displayRole {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'finance':
        return 'Finance Officer';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  }
}
