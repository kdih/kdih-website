/// KDIH Admin App - Event Model

class Event {
  final int id;
  final String title;
  final String? description;
  final String? eventType;
  final DateTime? eventDate;
  final DateTime? endDate;
  final String? location;
  final int? maxAttendees;
  final double? price;
  final String? thumbnailUrl;
  final String status;
  final int? attendeeCount;
  final DateTime? createdAt;
  
  Event({
    required this.id,
    required this.title,
    this.description,
    this.eventType,
    this.eventDate,
    this.endDate,
    this.location,
    this.maxAttendees,
    this.price,
    this.thumbnailUrl,
    this.status = 'upcoming',
    this.attendeeCount,
    this.createdAt,
  });
  
  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'],
      eventType: json['event_type'],
      eventDate: json['event_date'] != null 
          ? DateTime.tryParse(json['event_date']) 
          : null,
      endDate: json['end_date'] != null 
          ? DateTime.tryParse(json['end_date']) 
          : null,
      location: json['location'],
      maxAttendees: json['max_attendees'],
      price: json['price'] != null ? double.tryParse(json['price'].toString()) : null,
      thumbnailUrl: json['thumbnail_url'],
      status: json['status'] ?? 'upcoming',
      attendeeCount: json['attendee_count'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'event_type': eventType,
      'event_date': eventDate?.toIso8601String(),
      'end_date': endDate?.toIso8601String(),
      'location': location,
      'max_attendees': maxAttendees,
      'price': price,
      'thumbnail_url': thumbnailUrl,
      'status': status,
    };
  }
  
  bool get isUpcoming => eventDate != null && eventDate!.isAfter(DateTime.now());
  
  bool get isOngoing {
    if (eventDate == null) return false;
    final now = DateTime.now();
    final end = endDate ?? eventDate!.add(const Duration(hours: 2));
    return now.isAfter(eventDate!) && now.isBefore(end);
  }
  
  String get attendeesText {
    if (maxAttendees == null) return '${attendeeCount ?? 0} registered';
    return '${attendeeCount ?? 0}/$maxAttendees';
  }
}
