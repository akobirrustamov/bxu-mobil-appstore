import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../../config/ApiCall";

const Topshiriq = () => {
    const navigation = useNavigation();
    const [rank, setRank] = useState([]);
    const [administrator, setAdministrator] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [commander, setCommander] = useState([])
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const role = await AsyncStorage.getItem("role");

                if (!token || !role) {
                    navigation.navigate("Login");
                    return;
                }

                if (role === "ROLE_STAFF") {
                    const response = await ApiCall("/api/v1/app/staff/me/" + token, "GET");
                    if (response.status === 200 && response.data) {
                        setAdministrator(response.data);
                    } else {
                        Alert.alert("Error", "Failed to fetch profile data.");
                        navigation.navigate("Login");
                    }

                    const res = await ApiCall("/api/v1/app/staff/rank/" + token, "GET");
                    if (res.status === 200 && res.data) {
                        setRank(res.data);
                    } else {
                        Alert.alert("Error", "Failed to fetch rank data.");
                        navigation.navigate("Login");
                    }
                    const com = await ApiCall("/api/v1/app/staff/commander/" + token, "GET");
                    if (com.status === 200 && com.data) {
                        setCommander(com.data);
                        console.log(com.data)
                    } else {
                        Alert.alert("Error", "Failed to fetch rank data.");
                    }
                } else {
                    navigation.navigate("Login");
                }
            } catch (error) {
                Alert.alert("Error", error.message || "An error occurred.");
                navigation.navigate("Login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [navigation]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.centered}>
            <ImageBackground source={require("../../assets/newbg.jpg")} resizeMode="repeat" style={styles.profileBg}>
                {rank[0]?.name !== "Rektor"   && (
                    <TouchableOpacity style={styles.card1} onPress={() => navigation.navigate("Topshiriqlar")}>
                        <ImageBackground
                            source={require("../../assets/bg21.jpg")}
                            style={styles.card}
                            imageStyle={styles.cardBackgroundImage}
                        >
                            <FontAwesome name="calendar" size={40} color="rgba(0,0,30,0.59)" />
                            <Text style={styles.cardText}>Mening topshiriqlarim</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                )}

                {commander.length > 0 && (
                    <>
                        <TouchableOpacity style={styles.card1} onPress={() => navigation.navigate("Buyruqlar")}>
                            <ImageBackground
                                source={require("../../assets/bg21.jpg")}
                                style={styles.card}
                                imageStyle={styles.cardBackgroundImage}
                            >
                                <FontAwesome name="area-chart" size={40} color="rgba(0,0,30,0.59)" />
                                <Text style={styles.cardText}>Buyruqlar</Text>
                            </ImageBackground>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card1} onPress={() => navigation.navigate("Xodimlar")}>
                            <ImageBackground
                                source={require("../../assets/bg21.jpg")}
                                style={styles.card}
                                imageStyle={styles.cardBackgroundImage}
                            >
                                <FontAwesome name="user-o" size={40} color="rgba(0,0,30,0.59)" />
                                <Text style={styles.cardText}>Xodimlar</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    </>
                )}



            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: "center",
    },
    profileBg: {
        width: "100%",
        flex: 1,
        alignItems: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    card1: {
        marginTop: 20,
    },
    card: {
        height: 100,
        width: 300,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 0,
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
});

export default Topshiriq;
