// PushNotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiCall from '../config/ApiCall'; // путь поправь под себя

export async function PushNotificationService() {
  let token;

  try {
    if (!Device.isDevice) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    token = (await Notifications.getExpoPushTokenAsync()).data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const jwt = await AsyncStorage.getItem('token');
    if (jwt && token) {
      await ApiCall('/api/v1/app/user/fcm-token', 'POST', { fcmToken: token }, jwt);
      console.log('jwt:',jwt , 'token:', token)
    }
  } catch (error) {
    console.log('Ошибка при отправке push token:', error);
  }
}
