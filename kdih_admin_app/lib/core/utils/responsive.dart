// KDIH Admin App - Responsive Utilities
// Provides responsive breakpoints and layout helpers for phones and tablets

import 'package:flutter/material.dart';

/// Device type enumeration
enum DeviceType { phone, tablet, desktop }

/// Responsive helper class that provides device-aware breakpoints
class Responsive {
  static const double phoneBreakpoint = 600;
  static const double tabletBreakpoint = 1024;
  
  /// Get the device type based on screen width
  static DeviceType getDeviceType(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < phoneBreakpoint) {
      return DeviceType.phone;
    } else if (width < tabletBreakpoint) {
      return DeviceType.tablet;
    } else {
      return DeviceType.desktop;
    }
  }
  
  /// Check if the device is a phone
  static bool isPhone(BuildContext context) {
    return getDeviceType(context) == DeviceType.phone;
  }
  
  /// Check if the device is a tablet
  static bool isTablet(BuildContext context) {
    return getDeviceType(context) == DeviceType.tablet;
  }
  
  /// Check if the device is a desktop
  static bool isDesktop(BuildContext context) {
    return getDeviceType(context) == DeviceType.desktop;
  }
  
  /// Check if the device is a tablet or larger
  static bool isTabletOrLarger(BuildContext context) {
    return MediaQuery.of(context).size.width >= phoneBreakpoint;
  }
  
  /// Get the number of grid columns based on device type
  static int getGridColumns(BuildContext context) {
    switch (getDeviceType(context)) {
      case DeviceType.phone:
        return 2;
      case DeviceType.tablet:
        return 3;
      case DeviceType.desktop:
        return 4;
    }
  }
  
  /// Get horizontal padding based on device
  static double getHorizontalPadding(BuildContext context) {
    switch (getDeviceType(context)) {
      case DeviceType.phone:
        return 16;
      case DeviceType.tablet:
        return 24;
      case DeviceType.desktop:
        return 32;
    }
  }
  
  /// Get card aspect ratio based on device
  static double getCardAspectRatio(BuildContext context) {
    switch (getDeviceType(context)) {
      case DeviceType.phone:
        return 1.3;
      case DeviceType.tablet:
        return 1.4;
      case DeviceType.desktop:
        return 1.5;
    }
  }
}

/// A responsive widget that shows different children based on screen size
class ResponsiveBuilder extends StatelessWidget {
  final Widget phone;
  final Widget? tablet;
  final Widget? desktop;
  
  const ResponsiveBuilder({
    super.key,
    required this.phone,
    this.tablet,
    this.desktop,
  });
  
  @override
  Widget build(BuildContext context) {
    switch (Responsive.getDeviceType(context)) {
      case DeviceType.desktop:
        return desktop ?? tablet ?? phone;
      case DeviceType.tablet:
        return tablet ?? phone;
      case DeviceType.phone:
        return phone;
    }
  }
}

/// A responsive layout that adapts content width for larger screens
class ResponsiveContainer extends StatelessWidget {
  final Widget child;
  final double maxWidth;
  final EdgeInsetsGeometry? padding;
  
  const ResponsiveContainer({
    super.key,
    required this.child,
    this.maxWidth = 1200,
    this.padding,
  });
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: Padding(
          padding: padding ?? EdgeInsets.symmetric(
            horizontal: Responsive.getHorizontalPadding(context),
          ),
          child: child,
        ),
      ),
    );
  }
}
