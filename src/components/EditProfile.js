import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DatePicker from 'react-native-datepicker';

const EditProfile = () => {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [genre, setGenre] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [birthday, setBirthday] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth().currentUser;
            if (currentUser) {
                const uid = currentUser.uid;
                try {
                    const userDocument = await firestore().collection('users').doc(uid).get();
                    if (userDocument.exists) {
                        const userData = userDocument.data();
                        setFullname(userData.fullname || '');
                        setEmail(userData.email || '');
                        setGenre(userData.genre || '');
                        setWeight(userData.weight || '');
                        setHeight(userData.height || '');
                        setBirthday(userData.birthday || '');
                    } else {
                        console.log('User document does not exist.');
                    }
                } catch (error) {
                    console.log('Error fetching user data: ', error);
                }
            } else {
                console.log('No user is logged in.');
            }
        };

        fetchUserData();
    }, []);

    const handleDateChange = (date) => {
        setBirthday(date);
    };

    const handleSubmit = async () => {
        if (!fullname || !email || !genre || !weight || !height || !birthday) {
            Alert.alert('Validation Error', 'Please fill out all fields.');
            return;
        }

        // Simple email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            Alert.alert('Validation Error', 'Please enter a valid email address.');
            return;
        }

        const currentUser = auth().currentUser;
        if (currentUser) {
            const uid = currentUser.uid;
            try {
                await firestore().collection('users').doc(uid).update({
                    fullname,
                    email,
                    genre,
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    birthday,
                });
                Alert.alert('Success', 'User information updated successfully');
                navigation.goBack();
            } catch (error) {
                console.log('Error updating user information: ', error);
                Alert.alert('Error', 'Failed to update user information.');
            }
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Header title={'Edit Profile'} />
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Full Name'
                        value={fullname}
                        onChangeText={setFullname}
                    />
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Email'
                        value={email}
                        onChangeText={setEmail}
                        keyboardType='email-address'
                    />
                    <Text style={styles.label}>Giới tính</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Genre'
                        value={genre}
                        onChangeText={setGenre}
                    />
                    <View style={styles.rowContainer}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Cân nặng {'(kg)'}</Text>
                            <TextInput
                                style={[styles.input, styles.smallInput]}
                                placeholder="kg"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType='numeric'
                            />
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Chiều cao {'(cm)'}</Text>
                            <TextInput
                                style={[styles.input, styles.smallInput]}
                                placeholder="cm"
                                value={height}
                                onChangeText={setHeight}
                                keyboardType='numeric'
                            />
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Sinh nhật</Text>
                            <DatePicker
                                style={[styles.input, styles.smallInput]}
                                date={birthday}
                                mode="date"
                                placeholder="Select date"
                                format="YYYY-MM-DD"
                                minDate="1900-01-01"
                                maxDate="2100-12-31"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                onDateChange={handleDateChange}
                                customStyles={{
                                    dateInput: {
                                        borderWidth: 0,
                                    },
                                }}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Lưu</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
    },
    formContainer: {
        padding: 20,
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        padding: 10,
        backgroundColor: '#D5D7F2',
        borderRadius: 8,
        borderColor: '#d3d3d3',
        marginBottom: 16,
    },
    smallInput: {
        width: '100%',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    column: {
        flex: 1,
        marginHorizontal: 5,
    },
    submitButton: {
        height: 48,
        backgroundColor: '#8D92F2',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default EditProfile;
