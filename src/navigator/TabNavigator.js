import {StyleSheet} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from '../components/HomeScreen';
import {BlurView} from '@react-native-community/blur';
import YogaAndBMI from '../components/YogaAndBMI';
import Profile from '../components/Profile';
import Run from '../components/Run';
import HealthyScreen from '../components/HealthyScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarBackground: () => (
          <BlurView
            overlayColor=""
            blurAmount={15}
            style={styles.BlurViewStyles}
          />
        ),
        tabBarIconStyle: { tintColor: '' },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <Icon name="home-outline" size={size} color={focused ? '#636AF2' : '#8B8787'} />
          ),
        }} />

      <Tab.Screen
        name="Health"
        component={HealthyScreen}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <IconM name="heartbeat" size={size} color={focused ? '#636AF2' : '#8B8787'} />
          ),
        }} />

      <Tab.Screen
        name="YogaAndBMI"
        component={YogaAndBMI}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <IconM name="yoga" size={size} color={focused ? '#636AF2' : '#8B8787'} />
          ),
        }} />

      <Tab.Screen
        name="Run"
        component={Run}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <Icon name="run-outline" size={size} color={focused ? '#636AF2' : '#8B8787'} />
          ),
        }} />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <Icon name="person-outline" size={size} color={focused ? '#636AF2' : '#8B8787'} />
          ),
        }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 80,
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    borderTopColor: 'transparent',
    backgroundColor: 'transparent',
    elevation: 0.2
  },
  BlurViewStyles: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
});
