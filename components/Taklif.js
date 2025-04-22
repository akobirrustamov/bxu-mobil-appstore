// components/Taklif.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Taklif = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Taklif va Shikoyat</Text>
            <Text style={styles.content}>
                This is the detail content for the "Taklif va Shikoyat" screen.
            </Text>
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        textAlign: "center",
        padding: 20,
    },
});

export default Taklif;
