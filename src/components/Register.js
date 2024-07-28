import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ToastAndroid,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Wrapper from './Wrapper';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [rePassword, setRePassword] = useState('');

  const navigation = useNavigation();

  const onRegister = async () => {
    if (!email || !password || !rePassword || !fullname) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password !== rePassword) {
      Alert.alert('Lỗi', 'Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { uid } = userCredential.user;
      console.log('UID của người dùng:', uid); // Log uid ra console để kiểm tra

      await userCredential.user.updateProfile({
        displayName: fullname,
      });

      await firestore().collection('users').doc(uid).set({
        fullname: fullname,
        email: email,
      });

      ToastAndroid.show('Tạo tài khoản thành công', ToastAndroid.SHORT);
      setEmail('');
      setPassword('');
      setRePassword('');
      setFullname('');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        ToastAndroid.show('Địa chỉ email đã tồn tại', ToastAndroid.SHORT);
      } else if (err.code === 'auth/invalid-email') {
        ToastAndroid.show('Địa chỉ email không hợp lệ', ToastAndroid.SHORT);
      } else {
        console.log(`Lỗi tạo tài khoản: ${err}`);
      }
    }
  };

  return (
    <Wrapper disableAvoidStatusBar={true}>
      <View style={styles.container}>
        {/* <Image
          style={styles.registerImage}
          // source={require('../img/logo.png')}
          /> */}
        <Text style={styles.welcomeText}>CHÀO MỪNG</Text>
        <Text style={styles.loginPrompt}>Đăng kí và trải nghiệm</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ tên"
          placeholderTextColor="#828282"
          value={fullname}
          onChangeText={value => setFullname(value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email "
          placeholderTextColor="#828282"
          value={email}
          onChangeText={value => setEmail(value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#828282"
          value={password}
          onChangeText={value => setPassword(value)}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#828282"
          value={rePassword}
          onChangeText={value => setRePassword(value)}
          secureTextEntry
        />

        <TouchableOpacity style={styles.registerButton} onPress={onRegister}>
          <Text style={styles.registerButtonText}>Đăng kí</Text>
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>
            Bạn đã có tài khoản?{' '}
            <Text
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}>
              Đăng nhập
            </Text>
          </Text>
        </View>
      </View>
    </Wrapper>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D5E8D4',
  },
  registerImage: {
    width: 400,
    height: 130,
    alignSelf: 'center',
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    color: '#1B5E20',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 20,
  },
  loginPrompt: {
    fontSize: 16,
    color: '#1B5E20',
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
    backgroundColor: '#fff',
    color: 'black',
    borderRadius: 8,
    borderColor: '#d3d3d3',
    elevation: 3,
    alignSelf: 'center',
  },
  registerButton: {
    alignSelf: 'center',
    width: 200,
    height: 46,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    elevation: 2,
    margin: 20,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  loginLinkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#388E3C',
    marginTop: 10,
    fontSize: 16,
  },
  loginLink: {
    color: '#2E7D32',
  },
});
