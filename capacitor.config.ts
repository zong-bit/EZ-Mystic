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
      'www.bornchart.app',
      'selinazw.gumroad.com',
      'checkout.paddle.com',
      'api.gumroad.com',
      'api.paddle.com',
      '*.supabase.co',
      '*.vercel.app',
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
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0d0d1a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      launchShowDurationAndroid: 2000,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#0d0d1a',
      overlaysWebView: false,
    },
  },
};

export default config;
