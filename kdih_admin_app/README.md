# KDIH Admin Mobile App

A Flutter-based mobile application for managing the KDIH (Katsina Digital Innovation Hub) admin dashboard on the go.

## 📱 Features

The app includes all features from the web admin dashboard:

### Core Features

- **🔐 Authentication** - Secure login with session management
- **📊 Dashboard** - At-a-glance statistics and quick actions
- **👥 Members Management** - View, add, edit, and delete members
- **📧 Messages** - View and reply to contact messages
- **📚 Courses** - Manage courses and registrations
- **📅 Events** - Create and manage events
- **🚀 Startups** - Review incubation applications
- **💺 Coworking** - Manage desk bookings and check-ins
- **📸 Gallery** - Manage photo gallery
- **🎓 Certificates** - Issue and approve certificates
- **💼 Jobs** - Post jobs and manage applications
- **💰 Finance** - Revenue tracking and transactions
- **📈 Analytics** - View performance metrics and charts
- **⚙️ Settings** - Profile and password management

### Technical Features

- 🌙 Beautiful dark theme matching web dashboard
- 📱 Responsive design for phones AND tablets
- 🎨 KDIH brand logo as app icon
- 🔄 Pull-to-refresh on all screens
- 💾 Secure local storage for sessions
- 🔐 Role-based access control (matching web dashboard)
- 🌐 REST API integration with your backend

## 🚀 Getting Started

### Prerequisites

- Flutter SDK 3.10.4 or higher
- Dart 3.0 or higher
- iOS device/simulator or Android device/emulator

### Installation

1. Navigate to the app directory:

```bash
cd kdih_admin_app
```

1. Install dependencies:

```bash
flutter pub get
```

1. **Configure API URL**: Open `lib/core/constants/app_constants.dart` and update:

```dart
// For production:
static const String baseUrl = 'https://kdih.org/api';

// For local development:
// static const String baseUrl = 'http://localhost:3000/api';
// For Android emulator use: 'http://10.0.2.2:3000/api'
```

1. Download Outfit font files and place in `assets/fonts/`:
   - Outfit-Regular.ttf
   - Outfit-Medium.ttf
   - Outfit-SemiBold.ttf
   - Outfit-Bold.ttf

   Alternatively, the app will use Google Fonts as fallback.

2. Run the app:

```bash
# For iOS Simulator
flutter run -d ios

# For Android Emulator
flutter run -d android

# For Chrome (web)
flutter run -d chrome
```

## 📁 Project Structure

```plaintext
kdih_admin_app/
├── lib/
│   ├── core/
│   │   ├── constants/      # App constants & API endpoints
│   │   ├── services/       # API service
│   │   ├── theme/          # App theme configuration
│   │   └── utils/          # Responsive utilities
│   ├── models/             # 10 Data models
│   ├── providers/          # 11 State providers
│   ├── screens/            # 15 App screens
│   │   ├── analytics/      # Analytics & charts
│   │   ├── auth/           # Login screens
│   │   ├── certificates/   # Certificate management
│   │   ├── courses/        # Courses & registrations
│   │   ├── coworking/      # Coworking management
│   │   ├── dashboard/      # Dashboard
│   │   ├── events/         # Events management
│   │   ├── finance/        # Finance & revenue
│   │   ├── gallery/        # Gallery management
│   │   ├── jobs/           # Jobs & applications
│   │   ├── members/        # Members management
│   │   ├── messages/       # Messages
│   │   ├── settings/       # Settings & profile
│   │   └── startups/       # Startup applications
│   ├── widgets/            # Reusable widgets
│   │   ├── cards/          # Card widgets
│   │   └── common/         # Common widgets
│   └── main.dart           # App entry point (44 Dart files total)
├── assets/
│   ├── fonts/              # Custom fonts (Outfit)
│   ├── icons/              # App icons
│   └── images/             # Images (including logo.jpeg)
└── pubspec.yaml            # Dependencies
```

## 🔧 Configuration

### Backend API Setup

The app connects to your existing KDIH backend. Ensure the following:

1. CORS is enabled for mobile app requests
2. Session-based authentication is working
3. All API endpoints are accessible

### Environment-Specific Builds

For different environments, update the `baseUrl` in `app_constants.dart`:

```dart
// Development
static const String baseUrl = 'http://localhost:3000/api';

// Staging
static const String baseUrl = 'https://staging.kdih.org/api';

// Production
static const String baseUrl = 'https://kdih.org/api';
```

## 📦 Building for Production

### Android

```bash
flutter build apk --release
# APK will be at: build/app/outputs/flutter-apk/app-release.apk

# For app bundle (recommended for Play Store)
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
# Then open Xcode and archive for distribution
```

## 🎨 Theme Customization

The app uses a custom dark theme matching the web dashboard. To customize:

1. Edit `lib/core/theme/app_theme.dart`
2. Update brand colors:

```dart
static const Color primary = Color(0xFF0F172A);
static const Color accent = Color(0xFF2563EB);
static const Color success = Color(0xFF10B981);
// ... etc
```

## 🔒 Security Notes

- Session tokens are stored securely using `flutter_secure_storage`
- API communications use HTTPS in production
- Sensitive data is not logged in production builds

## 📱 Supported Platforms

- ✅ Android 5.0+ (API 21+)
- ✅ iOS 12.0+
- ✅ Web (Chrome, Safari, Firefox)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is part of the KDIH organization. All rights reserved.

---

Built with ❤️ using Flutter
