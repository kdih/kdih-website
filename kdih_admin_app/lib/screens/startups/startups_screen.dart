// KDIH Admin App - Startups Screen

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/responsive.dart';
import '../../providers/startups_provider.dart';
import '../../models/startup_application.dart';
import '../../widgets/common/loading_widget.dart';

class StartupsScreen extends StatefulWidget {
  const StartupsScreen({super.key});
  
  @override
  State<StartupsScreen> createState() => _StartupsScreenState();
}

class _StartupsScreenState extends State<StartupsScreen> {
  String _filter = 'all';
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StartupsProvider>().loadApplications();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Startup Incubation'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<StartupsProvider>().loadApplications(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Stats Bar
          Consumer<StartupsProvider>(
            builder: (context, provider, child) {
              return Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    _buildStatChip(
                      'Total',
                      provider.applications.length.toString(),
                      AppTheme.accent,
                    ),
                    _buildStatChip(
                      'Pending',
                      provider.pendingApplications.length.toString(),
                      AppTheme.warning,
                    ),
                    _buildStatChip(
                      'Approved',
                      provider.approvedApplications.length.toString(),
                      AppTheme.success,
                    ),
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
                _buildFilterChip('Approved', 'approved'),
                _buildFilterChip('Rejected', 'rejected'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Applications List
          Expanded(
            child: Consumer<StartupsProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading && provider.applications.isEmpty) {
                  return const LoadingWidget(message: 'Loading applications...');
                }
                
                var apps = provider.applications;
                if (_filter != 'all') {
                  apps = apps.where((a) => a.applicationStatus == _filter).toList();
                }
                
                if (apps.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.rocket_launch_outlined,
                    title: _filter == 'all' 
                        ? 'No applications yet'
                        : 'No $_filter applications',
                    subtitle: 'Startup incubation applications will appear here',
                  );
                }
                
                return RefreshIndicator(
                  onRefresh: () => provider.loadApplications(),
                  child: Responsive.isTabletOrLarger(context)
                      ? _buildGridView(apps)
                      : _buildListView(apps),
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
  
  Widget _buildListView(List<StartupApplication> apps) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: apps.length,
      itemBuilder: (context, index) => _buildApplicationCard(apps[index]),
    );
  }
  
  Widget _buildGridView(List<StartupApplication> apps) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: Responsive.getGridColumns(context),
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.3,
      ),
      itemCount: apps.length,
      itemBuilder: (context, index) => _buildApplicationCard(apps[index]),
    );
  }
  
  Widget _buildApplicationCard(StartupApplication app) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: InkWell(
        onTap: () => _showApplicationDetails(app),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppTheme.accent.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.rocket_launch,
                            color: AppTheme.accent,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                app.startupName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                app.founderName,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildStatusBadge(app.applicationStatus),
                ],
              ),
              const SizedBox(height: 16),
              
              // Details
              Row(
                children: [
                  _buildInfoChip(Icons.business, app.industryText),
                  const SizedBox(width: 8),
                  _buildInfoChip(Icons.trending_up, app.stageText),
                ],
              ),
              const Spacer(),
              
              // Footer
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (app.fundingSought != null)
                    Text(
                      'Seeking: ${app.fundingText}',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppTheme.success,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  if (app.appliedAt != null)
                    Text(
                      DateFormat('MMM d, y').format(app.appliedAt!),
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.textMuted,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'approved':
        color = AppTheme.success;
        break;
      case 'rejected':
        color = AppTheme.danger;
        break;
      case 'pending':
      default:
        color = AppTheme.warning;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        status[0].toUpperCase() + status.substring(1),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
  
  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppTheme.textMuted),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
          ),
        ],
      ),
    );
  }
  
  void _showApplicationDetails(StartupApplication app) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.75,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppTheme.textMuted.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Header
                  Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppTheme.accent.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.rocket_launch,
                          color: AppTheme.accent,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              app.startupName,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              'by ${app.founderName}',
                              style: TextStyle(color: AppTheme.textMuted),
                            ),
                          ],
                        ),
                      ),
                      _buildStatusBadge(app.applicationStatus),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Contact Info
                  const Text(
                    'Contact Information',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (app.founderEmail != null)
                    _buildDetailRow(Icons.email, 'Email', app.founderEmail!),
                  if (app.founderPhone != null)
                    _buildDetailRow(Icons.phone, 'Phone', app.founderPhone!),
                  
                  const SizedBox(height: 24),
                  
                  // Business Info
                  const Text(
                    'Business Information',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow(Icons.business, 'Industry', app.industryText),
                  _buildDetailRow(Icons.trending_up, 'Stage', app.stageText),
                  if (app.teamSize != null)
                    _buildDetailRow(Icons.group, 'Team Size', '${app.teamSize} members'),
                  if (app.fundingSought != null)
                    _buildDetailRow(Icons.attach_money, 'Funding Sought', app.fundingText),
                  
                  if (app.businessDescription != null) ...[
                    const SizedBox(height: 24),
                    const Text(
                      'Business Description',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        app.businessDescription!,
                        style: const TextStyle(
                          color: AppTheme.textPrimary,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                  
                  if (app.applicationStatus == 'pending') ...[
                    const SizedBox(height: 32),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              Navigator.pop(context);
                              _updateStatus(app, 'rejected');
                            },
                            icon: const Icon(Icons.close, color: AppTheme.danger),
                            label: const Text('Reject', style: TextStyle(color: AppTheme.danger)),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppTheme.danger),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.pop(context);
                              _updateStatus(app, 'approved');
                            },
                            icon: const Icon(Icons.check),
                            label: const Text('Approve'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.success,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            );
          },
        );
      },
    );
  }
  
  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppTheme.textMuted),
          const SizedBox(width: 12),
          Text(
            '$label: ',
            style: TextStyle(color: AppTheme.textMuted),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Future<void> _updateStatus(StartupApplication app, String status) async {
    final success = await context.read<StartupsProvider>().updateStatus(app.id, status);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success 
              ? 'Application ${status == 'approved' ? 'approved' : 'rejected'}' 
              : 'Failed to update status'),
          backgroundColor: success ? AppTheme.success : AppTheme.danger,
        ),
      );
    }
  }
}
