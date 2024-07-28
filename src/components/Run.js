import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import haversine from 'haversine';

const Run = () => {
  const [position, setPosition] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distanceTravelled, setDistanceTravelled] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const watchId = useRef(null);

  useEffect(() => {
    Geolocation.requestAuthorization('whenInUse');

    return () => {
      if (watchId.current) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const startRun = () => {
    setIsRunning(true);
    watchId.current = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newPosition = { latitude, longitude };
        setPosition(newPosition);
        if (routeCoordinates.length > 0) {
          const lastPosition = routeCoordinates[routeCoordinates.length - 1];
          setDistanceTravelled(
            distanceTravelled + haversine(lastPosition, newPosition, { unit: 'meter' })
          );
        }
        setRouteCoordinates([...routeCoordinates, newPosition]);
      },
      error => {
        console.log(error);
        Alert.alert('Error', 'Error getting your location');
      },
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
    );
  };

  const stopRun = () => {
    setIsRunning(false);
    if (watchId.current) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: position ? position.latitude : 37.78825,
          longitude: position ? position.longitude : -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        followUserLocation={true}
      >
        <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="blue" />
        {position && <Marker coordinate={position} />}
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Distance Travelled: {(distanceTravelled / 1000).toFixed(2)} km</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={isRunning ? stopRun : startRun}
        >
          <Text style={styles.buttonText}>{isRunning ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Run;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    color: 'black',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#8D92F2',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
