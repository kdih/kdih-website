// KDIH Admin App - Certificates Screen

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/certificates_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/certificate.dart';
import '../../widgets/common/loading_widget.dart';

class CertificatesScreen extends StatefulWidget {
  const CertificatesScreen({super.key});
  
  @override
  State<CertificatesScreen> createState() => _CertificatesScreenState();
}

class _CertificatesScreenState extends State<CertificatesScreen> {
  String _filter = 'all';
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CertificatesProvider>().loadCertificates();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Certificates'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<CertificatesProvider>().loadCertificates(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showInitiateCertificateDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Issue Certificate'),
      ),
      body: Column(
        children: [
          // Stats Bar
          Consumer<CertificatesProvider>(
            builder: (context, provider, child) {
              final stats = provider.stats;
              return Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    _buildStatChip('Total', stats['total']?.toString() ?? '0', AppTheme.accent),
                    _buildStatChip('Pending', stats['pending']?.toString() ?? '0', AppTheme.warning),
                    _buildStatChip('Approved', stats['approved']?.toString() ?? '0', AppTheme.success),
                  ],
                ),
              );
            },
          ),
          
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildFilterChip('All', 'all'),
                _buildFilterChip('Pending', 'pending'),
                _buildFilterChip('Finance Confirmed', 'finance_confirmed'),
                _buildFilterChip('Approved', 'approved'),
                _buildFilterChip('Rejected', 'rejected'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Certificates List
          Expanded(
            child: Consumer<CertificatesProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading && provider.certificates.isEmpty) {
                  return const LoadingWidget(message: 'Loading certificates...');
                }
                
                var certs = provider.certificates;
                if (_filter != 'all') {
                  certs = certs.where((c) => c.status == _filter).toList();
                }
                
                if (certs.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.card_membership_outlined,
                    title: _filter == 'all' ? 'No certificates' : 'No $_filter certificates',
                    subtitle: 'Certificates will appear here',
                  );
                }
                
                return RefreshIndicator(
                  onRefresh: () => provider.loadCertificates(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: certs.length,
                    itemBuilder: (context, index) {
                      return _buildCertificateCard(certs[index], user);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildStatChip(String label, String value, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildFilterChip(String label, String value) {
    final isSelected = _filter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _filter = selected ? value : 'all';
          });
        },
        selectedColor: AppTheme.accent.withValues(alpha: 0.2),
        checkmarkColor: AppTheme.accent,
        labelStyle: TextStyle(
          color: isSelected ? AppTheme.accent : AppTheme.textMuted,
        ),
      ),
    );
  }
  
  Widget _buildCertificateCard(Certificate cert, user) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cert.studentName,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      cert.courseTitle,
                      style: TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              _buildStatusBadge(cert.status),
            ],
          ),
          const SizedBox(height: 16),
          
          // Progress Stepper
          _buildProgressStepper(cert.currentStep),
          const SizedBox(height: 16),
          
          // Details
          if (cert.certificateNumber != null)
            _buildDetailRow(Icons.numbers, 'Certificate #', cert.certificateNumber!),
          if (cert.issueDate != null)
            _buildDetailRow(
              Icons.calendar_today,
              'Issue Date',
              DateFormat('MMM d, yyyy').format(cert.issueDate!),
            ),
          if (cert.paymentAmount != null)
            _buildDetailRow(
              Icons.payments,
              'Payment',
              '₦${cert.paymentAmount!.toStringAsFixed(0)}',
            ),
          
          // Actions
          if (cert.isPending || cert.isFinanceConfirmed) ...[
            const Divider(color: AppTheme.divider),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // Finance Confirmation button (for finance role)
                if (cert.isPending && 
                    (user?.role == 'finance' || user?.role == 'super_admin'))
                  TextButton.icon(
                    onPressed: () => _showFinanceConfirmDialog(cert),
                    icon: const Icon(Icons.payments, size: 18),
                    label: const Text('Confirm Payment'),
                    style: TextButton.styleFrom(foregroundColor: AppTheme.warning),
                  ),
                
                // Approve button (for super_admin)
                if (cert.isFinanceConfirmed && user?.role == 'super_admin')
                  TextButton.icon(
                    onPressed: () => _approveCertificate(cert),
                    icon: const Icon(Icons.check_circle, size: 18),
                    label: const Text('Approve'),
                    style: TextButton.styleFrom(foregroundColor: AppTheme.success),
                  ),
                
                // Reject button
                if ((cert.isPending || cert.isFinanceConfirmed) && 
                    user?.role == 'super_admin')
                  TextButton.icon(
                    onPressed: () => _showRejectDialog(cert),
                    icon: const Icon(Icons.cancel, size: 18),
                    label: const Text('Reject'),
                    style: TextButton.styleFrom(foregroundColor: AppTheme.danger),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
  
  Widget _buildStatusBadge(String status) {
    Color color;
    String label;
    
    switch (status) {
      case 'pending':
        color = AppTheme.warning;
        label = 'Pending';
        break;
      case 'finance_confirmed':
        color = Colors.blue;
        label = 'Finance OK';
        break;
      case 'approved':
        color = AppTheme.success;
        label = 'Approved';
        break;
      case 'rejected':
        color = AppTheme.danger;
        label = 'Rejected';
        break;
      default:
        color = AppTheme.textMuted;
        label = status;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
  
  Widget _buildProgressStepper(int currentStep) {
    return Row(
      children: [
        _buildStep(1, 'Initiated', currentStep >= 1),
        _buildStepConnector(currentStep >= 2),
        _buildStep(2, 'Finance', currentStep >= 2),
        _buildStepConnector(currentStep >= 3),
        _buildStep(3, 'Approved', currentStep >= 3),
      ],
    );
  }
  
  Widget _buildStep(int step, String label, bool completed) {
    return Column(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: completed ? AppTheme.success : AppTheme.primary,
            shape: BoxShape.circle,
            border: Border.all(
              color: completed ? AppTheme.success : AppTheme.textMuted,
              width: 2,
            ),
          ),
          child: completed
              ? const Icon(Icons.check, size: 14, color: Colors.white)
              : Center(
                  child: Text(
                    step.toString(),
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: completed ? AppTheme.textPrimary : AppTheme.textMuted,
          ),
        ),
      ],
    );
  }
  
  Widget _buildStepConnector(bool completed) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 20),
        color: completed ? AppTheme.success : AppTheme.divider,
      ),
    );
  }
  
  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.textMuted),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: TextStyle(
              color: AppTheme.textMuted,
              fontSize: 13,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
  
  void _showInitiateCertificateDialog(BuildContext context) {
    final nameController = TextEditingController();
    final courseController = TextEditingController();
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 24,
            right: 24,
            top: 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Issue Certificate',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Student Name',
                    prefixIcon: Icon(Icons.person),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: courseController,
                  decoration: const InputDecoration(
                    labelText: 'Course Title',
                    prefixIcon: Icon(Icons.school),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (nameController.text.isEmpty || courseController.text.isEmpty) {
                        ScaffoldMessenger.of(ctx).showSnackBar(
                          const SnackBar(
                            content: Text('All fields are required'),
                            backgroundColor: AppTheme.danger,
                          ),
                        );
                        return;
                      }
                      
                      final success = await context.read<CertificatesProvider>().initiateCertificate({
                        'student_name': nameController.text,
                        'course_title': courseController.text,
                        'certificate_type': 'Completion',
                      });
                      
                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(success 
                                ? 'Certificate initiated' 
                                : 'Failed to initiate certificate'),
                            backgroundColor: success ? AppTheme.success : AppTheme.danger,
                          ),
                        );
                      }
                    },
                    child: const Text('Initiate Certificate'),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        );
      },
    );
  }
  
  void _showFinanceConfirmDialog(Certificate cert) {
    final amountController = TextEditingController();
    final refController = TextEditingController();
    String paymentMethod = 'Bank Transfer';
    
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: const Text('Confirm Payment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Confirm payment for ${cert.studentName}'),
            const SizedBox(height: 16),
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Amount (₦)'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: refController,
              decoration: const InputDecoration(labelText: 'Payment Reference'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<CertificatesProvider>().confirmFinance(cert.id, {
                'payment_amount': double.tryParse(amountController.text) ?? 0,
                'payment_method': paymentMethod,
                'payment_reference': refController.text,
              });
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }
  
  Future<void> _approveCertificate(Certificate cert) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: const Text('Approve Certificate'),
        content: Text('Approve certificate for ${cert.studentName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
            child: const Text('Approve'),
          ),
        ],
      ),
    );
    
    if (confirmed == true && mounted) {
      await context.read<CertificatesProvider>().approveCertificate(cert.id);
    }
  }
  
  void _showRejectDialog(Certificate cert) {
    final reasonController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: const Text('Reject Certificate'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Reject certificate for ${cert.studentName}?'),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Reason for rejection'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<CertificatesProvider>().rejectCertificate(
                cert.id,
                reasonController.text,
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
  }
}
