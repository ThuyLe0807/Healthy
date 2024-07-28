import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const [fullname, setFullname] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              await auth().signOut();
              navigation.navigate('Login');
              console.log('User signed out successfully');
            } catch (error) {
              console.error('Error signing out: ', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất, vui lòng thử lại.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const uid = currentUser.uid;
        console.log('User UID:', uid);
        try {
          const userDocument = await firestore().collection('users').doc(uid).get();
          if (userDocument.exists) {
            const userData = userDocument.data();
            console.log('User Data:', userData);
            setFullname(userData.fullname || 'No Fullname Found');
          } else {
            console.log('User document does not exist.');
            setFullname('No Fullname Found');
          }
        } catch (error) {
          console.log('Error fetching user data: ', error);
          Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
        }
      } else {
        console.log('No user is logged in.');
        Alert.alert('Thông báo', 'Bạn chưa đăng nhập.');
        navigation.navigate('Login');
      }
      setLoading(false);
    };

    fetchUserData();
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Icon name="account-circle" size={100} color="#000" style={styles.avatar} />
        <Text style={styles.fullname}>{fullname}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionItem} 
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Icon name="account-edit" size={25} color="#000" />
          <Text style={styles.optionText}>Edit profile information</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <Icon name="bell" size={25} color="#000" />
          <Text style={styles.optionText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <Icon2 name="language" size={25} color="#000" />
          <Text style={styles.optionText}>Language</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionItem} 
          onPress={handleLogout}
        >
          <Icon2 name="log-out" size={25} color="#000" />
          <Text style={styles.optionText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatar: {
    // Custom styling for the avatar icon
  },
  editAvatar: {
    position: 'absolute',
    top: 80,
    right: 10,
  },
  fullname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  optionsContainer: {
    width: '100%',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    borderColor: '#d3d3d3',
    borderWidth: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 20,
  },
});
