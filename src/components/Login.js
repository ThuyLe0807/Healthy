import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Alert
} from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import CheckBox from 'react-native-check-box';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  const onLogin = () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    auth()
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        console.log('Login response:', res);
        ToastAndroid.show('Đăng nhập thành công', ToastAndroid.SHORT);
        
        navigation.navigate('BottomTab'); // Chuyển sang màn hình Home
        setEmail('');
        setPassword('');
      })
      .catch(err => {
        console.log(`Lỗi đăng nhập: ${err}`);
        let errorMessage = 'Đã có lỗi xảy ra';
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'Người dùng không tồn tại';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Địa chỉ email không hợp lệ';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Mật khẩu không đúng';
            break;
          default:
            errorMessage = 'Đã có lỗi xảy ra';
        }
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      });
  };

  return (
    <View style={styles.container}>
      {/* <Image
        style={styles.logo}
        // source={require('../img/logo.png')}
      /> */}
      <Text style={styles.greeting}>
        XIN CHÀO
      </Text>
      <Text style={styles.subtitle}>
        Đăng nhập để tiếp tục
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#B0BEC5"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#B0BEC5"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.checkboxContainer}>
        <CheckBox
          isChecked={isChecked}
          onClick={() => setIsChecked(!isChecked)}
          rightText="Lưu mật khẩu"
          rightTextStyle={styles.checkboxText}
        />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={onLogin}
      >
        <Text style={styles.loginButtonText}>
          Đăng nhập
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.forgotPassword} onPress={() => {/* Add your forgot password navigation here */}}>
          Quên mật khẩu
        </Text>
        <Text style={styles.footerText}>
          Bạn chưa có tài khoản?{' '}
          <Text onPress={() => navigation.navigate('Register')} style={styles.registerText}>Đăng kí</Text>
        </Text>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D5E8D4', // Màu nền xanh thiên nhiên nhạt
    padding: 16,
  },
  logo: {
    width: '250',
    height: 'auto',
    alignSelf: 'center',
    marginTop: 40,
  },
  greeting: {
    fontSize: 24,
    color: '#00796B', // Màu xanh thiên nhiên đậm
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#004D40', // Màu xanh thiên nhiên đậm hơn
    fontWeight: '400',
    alignSelf: 'center',
    marginVertical: 8,
    marginBottom: 18,
  },
  input: {
    height: 48,
    width: 340,
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    borderRadius: 8,
    borderColor: '#B0BEC5',
    elevation: 3,
    alignSelf: 'center',
  },
  loginButton: {
    alignSelf: 'center',
    width: 200,
    height: 46,
    backgroundColor: '#00796B', // Màu xanh thiên nhiên đậm
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    elevation: 2,
    margin: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  checkboxContainer: {
    marginVertical: 12,
    marginLeft: 28,
  },
  checkboxText: {
    color: '#004D40', // Màu xanh thiên nhiên đậm hơn
    fontSize: 14,
    fontWeight: '400',
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPassword: {
    color: '#00796B', // Màu xanh thiên nhiên đậm
    fontSize: 16,
    textDecorationLine: 'underline',
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 36,
  },
  footerText: {
    color: '#004D40', // Màu xanh thiên nhiên đậm hơn
    fontSize: 16,
  },
  registerText: {
    color: '#00796B', // Màu xanh thiên nhiên đậm
  },
});
