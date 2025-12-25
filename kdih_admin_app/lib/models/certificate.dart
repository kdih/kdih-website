/// KDIH Admin App - Certificate Model

class Certificate {
  final int id;
  final String? certificateNumber;
  final int? studentId;
  final int? courseId;
  final String studentName;
  final String courseTitle;
  final String? certificateType;
  final String status;
  final String? verificationCode;
  final DateTime? issueDate;
  final double? paymentAmount;
  final String? paymentMethod;
  final String? paymentReference;
  final String? paymentNotes;
  final int? initiatedBy;
  final String? initiatedByName;
  final int? financeConfirmedBy;
  final String? financeConfirmedByName;
  final DateTime? financeConfirmedAt;
  final int? approvedBy;
  final String? approvedByName;
  final DateTime? approvedAt;
  final String? rejectionReason;
  final DateTime? createdAt;
  
  Certificate({
    required this.id,
    this.certificateNumber,
    this.studentId,
    this.courseId,
    required this.studentName,
    required this.courseTitle,
    this.certificateType,
    this.status = 'pending',
    this.verificationCode,
    this.issueDate,
    this.paymentAmount,
    this.paymentMethod,
    this.paymentReference,
    this.paymentNotes,
    this.initiatedBy,
    this.initiatedByName,
    this.financeConfirmedBy,
    this.financeConfirmedByName,
    this.financeConfirmedAt,
    this.approvedBy,
    this.approvedByName,
    this.approvedAt,
    this.rejectionReason,
    this.createdAt,
  });
  
  factory Certificate.fromJson(Map<String, dynamic> json) {
    return Certificate(
      id: json['id'] ?? 0,
      certificateNumber: json['certificate_number'],
      studentId: json['student_id'],
      courseId: json['course_id'],
      studentName: json['student_name'] ?? '',
      courseTitle: json['course_title'] ?? '',
      certificateType: json['certificate_type'],
      status: json['status'] ?? 'pending',
      verificationCode: json['verification_code'],
      issueDate: json['issue_date'] != null 
          ? DateTime.tryParse(json['issue_date']) 
          : null,
      paymentAmount: json['payment_amount'] != null 
          ? double.tryParse(json['payment_amount'].toString()) 
          : null,
      paymentMethod: json['payment_method'],
      paymentReference: json['payment_reference'],
      paymentNotes: json['payment_notes'],
      initiatedBy: json['initiated_by'],
      initiatedByName: json['initiated_by_name'],
      financeConfirmedBy: json['finance_confirmed_by'],
      financeConfirmedByName: json['finance_confirmed_by_name'],
      financeConfirmedAt: json['finance_confirmed_at'] != null 
          ? DateTime.tryParse(json['finance_confirmed_at']) 
          : null,
      approvedBy: json['approved_by'],
      approvedByName: json['approved_by_name'],
      approvedAt: json['approved_at'] != null 
          ? DateTime.tryParse(json['approved_at']) 
          : null,
      rejectionReason: json['rejection_reason'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  bool get isPending => status == 'pending';
  bool get isFinanceConfirmed => status == 'finance_confirmed';
  bool get isApproved => status == 'approved';
  bool get isRejected => status == 'rejected';
  
  String get statusText {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'finance_confirmed':
        return 'Finance Confirmed';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }
  
  int get currentStep {
    switch (status) {
      case 'pending':
        return 1;
      case 'finance_confirmed':
        return 2;
      case 'approved':
        return 3;
      case 'rejected':
        return 0;
      default:
        return 0;
    }
  }
}
