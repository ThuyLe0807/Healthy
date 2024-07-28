import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import PushNotification from 'react-native-push-notification';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { check, request, PERMISSIONS } from 'react-native-permissions';
import Share from 'react-native-share';

const AlarmScreen = () => {
  const [reminderText, setReminderText] = useState('');
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [editingAlarm, setEditingAlarm] = useState(null);

  const uid = auth().currentUser?.uid;

  useEffect(() => {
    if (uid) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(uid)
        .collection('alarms')
        .onSnapshot(querySnapshot => {
          const alarmsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAlarms(alarmsList);
        });
      return () => unsubscribe();
    }
  }, [uid]);

  const checkNotificationPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (result !== 'granted') {
      await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    }
  };

  const handleSetReminder = async () => {
    await checkNotificationPermission();

    const now = new Date();
    const reminderDate = new Date(reminderTime);

    if (reminderDate <= now) {
      reminderDate.setDate(now.getDate() + 1);
    }

    const notificationId = Math.random().toString(36).substring(7);

    PushNotification.localNotificationSchedule({
      id: notificationId,
      title: 'Reminder',
      message: `Reminder: ${reminderText}`,
      date: reminderDate,
      allowWhileIdle: true,
    });

    try {
      if (editingAlarm) {
        await firestore().collection('users').doc(uid).collection('alarms').doc(editingAlarm.id).update({
          reminderText,
          reminderTime: reminderDate,
          notificationId
        });
        setEditingAlarm(null);
      } else {
        await firestore().collection('users').doc(uid).collection('alarms').add({
          reminderText,
          reminderTime: reminderDate,
          notificationId
        });
      }
      Alert.alert('Reminder Set', `You will be reminded: ${reminderText} at ${reminderDate.toLocaleTimeString()}`);
    } catch (error) {
      console.error('Failed to set reminder:', error);
      Alert.alert('Error', 'Failed to set reminder');
    }

    setReminderText('');
    setReminderTime(new Date());
  };

  const handleDeleteReminder = async (id, notificationId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: async () => {
          try {
            await firestore().collection('users').doc(uid).collection('alarms').doc(id).delete();
            PushNotification.cancelLocalNotifications({ id: notificationId });
            Alert.alert('Reminder Deleted', 'The reminder has been deleted');
          } catch (error) {
            console.error('Failed to delete reminder:', error);
            Alert.alert('Error', 'Failed to delete reminder');
          }
        } },
      ],
      { cancelable: false }
    );
  };

  const handleEditReminder = (alarm) => {
    setEditingAlarm(alarm);
    setReminderText(alarm.reminderText);
    setReminderTime(new Date(alarm.reminderTime.toDate()));
    setShowPicker(true);
  };

  const handleShareReminder = (reminderText, reminderTime) => {
    Share.open({
      title: 'Share Reminder',
      message: `Reminder: ${reminderText} at ${reminderTime.toLocaleTimeString()}`,
    });
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || reminderTime;
    setShowPicker(Platform.OS === 'ios');
    setReminderTime(currentTime);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editingAlarm ? 'Edit Reminder' : 'Set a Reminder'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Reminder Text"
        value={reminderText}
        onChangeText={setReminderText}
      />
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timePicker}>
        <Text style={styles.timeText}>{reminderTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
      <Button title={editingAlarm ? "Update Reminder" : "Set Reminder"} onPress={handleSetReminder} />
      <View style={styles.alarmsContainer}>
        <Text style={styles.alarmsTitle}>Existing Alarms:</Text>
        {alarms.map(alarm => (
          <View key={alarm.id} style={styles.alarmItem}>
            <Text>{alarm.reminderText}</Text>
            <Text>{new Date(alarm.reminderTime.toDate()).toLocaleTimeString()}</Text>
            <View style={styles.alarmActions}>
              <Button title="Edit" onPress={() => handleEditReminder(alarm)} />
              <Button title="Delete" onPress={() => handleDeleteReminder(alarm.id, alarm.notificationId)} />
              <Button title="Share" onPress={() => handleShareReminder(alarm.reminderText, new Date(alarm.reminderTime.toDate()))} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  timePicker: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 18,
  },
  alarmsContainer: {
    marginTop: 20,
  },
  alarmsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alarmItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  alarmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default AlarmScreen;
