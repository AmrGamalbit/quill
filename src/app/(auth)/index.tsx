import LoginArt from "@/assets/images/login.svg";
import Button from "@/src/components/Button";
import { radius } from "@/src/constants/radius";
import { spacing } from "@/src/constants/spacings";
import { fontSizes, fonts } from "@/src/constants/typography";
import useTheme from "@/src/hooks/useTheme";
import { sendPasswordResetEmail, signIn, signUp } from "@/src/utils/auth";
import { useRef, useState } from "react";
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Auth() {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const forgotAnim = useRef(new Animated.Value(isSignUp ? 0 : 1)).current;

  async function handleAuth() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("MIssing details", "Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { session } = await signUp(email.trim(), password);
        if (!session) {
          Alert.alert(
            "Check your inbox",
            "We sent a confirmation link to your email.",
          );
        }
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      Alert.alert(
        isSignUp ? "Sign Up Error" : "Login Error",
        err.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function handleForgotPassword() {
    if (!email.trim()) {
      Alert.alert(
        "Enter your email",
        "Please enter your email address in the field above first, then tap Forgot Password.",
      );
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(email.trim());
      Alert.alert(
        "Check your inbox",
        "We've sent a password reset link to your email.",
      );
    } catch (err: any) {
      Alert.alert("Reset Error", err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }
  const toggleAuthMode = () => {
    // Tell React Native to glide other screen elements smoothly
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // 1. Fade out the title/subtitle
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      const nextIsSignUp = !isSignUp;
      setIsSignUp(nextIsSignUp);

      // 2. Animate the Forgot Password button (0 = hide, 1 = show)
      Animated.timing(forgotAnim, {
        toValue: nextIsSignUp ? 0 : 1,
        duration: 200,
        useNativeDriver: false,
      }).start();

      // 3. Fade back in the title/subtitle
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/*SVG Illustration Slot */}
        <View style={styles.illustrationWrapper}>
          <LoginArt width={180} height={180} />
        </View>

        <Animated.View
          style={[
            styles.headerBlock,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {isSignUp ? "Create an account" : "Welcome back"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {isSignUp
              ? "Start recording your thoughts and daily moments."
              : "We're glad to have you back!"}
          </Text>
        </Animated.View>

        <View style={styles.form}>
          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
            EMAIL
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
            PASSWORD
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="******"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {!isSignUp && (
            <Animated.View
              style={[
                styles.forgotContainer,
                {
                  opacity: forgotAnim,
                  maxHeight: forgotAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 36],
                  }),
                  transform: [
                    {
                      translateY: forgotAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-6, 0],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents={isSignUp ? "none" : "auto"}
            >
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={[styles.forgotText, { color: colors.accent }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Button
            label={isSignUp ? "Sign Up" : "Sign In"}
            variant="primary"
            onPress={handleAuth}
            loading={loading}
          />

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textMuted }]}>
              {isSignUp
                ? "Already have an account?"
                : "Don't have an account yet?"}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={[styles.switchLink, { color: colors.accent }]}>
                {isSignUp ? " Sign In" : " Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: "center",
  },
  illustrationWrapper: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  placeholderArt: {
    width: 140,
    height: 140,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.label,
  },
  headerBlock: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  form: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.label,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  switchText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
  },
  switchLink: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.label,
    fontWeight: "700",
  },
  forgotContainer: {
    overflow: "hidden",
    alignSelf: "flex-end",
  },
  forgotBtn: {
    paddingVertical: spacing.xs,
  },
  forgotText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.label,
    fontWeight: "600",
  },
});
