/// KDIH Admin App - Course Model

class Course {
  final int id;
  final String title;
  final String? description;
  final String? track;
  final int? durationWeeks;
  final double? price;
  final String? thumbnailUrl;
  final String status;
  final DateTime? createdAt;
  
  Course({
    required this.id,
    required this.title,
    this.description,
    this.track,
    this.durationWeeks,
    this.price,
    this.thumbnailUrl,
    this.status = 'active',
    this.createdAt,
  });
  
  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'],
      track: json['track'],
      durationWeeks: json['duration_weeks'],
      price: json['price'] != null ? double.tryParse(json['price'].toString()) : null,
      thumbnailUrl: json['thumbnail_url'],
      status: json['status'] ?? 'active',
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'track': track,
      'duration_weeks': durationWeeks,
      'price': price,
      'thumbnail_url': thumbnailUrl,
      'status': status,
    };
  }
  
  String get formattedPrice {
    if (price == null) return 'Free';
    return '₦${price!.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]},',
    )}';
  }
  
  String get durationText {
    if (durationWeeks == null) return 'TBD';
    return '$durationWeeks week${durationWeeks! > 1 ? 's' : ''}';
  }
}
