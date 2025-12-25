/// KDIH Admin App - Coworking Screen

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/coworking_provider.dart';
import '../../models/coworking.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/status_badge.dart';

class CoworkingScreen extends StatefulWidget {
  const CoworkingScreen({super.key});
  
  @override
  State<CoworkingScreen> createState() => _CoworkingScreenState();
}

class _CoworkingScreenState extends State<CoworkingScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<CoworkingProvider>();
      provider.loadMembers();
      provider.loadBookings();
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
        title: const Text('Coworking'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Bookings'),
            Tab(text: 'Members'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              final provider = context.read<CoworkingProvider>();
              provider.loadBookings();
              provider.loadMembers();
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAssignDeskDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Assign Desk'),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildBookingsTab(),
          _buildMembersTab(),
        ],
      ),
    );
  }
  
  Widget _buildBookingsTab() {
    return Consumer<CoworkingProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.bookings.isEmpty) {
          return const LoadingWidget(message: 'Loading bookings...');
        }
        
        if (provider.bookings.isEmpty) {
          return EmptyStateWidget(
            icon: Icons.desk_outlined,
            title: 'No bookings',
            subtitle: 'Desk bookings will appear here',
          );
        }
        
        return RefreshIndicator(
          onRefresh: () => provider.loadBookings(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.bookings.length,
            itemBuilder: (context, index) {
              return _buildBookingCard(provider.bookings[index]);
            },
          ),
        );
      },
    );
  }
  
  Widget _buildMembersTab() {
    return Consumer<CoworkingProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.members.isEmpty) {
          return const LoadingWidget(message: 'Loading members...');
        }
        
        if (provider.members.isEmpty) {
          return EmptyStateWidget(
            icon: Icons.people_outline,
            title: 'No coworking members',
            subtitle: 'Registered coworking members will appear here',
          );
        }
        
        return RefreshIndicator(
          onRefresh: () => provider.loadMembers(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.members.length,
            itemBuilder: (context, index) {
              return _buildMemberCard(provider.members[index]);
            },
          ),
        );
      },
    );
  }
  
  Widget _buildBookingCard(DeskBooking booking) {
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
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.desk, color: AppTheme.accent),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Desk ${booking.deskNumber ?? 'N/A'}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        booking.memberName ?? 'Unknown',
                        style: TextStyle(
                          color: AppTheme.textMuted,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              StatusBadge(status: booking.status),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildInfoChip(Icons.calendar_today, 
                booking.bookingDate != null 
                    ? DateFormat('MMM d, y').format(booking.bookingDate!) 
                    : 'N/A'),
              const SizedBox(width: 8),
              if (booking.checkInTime != null)
                _buildInfoChip(Icons.login, 
                  DateFormat('h:mm a').format(booking.checkInTime!)),
              if (booking.checkOutTime != null)
                _buildInfoChip(Icons.logout, 
                  DateFormat('h:mm a').format(booking.checkOutTime!)),
            ],
          ),
          if (booking.canCheckIn || booking.canCheckOut) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                if (booking.canCheckIn)
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _handleCheckIn(booking),
                      icon: const Icon(Icons.login),
                      label: const Text('Check In'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.success,
                      ),
                    ),
                  ),
                if (booking.canCheckOut)
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _handleCheckOut(booking),
                      icon: const Icon(Icons.logout),
                      label: const Text('Check Out'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.warning,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
  
  Widget _buildMemberCard(CoworkingMember member) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppTheme.accent,
            child: Text(
              member.fullName.isNotEmpty ? member.fullName[0].toUpperCase() : '?',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member.fullName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  member.memberCode,
                  style: TextStyle(
                    color: AppTheme.accent,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    _buildInfoChip(Icons.card_membership, member.membershipText),
                    const SizedBox(width: 8),
                    StatusBadge(status: member.status),
                  ],
                ),
              ],
            ),
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
  
  Future<void> _handleCheckIn(DeskBooking booking) async {
    final success = await context.read<CoworkingProvider>().checkIn(booking.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Checked in successfully' : 'Check-in failed'),
          backgroundColor: success ? AppTheme.success : AppTheme.danger,
        ),
      );
    }
  }
  
  Future<void> _handleCheckOut(DeskBooking booking) async {
    final success = await context.read<CoworkingProvider>().checkOut(booking.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Checked out successfully' : 'Check-out failed'),
          backgroundColor: success ? AppTheme.success : AppTheme.danger,
        ),
      );
    }
  }
  
  void _showAssignDeskDialog(BuildContext context) {
    final memberCodeController = TextEditingController();
    final deskController = TextEditingController();
    DateTime selectedDate = DateTime.now();
    
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
                  'Assign Desk',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: memberCodeController,
                  decoration: const InputDecoration(
                    labelText: 'Member Code',
                    hintText: 'e.g. KDIH-2024-0001',
                    prefixIcon: Icon(Icons.badge),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: deskController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Desk Number',
                    hintText: 'e.g. 5',
                    prefixIcon: Icon(Icons.desk),
                  ),
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: ctx,
                      initialDate: selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (date != null) {
                      selectedDate = date;
                    }
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Booking Date',
                      prefixIcon: Icon(Icons.calendar_today),
                    ),
                    child: Text(
                      DateFormat('MMM d, yyyy').format(selectedDate),
                      style: const TextStyle(color: AppTheme.textPrimary),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (memberCodeController.text.isEmpty || 
                          deskController.text.isEmpty) {
                        ScaffoldMessenger.of(ctx).showSnackBar(
                          const SnackBar(
                            content: Text('Please fill all fields'),
                            backgroundColor: AppTheme.danger,
                          ),
                        );
                        return;
                      }
                      
                      final success = await context.read<CoworkingProvider>().assignDesk({
                        'member_code': memberCodeController.text,
                        'desk_number': deskController.text,
                        'booking_date': DateFormat('yyyy-MM-dd').format(selectedDate),
                        'booking_type': 'Daily',
                      });
                      
                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(success 
                                ? 'Desk assigned successfully' 
                                : 'Failed to assign desk'),
                            backgroundColor: success ? AppTheme.success : AppTheme.danger,
                          ),
                        );
                      }
                    },
                    child: const Text('Assign Desk'),
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
}
