// KDIH Admin App - Courses Screen

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/courses_provider.dart';
import '../../models/course.dart';
import '../../models/course_registration.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/status_badge.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});
  
  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<CoursesProvider>();
      provider.loadCourses();
      provider.loadRegistrations();
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
        title: const Text('Courses'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Courses'),
            Tab(text: 'Registrations'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              final provider = context.read<CoursesProvider>();
              provider.loadCourses();
              provider.loadRegistrations();
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddCourseDialog(context),
        child: const Icon(Icons.add),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCoursesTab(),
          _buildRegistrationsTab(),
        ],
      ),
    );
  }
  
  Widget _buildCoursesTab() {
    return Consumer<CoursesProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.courses.isEmpty) {
          return const LoadingWidget(message: 'Loading courses...');
        }
        
        if (provider.courses.isEmpty) {
          return EmptyStateWidget(
            icon: Icons.school_outlined,
            title: 'No courses yet',
            subtitle: 'Add your first course to get started',
            action: ElevatedButton.icon(
              onPressed: () => _showAddCourseDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('Add Course'),
            ),
          );
        }
        
        return RefreshIndicator(
          onRefresh: () => provider.loadCourses(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.courses.length,
            itemBuilder: (context, index) {
              return _buildCourseCard(provider.courses[index]);
            },
          ),
        );
      },
    );
  }
  
  Widget _buildRegistrationsTab() {
    return Consumer<CoursesProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.registrations.isEmpty) {
          return const LoadingWidget(message: 'Loading registrations...');
        }
        
        if (provider.registrations.isEmpty) {
          return EmptyStateWidget(
            icon: Icons.person_add_outlined,
            title: 'No registrations yet',
            subtitle: 'Course registrations will appear here',
          );
        }
        
        return RefreshIndicator(
          onRefresh: () => provider.loadRegistrations(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.registrations.length,
            itemBuilder: (context, index) {
              return _buildRegistrationCard(provider.registrations[index]);
            },
          ),
        );
      },
    );
  }
  
  Widget _buildCourseCard(Course course) {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  course.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),
              StatusBadge(status: course.status),
            ],
          ),
          const SizedBox(height: 12),
          if (course.description != null)
            Text(
              course.description!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 14,
              ),
            ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildInfoChip(Icons.timer, course.durationText),
              const SizedBox(width: 8),
              _buildInfoChip(Icons.attach_money, course.formattedPrice),
              if (course.track != null) ...[
                const SizedBox(width: 8),
                _buildInfoChip(Icons.category, course.track!),
              ],
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: () {
                  // TODO: Edit course
                },
                icon: const Icon(Icons.edit, size: 18),
                label: const Text('Edit'),
              ),
              TextButton.icon(
                onPressed: () => _confirmDeleteCourse(course),
                icon: const Icon(Icons.delete, size: 18, color: AppTheme.danger),
                label: const Text('Delete', style: TextStyle(color: AppTheme.danger)),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildRegistrationCard(CourseRegistration reg) {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      reg.fullName,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      reg.email,
                      style: TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              StatusBadge(status: reg.paymentStatusText),
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
                const Icon(Icons.school, color: AppTheme.accent, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    reg.courseTitle,
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              if (reg.createdAt != null)
                _buildInfoChip(
                  Icons.calendar_today,
                  DateFormat('MMM d, y').format(reg.createdAt!),
                ),
              const SizedBox(width: 8),
              if (reg.organization != null)
                _buildInfoChip(Icons.business, reg.organization!),
            ],
          ),
        ],
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
            style: TextStyle(
              fontSize: 12,
              color: AppTheme.textMuted,
            ),
          ),
        ],
      ),
    );
  }
  
  void _showAddCourseDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final priceController = TextEditingController();
    final durationController = TextEditingController();
    
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
                  'Add Course',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Course Title',
                    prefixIcon: Icon(Icons.school),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    prefixIcon: Icon(Icons.description),
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: durationController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Duration (weeks)',
                          prefixIcon: Icon(Icons.timer),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: priceController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Price (₦)',
                          prefixIcon: Icon(Icons.attach_money),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (titleController.text.isEmpty) {
                        ScaffoldMessenger.of(ctx).showSnackBar(
                          const SnackBar(
                            content: Text('Title is required'),
                            backgroundColor: AppTheme.danger,
                          ),
                        );
                        return;
                      }
                      
                      final success = await context.read<CoursesProvider>().createCourse({
                        'title': titleController.text,
                        'description': descController.text,
                        'duration_weeks': int.tryParse(durationController.text),
                        'price': double.tryParse(priceController.text),
                        'status': 'active',
                      });
                      
                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(success 
                                ? 'Course added successfully' 
                                : 'Failed to add course'),
                            backgroundColor: success ? AppTheme.success : AppTheme.danger,
                          ),
                        );
                      }
                    },
                    child: const Text('Add Course'),
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
  
  void _confirmDeleteCourse(Course course) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: const Text('Delete Course'),
        content: Text('Are you sure you want to delete "${course.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<CoursesProvider>().deleteCourse(course.id);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
