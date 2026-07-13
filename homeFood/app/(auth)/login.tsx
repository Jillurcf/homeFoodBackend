import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { loginThunk, clearError } from "@/src/store/authSlice";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(drawer)/(tabs)');
    }

    console.log(isAuthenticated, "isAuthenticated in login screen ===============")
  }, [isAuthenticated]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleLogin = () => {
    dispatch(loginThunk({ email, password }));
  };

  const allFilled = email.trim() !== '' && password.trim() !== '';

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo3.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Please Login</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Write it here"
            placeholderTextColor="#949494"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Write it here"
            placeholderTextColor="#949494"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isShowPassword}
          />
          <TouchableOpacity onPress={() => setIsShowPassword(!isShowPassword)} style={styles.eyeButton}>
            <Text style={styles.eyeText}>{isShowPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.textSmall}>
            Do not have an account please{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/Signup', params: { screenName: 'signup' } })}>
            <Text style={styles.linkText}>Signup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rowWrap}>
          <Text style={styles.textSmall}>By logging in you accept our </Text>
          <TouchableOpacity><Text style={styles.linkText}>TOS</Text></TouchableOpacity>
          <Text style={styles.textSmall}>&</Text>
          <TouchableOpacity><Text style={styles.linkText}>PP</Text></TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/EmailVerification', params: { screenName: 'forgetPass' } })}>
          <Text style={styles.forgotPassword}>Forget password</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, (!allFilled || isLoading) && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!allFilled || isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Wait...' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: '4%',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  topSection: {
    marginTop: 10,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    textAlign: 'center',
    color: '#000',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 20,
  },
  inputWrapper: {
    marginTop: 10,
  },
  label: {
    color: '#000',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#F36C26',
    height: 48,
    color: '#000',
    fontSize: 16,
    paddingVertical: 4,
  },
  eyeButton: {
    alignSelf: 'flex-end',
    marginTop: -32,
    marginRight: 4,
  },
  eyeText: {
    color: '#F36C26',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 10,
    alignItems: 'center',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 16,
    alignItems: 'center',
  },
  textSmall: {
    fontSize: 12,
    color: '#000',
  },
  linkText: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'underline',
  },
  forgotPassword: {
    marginTop: 16,
    color: '#000',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  bottomSection: {
    marginVertical: 40,
  },
  button: {
    backgroundColor: '#F36C26',
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
