// components/NotificationHistory.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const NotificationHistory = () => {
  return (
    <View style={styles.container}>
      <Text>📬 Bu yerda xabarnomalar tarixi bo'ladi</Text>
    </View>
  );
};

export default NotificationHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
