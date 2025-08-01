// components/Rektorat.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Abiturient = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Abiturient</Text>
            <Text style={styles.content}>
                This is the detail content for the "Abiturient" screen.
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

export default Abiturient;
