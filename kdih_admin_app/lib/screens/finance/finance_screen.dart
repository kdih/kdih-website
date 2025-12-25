// KDIH Admin App - Finance Screen

import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/responsive.dart';
import '../../core/services/api_service.dart';
import '../../widgets/cards/stat_card.dart';
import '../../widgets/common/loading_widget.dart';

class FinanceScreen extends StatefulWidget {
  const FinanceScreen({super.key});
  
  @override
  State<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends State<FinanceScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _overview;
  List<dynamic> _transactions = [];
  bool _isLoading = true;
  String? _error;
  
  @override
  void initState() {
    super.initState();
    _loadFinance();
  }
  
  Future<void> _loadFinance() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final overview = await _api.getFinanceOverview();
      final analytics = await _api.getRevenueAnalytics();
      
      setState(() {
        _overview = overview.data;
        _transactions = analytics.data['recent_transactions'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final isTablet = Responsive.isTabletOrLarger(context);
    final currencyFormat = NumberFormat.currency(symbol: '₦', decimalDigits: 0);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Finance'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadFinance),
        ],
      ),
      body: _isLoading
          ? const LoadingWidget(message: 'Loading finance data...')
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: AppTheme.danger),
                      const SizedBox(height: 16),
                      Text(_error!, style: TextStyle(color: AppTheme.textMuted)),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _loadFinance, child: const Text('Retry')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadFinance,
                  child: SingleChildScrollView(
                    padding: EdgeInsets.all(isTablet ? 24 : 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Stats Overview
                        GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: isTablet ? 4 : 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: isTablet ? 1.5 : 1.3,
                          children: [
                            StatCard(
                              title: 'Total Revenue',
                              value: currencyFormat.format(_overview?['total_revenue'] ?? 0),
                              icon: Icons.account_balance_wallet,
                              color: AppTheme.success,
                            ),
                            StatCard(
                              title: 'This Month',
                              value: currencyFormat.format(_overview?['monthly_revenue'] ?? 0),
                              icon: Icons.trending_up,
                              color: AppTheme.accent,
                            ),
                            StatCard(
                              title: 'Pending',
                              value: currencyFormat.format(_overview?['pending_payments'] ?? 0),
                              icon: Icons.hourglass_empty,
                              color: AppTheme.warning,
                            ),
                            StatCard(
                              title: 'Transactions',
                              value: '${_overview?['total_transactions'] ?? 0}',
                              icon: Icons.receipt_long,
                              color: Colors.purple,
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        
                        // Revenue Chart
                        const Text(
                          'Revenue Trend',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                        ),
                        const SizedBox(height: 16),
                        _buildRevenueChart(),
                        const SizedBox(height: 32),
                        
                        // Revenue Sources
                        const Text(
                          'Revenue Sources',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                        ),
                        const SizedBox(height: 16),
                        _buildSourcesBreakdown(),
                        const SizedBox(height: 32),
                        
                        // Recent Transactions
                        const Text(
                          'Recent Transactions',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                        ),
                        const SizedBox(height: 16),
                        _buildTransactionsList(currencyFormat),
                      ],
                    ),
                  ),
                ),
    );
  }
  
  Widget _buildRevenueChart() {
    return Container(
      height: 220,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: 500000,
          barTouchData: BarTouchData(enabled: true),
          titlesData: FlTitlesData(
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  final idx = value.toInt();
                  if (idx >= 0 && idx < months.length) {
                    return Text(months[idx], style: TextStyle(fontSize: 10, color: AppTheme.textMuted));
                  }
                  return const Text('');
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 50,
                getTitlesWidget: (value, meta) {
                  return Text('${(value / 1000).toInt()}K', style: TextStyle(fontSize: 10, color: AppTheme.textMuted));
                },
              ),
            ),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(show: false),
          gridData: FlGridData(show: true, drawVerticalLine: false),
          barGroups: [
            _makeBarGroup(0, 150000),
            _makeBarGroup(1, 220000),
            _makeBarGroup(2, 180000),
            _makeBarGroup(3, 350000),
            _makeBarGroup(4, 280000),
            _makeBarGroup(5, 420000),
          ],
        ),
      ),
    );
  }
  
  BarChartGroupData _makeBarGroup(int x, double y) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: AppTheme.accent,
          width: 16,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
        ),
      ],
    );
  }
  
  Widget _buildSourcesBreakdown() {
    final sources = [
      {'label': 'Course Fees', 'amount': 450000, 'color': AppTheme.accent},
      {'label': 'Coworking', 'amount': 180000, 'color': AppTheme.success},
      {'label': 'Events', 'amount': 95000, 'color': AppTheme.warning},
      {'label': 'Certificates', 'amount': 75000, 'color': Colors.purple},
    ];
    
    final total = sources.fold<int>(0, (sum, s) => sum + (s['amount'] as int));
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Column(
        children: sources.map((source) {
          final percentage = ((source['amount'] as int) / total * 100).toStringAsFixed(0);
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: source['color'] as Color,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(child: Text(source['label'] as String, style: const TextStyle(color: AppTheme.textPrimary))),
                Text(
                  '₦${NumberFormat('#,###').format(source['amount'])}',
                  style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                ),
                const SizedBox(width: 12),
                Container(
                  width: 50,
                  alignment: Alignment.centerRight,
                  child: Text('$percentage%', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
  
  Widget _buildTransactionsList(NumberFormat currencyFormat) {
    if (_transactions.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppTheme.cardBackground,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.divider),
        ),
        child: Center(
          child: Text('No recent transactions', style: TextStyle(color: AppTheme.textMuted)),
        ),
      );
    }
    
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _transactions.length > 10 ? 10 : _transactions.length,
        separatorBuilder: (_, __) => const Divider(color: AppTheme.divider, height: 1),
        itemBuilder: (context, index) {
          final tx = _transactions[index];
          final amount = (tx['amount'] as num?)?.toDouble() ?? 0;
          final date = tx['created_at'] != null ? DateTime.tryParse(tx['created_at']) : null;
          
          return ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppTheme.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.arrow_downward, color: AppTheme.success, size: 20),
            ),
            title: Text(tx['description'] ?? tx['type'] ?? 'Payment', style: const TextStyle(color: AppTheme.textPrimary)),
            subtitle: Text(
              date != null ? DateFormat('MMM d, y').format(date) : '',
              style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
            trailing: Text(
              currencyFormat.format(amount),
              style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.success),
            ),
          );
        },
      ),
    );
  }
}
