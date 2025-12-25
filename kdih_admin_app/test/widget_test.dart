import 'package:flutter_test/flutter_test.dart';
import 'package:kdih_admin_app/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const KDIHAdminApp());

    // Verify the loading screen appears
    expect(find.text('Loading...'), findsOneWidget);
  });
}
