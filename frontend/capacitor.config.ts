import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.YesCoach',
  appName: 'YesCoachFrontend',
  webDir: 'www',
  bundledWebRuntime: false,
  // plugins: {
  // }
  plugins: {
    "FirebaseAuthentication": {
      "skipNativeAuth": false,
      "providers": ["google.com"]
    }
  }
};

export default config;
