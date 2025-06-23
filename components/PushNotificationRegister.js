import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// ✅ Показывать уведомления, даже когда приложение активно
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // показывать баннер
    shouldPlaySound: true,     // воспроизводить звук
    shouldSetBadge: false,     // не трогать бейдж на иконке
  }),
});

export default function PushNotificationRegister() {
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('📬 Push Token:', token);
        Alert.alert('Push Token получен', token);
      }
    });

    // ✅ Подписка на событие получения уведомления
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📩 Получено уведомление:', notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Разрешение не получено');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ Token:', token);
  } else {
    Alert.alert('Push не поддерживается на эмуляторе');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX, // 🎯 MAX = показывать всегда
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
