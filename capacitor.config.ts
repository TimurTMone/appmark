import type { CapacitorConfig } from "@capacitor/cli";

// WebView-wrapper architecture: the native app loads the live Vercel URL,
// bridging the WebView camera through Capacitor's native permissions layer.
// Replace `server.url` with your own deployment URL before shipping.

const config: CapacitorConfig = {
  appId: "app.arc.coach",
  appName: "Arc",
  webDir: "out", // unused in wrapper mode but required by Capacitor
  server: {
    // TODO: replace with your actual Vercel production URL before submission.
    url: "https://appmark.vercel.app",
    cleartext: false,
    androidScheme: "https",
    iosScheme: "https",
  },
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
    backgroundColor: "#000000",
    // Allow media capture
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: "#000000",
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      iosSpinnerStyle: "small",
      spinnerColor: "#00ffa3",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#000000",
      overlaysWebView: false,
    },
  },
};

export default config;
