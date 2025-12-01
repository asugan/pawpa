import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { Text, Button, Card } from '@/components/ui';

export default function SignupScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp } = useAuth();
  const { isLoading, setLoading, setError, authError, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('auth.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    clearError();
    setLoading(true);

    try {
      const result = await signUp(email.trim(), password, name.trim());

      if (result?.error) {
        setError(result.error.message || t('auth.signUpError'));
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      setError(t('auth.signUpError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Title */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name="paw"
                size={48}
                color={theme.colors.primary}
              />
            </View>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              PawPa
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('auth.signUpSubtitle')}
            </Text>
          </View>

          {/* Error Message */}
          {authError && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{authError}</Text>
            </View>
          )}

          {/* Signup Form */}
          <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.formContent}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                  {t('auth.name')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.onSurface }]}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('auth.namePlaceholder')}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                  {t('auth.email')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.onSurface }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                  {t('auth.password')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.onSurface }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                  {t('auth.confirmPassword')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lock-check-outline"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.onSurface }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <MaterialCommunityIcons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Signup Button */}
              <Button
                mode="contained"
                onPress={handleSignup}
                loading={isLoading}
                disabled={isLoading}
                style={styles.signupButton}
              >
                {t('auth.signUp')}
              </Button>
            </View>
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {t('auth.alreadyHaveAccount')}{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                  {t('auth.login')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  formCard: {
    marginBottom: 24,
  },
  formContent: {
    padding: 20,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  signupButton: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
