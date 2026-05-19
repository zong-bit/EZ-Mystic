import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fatewise.app',
  appName: 'FateWise',
  webDir: 'www',
  server: {
    // Production: load from bornchart.app
    // Development: use localhost Next.js dev server
    url: 'https://bornchart.app',
    cleartext: true,
    allowNavigation: [
      'bornchart.app',
      'selinazw.gumroad.com',
      'checkout.paddle.com',
      'api.gumroad.com',
    ],
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    backgroundColor: '#0d0d1a',
    // Enable backward/forward swipe gestures
    allowsLinkPreview: true,
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#0d0d1a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
