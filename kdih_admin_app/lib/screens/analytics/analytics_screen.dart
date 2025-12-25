// KDIH Admin App - Analytics Screen

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/responsive.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/cards/stat_card.dart';
import '../../widgets/common/loading_widget.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});
  
  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadDashboard();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final isTablet = Responsive.isTabletOrLarger(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<DashboardProvider>().refresh(),
          ),
        ],
      ),
      body: Consumer<DashboardProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.stats == null) {
            return const LoadingWidget(message: 'Loading analytics...');
          }
          
          final stats = provider.stats;
          
          return RefreshIndicator(
            onRefresh: () => provider.refresh(),
            child: SingleChildScrollView(
              padding: EdgeInsets.all(isTablet ? 24 : 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('Overview'),
                  const SizedBox(height: 16),
                  _buildStatsGrid(stats, isTablet),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Member Growth'),
                  const SizedBox(height: 16),
                  _buildGrowthChart(),
                  const SizedBox(height: 32),
                  _buildSectionTitle('Pending Actions'),
                  const SizedBox(height: 16),
                  _buildPendingActions(stats),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
  
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: AppTheme.textPrimary,
      ),
    );
  }
  
  Widget _buildStatsGrid(stats, bool isTablet) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: isTablet ? 4 : 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: isTablet ? 1.5 : 1.3,
      children: [
        StatCard(
          title: 'Total Members',
          value: '${stats?.totalMembers ?? 0}',
          icon: Icons.people,
          color: AppTheme.accent,
        ),
        StatCard(
          title: 'Enrollments',
          value: '${stats?.courseEnrollments ?? 0}',
          icon: Icons.school,
          color: AppTheme.success,
        ),
        StatCard(
          title: 'Events',
          value: '${stats?.upcomingEvents ?? 0}',
          icon: Icons.event,
          color: AppTheme.warning,
        ),
        StatCard(
          title: 'Applications',
          value: '${stats?.pendingApplications ?? 0}',
          icon: Icons.rocket_launch,
          color: Colors.purple,
        ),
      ],
    );
  }
  
  Widget _buildGrowthChart() {
    return Container(
      height: 250,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: LineChart(
        LineChartData(
          gridData: FlGridData(show: true, drawVerticalLine: false),
          titlesData: FlTitlesData(
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  final index = value.toInt();
                  if (index >= 0 && index < months.length) {
                    return Text(months[index], style: TextStyle(fontSize: 11, color: AppTheme.textMuted));
                  }
                  return const Text('');
                },
              ),
            ),
            leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: const [FlSpot(0, 10), FlSpot(1, 15), FlSpot(2, 22), FlSpot(3, 28), FlSpot(4, 35), FlSpot(5, 42)],
              isCurved: true,
              color: AppTheme.accent,
              barWidth: 3,
              belowBarData: BarAreaData(show: true, color: AppTheme.accent.withValues(alpha: 0.1)),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildPendingActions(stats) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Column(
        children: [
          _buildActionItem(Icons.school, 'Pending Registrations', '${stats?.pendingRegistrations ?? 0}', AppTheme.warning),
          _buildActionItem(Icons.card_membership, 'Pending Certificates', '${stats?.pendingCertificates ?? 0}', AppTheme.warning),
          _buildActionItem(Icons.email, 'Unread Messages', '${stats?.unreadMessages ?? 0}', AppTheme.accent),
          _buildActionItem(Icons.rocket_launch, 'Pending Applications', '${stats?.pendingApplications ?? 0}', Colors.purple),
        ],
      ),
    );
  }
  
  Widget _buildActionItem(IconData icon, String label, String count, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(child: Text(label, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w500))),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
            child: Text(count, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
