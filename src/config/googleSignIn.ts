import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Configure Google Sign-In
 * Call this once when the app starts
 */
export const configureGoogleSignIn = () => {
  const webClientId = '783547595969-ffug97g5k2j2podl1lbike88eivp7pp1.apps.googleusercontent.com';
  
  console.log('✓ Configuring Google Sign-In...');
  console.log('Web Client ID:', webClientId);
  
  GoogleSignin.configure({
    webClientId: webClientId,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
  
  console.log('✓ Google Sign-In configured successfully');
};
