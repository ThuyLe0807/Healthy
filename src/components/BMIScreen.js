import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { LineChart } from 'react-native-chart-kit';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const BMIScreen = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalSleepTime, setTotalSleepTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sleepData, setSleepData] = useState([]);
  const navigation = useNavigation();

  const currentUser = auth().currentUser;
  const uid = currentUser ? currentUser.uid : null;

  const handleYogaPress = () => {
    navigation.navigate('YogaScreen');
  };

  const handleThienPress = () => {
    navigation.navigate('Thien');
  };

  const handleBMIPress = () => {
    navigation.navigate('Health');
  };

  const fetchSleepData = async () => {
    if (uid) {
      try {
        const snapshot = await firestore()
          .collection('users')
          .doc(uid)
          .collection('sleeps')
          .orderBy('createdAt', 'desc')
          .get();

        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));

        setSleepData(data);
      } catch (error) {
        console.error('Error fetching sleep data:', error);
      }
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, [uid]);

  const currentWeekData = sleepData.filter(item => {
    const createdAt = item.createdAt.toDate();
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
    return createdAt >= startOfCurrentWeek && createdAt <= endOfCurrentWeek;
  });

  const sleepTimeByDay = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  }).map(date => {
    const day = format(date, 'yyyy-MM-dd');
    const totalSleep = currentWeekData
      .filter(item => format(item.createdAt.toDate(), 'yyyy-MM-dd') === day)
      .reduce((sum, item) => sum + item.duration, 0);
    return { date: format(date, 'EEE'), totalSleep: totalSleep / 3600 };
  });

  const labels = sleepTimeByDay.map(item => item.date);
  const data = sleepTimeByDay.map(item => item.totalSleep);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedIsTracking = await AsyncStorage.getItem('isTracking');
        const savedStartTime = await AsyncStorage.getItem('startTime');
        const savedTotalSleepTime = await AsyncStorage.getItem('totalSleepTime');
        const savedCurrentTime = await AsyncStorage.getItem('currentTime');

        if (savedIsTracking === 'true') {
          setIsTracking(true);
          setStartTime(new Date(parseInt(savedStartTime, 10)));
        }

        setTotalSleepTime(parseInt(savedTotalSleepTime, 10) || 0);
        setCurrentTime(parseInt(savedCurrentTime, 10) || 0);
      } catch (error) {
        console.error('Failed to load state from AsyncStorage:', error);
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('isTracking', JSON.stringify(isTracking));
        if (isTracking && startTime) {
          await AsyncStorage.setItem('startTime', startTime.getTime().toString());
        }
        await AsyncStorage.setItem('totalSleepTime', totalSleepTime.toString());
        await AsyncStorage.setItem('currentTime', currentTime.toString());
      } catch (error) {
        console.error('Failed to save state to AsyncStorage:', error);
      }
    };

    saveState();
  }, [isTracking, startTime, totalSleepTime, currentTime]);

  useEffect(() => {
    let timer;
    if (isTracking) {
      timer = setInterval(() => {
        const now = new Date();
        setCurrentTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isTracking, startTime]);

  const handleStartStop = async () => {
    if (isTracking) {
      setIsTracking(false);
      setTotalSleepTime(prev => prev + currentTime);

      try {
        if (uid) {
          await firestore().collection('users').doc(uid).collection('sleeps').add({
            duration: currentTime,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

          await fetchSleepData();
        }
      } catch (error) {
        console.error('Error saving sleep duration to Firestore: ', error);
      }

      setCurrentTime(0);
    } else {
      setIsTracking(true);
      setStartTime(new Date());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#D5D7F2' }}>
      <View style={styles.rowContainer}>
        <TouchableOpacity style={styles.box} onPress={handleYogaPress}>
          <LinearGradient colors={['#8D92F2', '#D5D7F2']} style={styles.box}>
            <Text style={styles.boxText}>Yoga</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={handleBMIPress}>
          <LinearGradient colors={['#8D92F2', '#D5D7F2']} style={styles.box}>
            <Text style={styles.boxText}>BMI</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={handleThienPress}>
          <LinearGradient colors={['#8D92F2', '#D5D7F2']} style={styles.box}>
            <Text style={styles.boxText}>Thiền</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <ScrollView>
          <View style={styles.rowContainer}>
            <View style={styles.infoBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.infoText}>Bed time</Text>
                <Icon name='bed' size={30} color="#8D92F2" />
              </View>
              <Text style={styles.infoSubText}>{`${Math.floor(totalSleepTime / 3600)}H ${Math.floor((totalSleepTime % 3600) / 60)}Min`}</Text>

              <TouchableOpacity style={styles.button} onPress={handleStartStop}>
                <Text style={styles.buttonText}>{isTracking ? 'Stop' : 'Start'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.infoBox} onPress={() => navigation.navigate('Alarm')}>
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Icon name='alarm' size={60} color="#8D92F2" />
                <Text style={[styles.infoText, { marginTop: 5, fontSize: 16, color: '#000' }]}>Alarm</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 20 }}>Sleeping Time</Text>
            <LineChart
              data={{
                labels: labels,
                datasets: [
                  {
                    data: data,
                  },
                ],
              }}
              width={screenWidth - 40}
              height={260}
              yAxisLabel=""
              yAxisSuffix="h"
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#636AF2',
                backgroundGradientTo: '#D5D7F2',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
              }}
              bezier
              style={{
                marginVertical: 10,
                borderRadius: 16,
              }}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  box: {
    width: '30%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#8D92F2',
  },
  boxText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  infoBox: {
    width: '45%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F2F5',
    padding: 10,
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  infoSubText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8D92F2',
    marginTop: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#8D92F2',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default BMIScreen;
