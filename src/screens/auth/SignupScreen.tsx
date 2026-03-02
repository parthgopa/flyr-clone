import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";
import { theme } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin } = useAuth();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate phone number (basic validation)
    if (phone.trim().length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    console.log("Signup attempt:", email);

    try {
      await signup(name.trim(), email.trim(), phone.trim(), password);
      console.log("✓ Signup successful");
      // Navigation handled by App.tsx based on auth state
    } catch (error: any) {
      console.error("Signup failed:", error);
      Alert.alert("Signup Failed", error.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     setLoading(true);
  //     console.log("Initiating Google Sign-In...");

  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     console.log( userInfo)

  //     console.log("Google user info:", userInfo);

  //     // Access idToken from data property
  //     const idToken = (userInfo as any).data?.idToken;

  //     if (idToken) {
  //       await googleLogin(idToken);
  //       console.log("✓ Google sign-in successful");
  //     } else {
  //       throw new Error("No ID token received from Google");
  //     }
  //   } catch (error: any) {
  //     console.error("Google sign-in error:", error);
  //     Alert.alert("Google Sign-In Failed", error.message || "Could not sign in with Google");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // await GoogleSignin.hasPlayServices({
      //   showPlayServicesUpdateDialog: true,
      // });

      const response = await GoogleSignin.signIn();
      console.log(response);

      // const response = await GoogleSignin.signIn();

      // if (response.type !== "success") {
      //   throw new Error("Google sign in cancelled");
      // }

      // const { idToken } = response.data;

      // if (!idToken) {
      //   throw new Error("No ID token received");
      // }

      // await googleLogin(idToken);

    } catch (error: any) {
      console.error("Google sign-in error:", error);
      Alert.alert(
        "Google Sign-In Failed",
        error.message || "Could not sign in with Google"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.title}>Create Account</AppText>
          <AppText style={styles.subtitle}>Sign up to get started</AppText>
        </View>

        {/* Signup Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Full Name</AppText>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Email</AppText>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Phone Number</AppText>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={20}
                color={theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.muted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Password</AppText>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={theme.colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>
            </View>
            <AppText style={styles.passwordHint}>
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </AppText>
          </View>

          

          {/* Signup Button */}
          <AppButton
            title={loading ? "Creating account..." : "Sign Up"}
            onPress={handleSignup}
            disabled={loading}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <AppText style={styles.dividerText}>OR</AppText>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <AppText style={styles.googleButtonText}>Continue with Google</AppText>
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <AppText style={styles.footerText}>Already have an account? </AppText>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <AppText style={styles.linkText}>Sign In</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.safeTop + theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.hero,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputContainer: {
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  passwordHint: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginHorizontal: theme.spacing.md,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    height: 50,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  googleButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  linkText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.accent,
    fontWeight: "600",
  },
});
