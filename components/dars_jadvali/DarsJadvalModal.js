import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
} from "react-native";
import ApiCallBuxpxti from "../../config/ApiCallBuxpxti"; // Adjust the import path as necessary

const DarsJadvaliModal = ({ navigation }) => {
    const [lessons, setLessons] = useState([]);

    // Function to handle button clicks
    const handleButtonClick = (type) => {
        if (type === "daily") {

            navigation.navigate("KunlikJadval"); // Navigate to daily schedule
        } else if (type === "weekly") {
            navigation.navigate("GuruhJadval"); // Navigate to weekly schedule
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../../assets/bg21.jpg")}
                style={styles.myBg}
                resizeMode="repeat"
            >
                <View style={styles.buttonContainer}>
                    {/* Kunlik Dars Jadval Button */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleButtonClick("daily")}
                    >
                        <Text style={styles.buttonText}>Kunlik Dars Jadvali</Text>
                    </TouchableOpacity>

                    {/* Haftalik Dars Jadval Button */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleButtonClick("weekly")}
                    >
                        <Text style={styles.buttonText}>Guruhlar Dars Jadvali</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
};

export default DarsJadvaliModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    myBg: {
        flex: 1,
        width: Dimensions.get("window").width,
        justifyContent: "center", // Center the buttons vertically
        alignItems: "center", // Center the buttons horizontally
    },
    buttonContainer: {
        width: "80%", // Set the width of the button container
    },
    button: {
        backgroundColor: "#007bff", // Button background color
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff", // Button text color
    },
});