// KDIH Admin App - Jobs Screen

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/responsive.dart';
import '../../providers/jobs_provider.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/status_badge.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});
  
  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<JobsProvider>();
      provider.loadJobs();
      provider.loadApplications();
    });
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Jobs'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Positions'),
            Tab(text: 'Applications'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<JobsProvider>().loadJobs();
              context.read<JobsProvider>().loadApplications();
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateJobDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Post Job'),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildJobsTab(),
          _buildApplicationsTab(),
        ],
      ),
    );
  }
  
  Widget _buildJobsTab() {
    return Consumer<JobsProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.jobs.isEmpty) {
          return const LoadingWidget(message: 'Loading jobs...');
        }
        
        if (provider.jobs.isEmpty) {
          return EmptyStateWidget(
            icon: Icons.work_outline,
            title: 'No job postings',
            subtitle: 'Post job openings to attract talent',
            action: ElevatedButton.icon(
              onPressed: () => _showCreateJobDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('Post Job'),
            ),
          );
        }
        
        final isTablet = Responsive.isTabletOrLarger(context);
        
        return RefreshIndicator(
          onRefresh: () => provider.loadJobs(),
          child: isTablet
              ? GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: Responsive.getGridColumns(context),
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.4,
                  ),
                  itemCount: provider.jobs.length,
                  itemBuilder: (context, index) => _buildJobCard(provider.jobs[index]),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: provider.jobs.length,
                  itemBuilder: (context, index) => _buildJobCard(provider.jobs[index]),
                ),
        );
      },
    );
  }
  
  Widget _buildApplicationsTab() {
    return Consumer<JobsProvider>(
      builder: (context, provider, child) {
        if (provider.applications.isEmpty) {
          return EmptyStateWidget(
            icon: Icons.description_outlined,
            title: 'No applications',
            subtitle: 'Job applications will appear here',
          );
        }
        
        return RefreshIndicator(
          onRefresh: () => provider.loadApplications(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.applications.length,
            itemBuilder: (context, index) => _buildApplicationCard(provider.applications[index]),
          ),
        );
      },
    );
  }
  
  Widget _buildJobCard(Job job) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: InkWell(
        onTap: () => _showJobDetails(job),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      job.typeText,
                      style: const TextStyle(fontSize: 11, color: AppTheme.accent, fontWeight: FontWeight.w600),
                    ),
                  ),
                  StatusBadge(status: job.status),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                job.title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.location_on, size: 14, color: AppTheme.textMuted),
                  const SizedBox(width: 4),
                  Text(job.locationText, style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                  if (job.department != null) ...[
                    const SizedBox(width: 12),
                    Icon(Icons.business, size: 14, color: AppTheme.textMuted),
                    const SizedBox(width: 4),
                    Text(job.department!, style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                  ],
                ],
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.people, size: 14, color: AppTheme.accent),
                      const SizedBox(width: 4),
                      Text(
                        '${job.applicationCount} applicants',
                        style: const TextStyle(fontSize: 12, color: AppTheme.accent, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  if (job.deadline != null)
                    Text(
                      'Deadline: ${DateFormat('MMM d').format(job.deadline!)}',
                      style: TextStyle(
                        fontSize: 11,
                        color: job.isExpired ? AppTheme.danger : AppTheme.textMuted,
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
  
  Widget _buildApplicationCard(JobApplication app) {
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
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppTheme.accent,
                child: Text(
                  app.applicantName.isNotEmpty ? app.applicantName[0] : '?',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(app.applicantName, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                    Text(app.email, style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                  ],
                ),
              ),
              StatusBadge(status: app.status),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.work, color: AppTheme.accent, size: 16),
                const SizedBox(width: 8),
                Text(app.jobTitle ?? 'Job #${app.jobId}', style: const TextStyle(color: AppTheme.textPrimary)),
              ],
            ),
          ),
          if (app.appliedAt != null) ...[
            const SizedBox(height: 8),
            Text(
              'Applied ${DateFormat('MMM d, y').format(app.appliedAt!)}',
              style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
          ],
        ],
      ),
    );
  }
  
  void _showJobDetails(Job job) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.7,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (ctx, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppTheme.divider, borderRadius: BorderRadius.circular(2))),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: AppTheme.accent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                        child: Text(job.typeText, style: const TextStyle(color: AppTheme.accent, fontWeight: FontWeight.w600)),
                      ),
                      StatusBadge(status: job.status),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(job.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on, size: 16, color: AppTheme.textMuted),
                      const SizedBox(width: 4),
                      Text(job.locationText, style: TextStyle(color: AppTheme.textMuted)),
                    ],
                  ),
                  if (job.salaryRange != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.payments, size: 16, color: AppTheme.success),
                        const SizedBox(width: 4),
                        Text(job.salaryRange!, style: const TextStyle(color: AppTheme.success, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ],
                  const SizedBox(height: 24),
                  if (job.description != null) ...[
                    const Text('Description', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                    const SizedBox(height: 8),
                    Text(job.description!, style: const TextStyle(color: AppTheme.textPrimary, height: 1.5)),
                  ],
                  if (job.requirements != null) ...[
                    const SizedBox(height: 24),
                    const Text('Requirements', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                    const SizedBox(height: 8),
                    Text(job.requirements!, style: const TextStyle(color: AppTheme.textPrimary, height: 1.5)),
                  ],
                  const SizedBox(height: 32),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            _confirmDeleteJob(job);
                          },
                          icon: const Icon(Icons.delete, color: AppTheme.danger),
                          label: const Text('Delete', style: TextStyle(color: AppTheme.danger)),
                          style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.danger)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            // TODO: Edit job
                          },
                          icon: const Icon(Icons.edit),
                          label: const Text('Edit'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
  
  void _showCreateJobDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final reqController = TextEditingController();
    final locationController = TextEditingController(text: 'Katsina, Nigeria');
    String jobType = 'Full-time';
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.cardBackground,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Post New Job', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                    const SizedBox(height: 24),
                    TextField(controller: titleController, decoration: const InputDecoration(labelText: 'Job Title', prefixIcon: Icon(Icons.work))),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: jobType,
                      decoration: const InputDecoration(labelText: 'Job Type', prefixIcon: Icon(Icons.schedule)),
                      items: ['Full-time', 'Part-time', 'Contract', 'Internship'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                      onChanged: (v) => setModalState(() => jobType = v ?? 'Full-time'),
                    ),
                    const SizedBox(height: 16),
                    TextField(controller: locationController, decoration: const InputDecoration(labelText: 'Location', prefixIcon: Icon(Icons.location_on))),
                    const SizedBox(height: 16),
                    TextField(controller: descController, maxLines: 3, decoration: const InputDecoration(labelText: 'Description', alignLabelWithHint: true)),
                    const SizedBox(height: 16),
                    TextField(controller: reqController, maxLines: 3, decoration: const InputDecoration(labelText: 'Requirements', alignLabelWithHint: true)),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          if (titleController.text.isEmpty) return;
                          final success = await context.read<JobsProvider>().createJob({
                            'title': titleController.text,
                            'job_type': jobType,
                            'location': locationController.text,
                            'description': descController.text,
                            'requirements': reqController.text,
                            'status': 'active',
                          });
                          if (ctx.mounted) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(success ? 'Job posted' : 'Failed'), backgroundColor: success ? AppTheme.success : AppTheme.danger),
                            );
                          }
                        },
                        child: const Text('Post Job'),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
  
  void _confirmDeleteJob(Job job) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: const Text('Delete Job'),
        content: Text('Delete "${job.title}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<JobsProvider>().deleteJob(job.id);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
