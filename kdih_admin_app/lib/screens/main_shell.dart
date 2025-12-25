// KDIH Admin App - Adaptive Main Shell with Role-Based Access
// Responsive navigation that adapts between bottom nav (phones) and rail (tablets)
// Role-based menu items matching the web dashboard

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/responsive.dart';
import '../providers/auth_provider.dart';
import 'dashboard/dashboard_screen.dart';
import 'members/members_screen.dart';
import 'messages/messages_screen.dart';
import 'coworking/coworking_screen.dart';
import 'courses/courses_screen.dart';
import 'certificates/certificates_screen.dart';
import 'events/events_screen.dart';
import 'startups/startups_screen.dart';
import 'analytics/analytics_screen.dart';
import 'gallery/gallery_screen.dart';
import 'jobs/jobs_screen.dart';
import 'finance/finance_screen.dart';
import 'settings/settings_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});
  
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  
  // Get role-based destinations matching web dashboard
  List<_NavDestination> _getDestinations(String? role) {
    final isSuperAdmin = role == 'super_admin';
    final isFinance = role == 'finance';
    final isTrainer = role == 'trainer';
    final isCoworking = role == 'coworking_admin';
    
    List<_NavDestination> destinations = [
      // Dashboard - All roles
      const _NavDestination(
        icon: Icons.dashboard_outlined,
        selectedIcon: Icons.dashboard,
        label: 'Dashboard',
        screen: DashboardScreen(),
      ),
    ];
    
    // Members - Super Admin, Trainer
    if (isSuperAdmin || isTrainer) {
      destinations.add(const _NavDestination(
        icon: Icons.people_outline,
        selectedIcon: Icons.people,
        label: 'Members',
        screen: MembersScreen(),
      ));
    }
    
    // Courses - Super Admin, Trainer
    if (isSuperAdmin || isTrainer) {
      destinations.add(const _NavDestination(
        icon: Icons.school_outlined,
        selectedIcon: Icons.school,
        label: 'Courses',
        screen: CoursesScreen(),
      ));
    }
    
    // Events - Super Admin
    if (isSuperAdmin) {
      destinations.add(const _NavDestination(
        icon: Icons.event_outlined,
        selectedIcon: Icons.event,
        label: 'Events',
        screen: EventsScreen(),
      ));
    }
    
    // Coworking - Super Admin, Coworking Admin
    if (isSuperAdmin || isCoworking) {
      destinations.add(const _NavDestination(
        icon: Icons.desk_outlined,
        selectedIcon: Icons.desk,
        label: 'Coworking',
        screen: CoworkingScreen(),
      ));
    }
    
    // Startups - Super Admin
    if (isSuperAdmin) {
      destinations.add(const _NavDestination(
        icon: Icons.rocket_launch_outlined,
        selectedIcon: Icons.rocket_launch,
        label: 'Startups',
        screen: StartupsScreen(),
      ));
    }
    
    // Certificates - Super Admin, Finance, Trainer
    if (isSuperAdmin || isFinance || isTrainer) {
      destinations.add(const _NavDestination(
        icon: Icons.card_membership_outlined,
        selectedIcon: Icons.card_membership,
        label: 'Certificates',
        screen: CertificatesScreen(),
      ));
    }
    
    // Messages - Super Admin
    if (isSuperAdmin) {
      destinations.add(const _NavDestination(
        icon: Icons.email_outlined,
        selectedIcon: Icons.email,
        label: 'Messages',
        screen: MessagesScreen(),
      ));
    }
    
    // Gallery - Super Admin
    if (isSuperAdmin) {
      destinations.add(const _NavDestination(
        icon: Icons.photo_library_outlined,
        selectedIcon: Icons.photo_library,
        label: 'Gallery',
        screen: GalleryScreen(),
      ));
    }
    
    // Jobs - Super Admin
    if (isSuperAdmin) {
      destinations.add(const _NavDestination(
        icon: Icons.work_outline,
        selectedIcon: Icons.work,
        label: 'Jobs',
        screen: JobsScreen(),
      ));
    }
    
    // Finance - Super Admin, Finance
    if (isSuperAdmin || isFinance) {
      destinations.add(const _NavDestination(
        icon: Icons.account_balance_wallet_outlined,
        selectedIcon: Icons.account_balance_wallet,
        label: 'Finance',
        screen: FinanceScreen(),
      ));
    }
    
    // Analytics - Super Admin, Finance
    if (isSuperAdmin || isFinance) {
      destinations.add(const _NavDestination(
        icon: Icons.analytics_outlined,
        selectedIcon: Icons.analytics,
        label: 'Analytics',
        screen: AnalyticsScreen(),
      ));
    }
    
    // Settings - All roles
    destinations.add(const _NavDestination(
      icon: Icons.settings_outlined,
      selectedIcon: Icons.settings,
      label: 'Settings',
      screen: SettingsScreen(),
    ));
    
    return destinations;
  }
  
  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final destinations = _getDestinations(user?.role);
    final isTablet = Responsive.isTabletOrLarger(context);
    
    // Reset index if out of bounds
    if (_currentIndex >= destinations.length) {
      _currentIndex = 0;
    }
    
    if (isTablet) {
      return _buildTabletLayout(destinations);
    } else {
      return _buildPhoneLayout(destinations);
    }
  }
  
  // Phone Layout - Bottom Navigation (max 5 items)
  Widget _buildPhoneLayout(List<_NavDestination> destinations) {
    // For phones, show max 5 items; prioritize important ones
    final phoneDestinations = destinations.length > 5 
        ? [...destinations.take(4), destinations.last] // First 4 + Settings
        : destinations;
    
    final currentIdx = _currentIndex >= phoneDestinations.length 
        ? 0 
        : _currentIndex;
    
    return Scaffold(
      body: destinations[_currentIndex].screen,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.sidebar,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                for (int i = 0; i < phoneDestinations.length; i++)
                  _buildNavItem(
                    i,
                    phoneDestinations[i].icon,
                    phoneDestinations[i].selectedIcon,
                    phoneDestinations[i].label,
                    currentIdx == i,
                    () {
                      // Find actual index in full destinations list
                      final dest = phoneDestinations[i];
                      final actualIndex = destinations.indexOf(dest);
                      setState(() { _currentIndex = actualIndex; });
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  // Tablet Layout - Navigation Rail with all items
  Widget _buildTabletLayout(List<_NavDestination> destinations) {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) {
              setState(() { _currentIndex = index; });
            },
            extended: MediaQuery.of(context).size.width > 900,
            backgroundColor: AppTheme.sidebar,
            selectedIconTheme: const IconThemeData(color: AppTheme.accent),
            unselectedIconTheme: IconThemeData(color: AppTheme.textMuted),
            selectedLabelTextStyle: const TextStyle(color: AppTheme.accent, fontWeight: FontWeight.w600),
            unselectedLabelTextStyle: TextStyle(color: AppTheme.textMuted),
            indicatorColor: AppTheme.accent.withValues(alpha: 0.1),
            leading: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: _buildLogo(),
            ),
            destinations: destinations.map((dest) {
              return NavigationRailDestination(
                icon: Icon(dest.icon),
                selectedIcon: Icon(dest.selectedIcon),
                label: Text(dest.label),
              );
            }).toList(),
          ),
          const VerticalDivider(thickness: 1, width: 1, color: AppTheme.divider),
          Expanded(child: destinations[_currentIndex].screen),
        ],
      ),
    );
  }
  
  Widget _buildLogo() {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        image: const DecorationImage(
          image: AssetImage('assets/images/logo.jpeg'),
          fit: BoxFit.cover,
        ),
      ),
    );
  }
  
  Widget _buildNavItem(int index, IconData icon, IconData activeIcon, String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 14 : 10,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.accent.withValues(alpha: 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? AppTheme.accent : AppTheme.textMuted,
              size: 22,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppTheme.accent : AppTheme.textMuted,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavDestination {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final Widget screen;
  
  const _NavDestination({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.screen,
  });
}
