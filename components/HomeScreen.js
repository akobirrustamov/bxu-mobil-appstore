import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import ApiCall from "../config/ApiCall";
import { useFocusEffect } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

const HomeScreen = ({ navigation }) => {
    const [role, setRole] = useState("");
    const [attendance, setAttendance] = useState(false);
    const [showNomenklatura, setShowNomenklatura] = useState(false);
    const [rector, setRector] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                await fetchRole();
                await fetchProfileData();
                const attendanceValue = await AsyncStorage.getItem("attendance");
                setRector(attendanceValue === "true"); // Convert string to boolean
            };

            fetchData();
        }, []) // Runs on every screen focus
    );

    const fetchRole = async () => {
        const storedRole = await AsyncStorage.getItem("role");
        setRole(storedRole || "");
    };

    const fetchProfileData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const role = await AsyncStorage.getItem("role");
            if (role === "ROLE_STAFF") {
                const response = await ApiCall("/api/v1/app/nomenklatura/me/" + token, "GET");
                if (response.status === 200 && response.data) {
                    if (response.data.length > 0) {
                        setShowNomenklatura(true);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    const cards = [
        { id: 1, title: "Taklif va shikoyatlarr", icon: "envelope", screen: "Taklif" },
    ];

    return (
        <View style={styles.container}>
            {/* Header with Background Image */}
            <ImageBackground
                source={require("../assets/bino.jpg")}
                style={styles.header}
                imageStyle={styles.headerImage}
            >
                <Image
                    source={require("../assets/logo.png")}
                    style={[styles.image, { width: windowWidth * 0.8 }]} // 80% of screen width
                    resizeMode="contain"
                />
                <Text style={styles.footerText}>
                    Buxoro psixologiya va xorijiy tillar instituti
                </Text>
            </ImageBackground>
            <ImageBackground
                source={require("../assets/newbg.jpg")}
                style={styles.myBg}
                resizeMode="repeat"
            >
                <ScrollView style={styles.cardsContainer}>
                    {role === "ROLE_STAFF" && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Topshiriq")} // Navigate to specific screen
                        >
                            <ImageBackground
                                source={require("../assets/bg21.jpg")} // Background image for each card
                                style={styles.card}
                                imageStyle={styles.cardBackgroundImage}
                            >
                                <FontAwesome
                                    name={"calendar"}
                                    size={40}
                                    color={"rgba(0,0,30,0.59)"}
                                />
                                <Text style={styles.cardText}>Topshiriqlar</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    )}
                    {role === "ROLE_STUDENT" && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Student")} // Navigate to specific screen
                        >
                            <ImageBackground
                                source={require("../assets/bg21.jpg")} // Background image for each card
                                style={styles.card}
                                imageStyle={styles.cardBackgroundImage}
                            >
                                <FontAwesome
                                    name={"graduation-cap"}
                                    size={40}
                                    color={"rgba(0,0,30,0.59)"}
                                />
                                <Text style={styles.cardText}>Talaba</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    )}

                    {(showNomenklatura || rector) && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Nomenklatura")} // Navigate to specific screen
                        >
                            <ImageBackground
                                source={require("../assets/bg21.jpg")} // Background image for each card
                                style={styles.card}
                                imageStyle={styles.cardBackgroundImage}
                            >
                                <FontAwesome
                                    name={"university"}
                                    size={40}
                                    color={"rgba(0,0,30,0.59)"}
                                />
                                <Text style={styles.cardText}>Nomenklatura</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    )}
                    {
                        rector&&
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Guruhlar")} // Navigate to specific screen
                            >
                                <ImageBackground
                                    source={require("../assets/bg21.jpg")} // Background image for each card
                                    style={styles.card}
                                    imageStyle={styles.cardBackgroundImage}
                                >
                                    <FontAwesome
                                        name={"graduation-cap"}
                                        size={40}
                                        color={"rgba(0,0,30,0.59)"}
                                    />
                                    <Text style={styles.cardText}>Guruhlar</Text>
                                </ImageBackground>
                            </TouchableOpacity>
                    }
                    {
                        rector&&
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Jadval")} // Navigate to specific screen
                        >
                            <ImageBackground
                                source={require("../assets/bg21.jpg")} // Background image for each card
                                style={styles.card}
                                imageStyle={styles.cardBackgroundImage}
                            >
                                <FontAwesome
                                    name={"graduation-cap"}
                                    size={40}
                                    color={"rgba(0,0,30,0.59)"}
                                />
                                <Text style={styles.cardText}>Dars Jadval</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    }
                    {cards.map((card) => (
                        <TouchableOpacity
                            key={card.id}
                            onPress={() => navigation.navigate(card.screen)} // Navigate to specific screen
                        >
                            <ImageBackground
                                source={require("../assets/bg21.jpg")} // Background image for each card
                                style={styles.card}
                                imageStyle={styles.cardBackgroundImage}
                            >
                                <FontAwesome
                                    name={card.icon}
                                    size={40}
                                    color={"rgba(0,0,30,0.59)"}
                                />
                                <Text style={styles.cardText}>{card.title}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        width: "100%",
        height: 210,
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: 0,
        zIndex: 10, // Ensures it stays on top
        backgroundColor: "rgba(0, 0, 0, 0.9)", // Adds the opacity to the image
    },
    headerImage: {
        opacity: 0.5, // Set image opacity to 50%
    },
    image: {
        height: 80, // Adjusted height for the logo
        marginBottom: 10,
    },
    footerText: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 20,
        color: "#fff", // White text for contrast
    },
    cardsContainer: {
        marginTop: 220, // Creates space below the fixed header
        paddingBottom: 20, // Padding to ensure cards don't get cut off
    },
    card: {
        height: 100, // Adjusted card height
        width: 280,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20, // Spacing between cards
        elevation: 5,
    },
    cardBackgroundImage: {
        borderRadius: 14,
    },
    cardText: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: "bold",
        color: "rgba(9,2,94,0.59)",
        textAlign: "center",
    },
    myBg: {
        alignItems: "center",
        paddingTop: 20,
        width: "100%",
        height: "100%", // Ensure it takes full height
    },
});