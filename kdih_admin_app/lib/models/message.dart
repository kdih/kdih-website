/// KDIH Admin App - Message Model

class Message {
  final int id;
  final String name;
  final String email;
  final String message;
  final bool isRead;
  final DateTime? createdAt;
  
  Message({
    required this.id,
    required this.name,
    required this.email,
    required this.message,
    this.isRead = false,
    this.createdAt,
  });
  
  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      message: json['message'] ?? '',
      isRead: json['is_read'] == 1 || json['is_read'] == true,
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  String get preview {
    if (message.length > 80) {
      return '${message.substring(0, 80)}...';
    }
    return message;
  }
  
  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}
