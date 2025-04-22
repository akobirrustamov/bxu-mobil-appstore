// DetailScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const DetailScreen = ({ route }) => {
    const { title } = route.params;

    return (
        <View style={styles.container}>

            <Text style={styles.detailText}>Detail for {title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    detailText: {
        fontSize: 24,
        fontWeight: "bold",
    },
});

export default DetailScreen;
