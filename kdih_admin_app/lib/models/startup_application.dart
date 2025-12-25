/// KDIH Admin App - Startup Application Model

class StartupApplication {
  final int id;
  final String startupName;
  final String founderName;
  final String? founderEmail;
  final String? founderPhone;
  final String? businessDescription;
  final String? pitchDeckUrl;
  final int? teamSize;
  final String? industry;
  final String? stage;
  final double? fundingSought;
  final String applicationStatus;
  final DateTime? appliedAt;
  
  StartupApplication({
    required this.id,
    required this.startupName,
    required this.founderName,
    this.founderEmail,
    this.founderPhone,
    this.businessDescription,
    this.pitchDeckUrl,
    this.teamSize,
    this.industry,
    this.stage,
    this.fundingSought,
    this.applicationStatus = 'pending',
    this.appliedAt,
  });
  
  factory StartupApplication.fromJson(Map<String, dynamic> json) {
    return StartupApplication(
      id: json['id'] ?? 0,
      startupName: json['startup_name'] ?? '',
      founderName: json['founder_name'] ?? '',
      founderEmail: json['founder_email'],
      founderPhone: json['founder_phone'],
      businessDescription: json['business_description'],
      pitchDeckUrl: json['pitch_deck_url'],
      teamSize: json['team_size'],
      industry: json['industry'],
      stage: json['stage'],
      fundingSought: json['funding_sought'] != null 
          ? double.tryParse(json['funding_sought'].toString()) 
          : null,
      applicationStatus: json['application_status'] ?? 'pending',
      appliedAt: json['applied_at'] != null 
          ? DateTime.tryParse(json['applied_at']) 
          : null,
    );
  }
  
  String get fundingText {
    if (fundingSought == null) return 'Not specified';
    return '₦${(fundingSought! / 1000000).toStringAsFixed(1)}M';
  }
  
  String get stageText => stage ?? 'Not specified';
  
  String get industryText => industry ?? 'Not specified';
}
