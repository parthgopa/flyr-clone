import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { configureGoogleSignIn } from "./src/config/googleSignIn";
import AppNavigator from "./src/navigation/AppNavigator";
import AppStatusBar from "./src/components/AppStatusBar";

// Configure Google Sign-In on app start
configureGoogleSignIn();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStatusBar />
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
