import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert, ActivityIndicator} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../../../config/ApiCall";

const Topshiriqlar = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [statistic, setStatistic] = useState(null);



    useEffect(() => {
        getMyCommands();
    }, []);

    const getMyCommands = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await ApiCall(`/api/v1/app/staff/commands/topshiriq/statistic/${token}`, "GET");
            if (response.status === 200 && response.data) {
                setStatistic(response.data);
            } else {
                Alert.alert("Error", "Failed to fetch commands.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6200EE" />
            </View>
        );
    }
    return (
        <View style={styles.centered}>
            <ImageBackground source={require("../../../assets/newbg.jpg")} resizeMode="repeat" style={styles.profileBg}>
                <View style={styles.servicesContainer}>
                    <TouchableOpacity
                        style={styles.service}
                        onPress={() => {
                            navigation.navigate("Yangi topshiriqlar");
                        }}
                    >
                        <FontAwesome name={"inbox"} size={40} color={"white"} />
                        <Text style={styles.span}>{statistic?.newCommandsCount || 0}</Text>

                        <Text style={styles.serviceText}>Yangi topshiriq</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.service}
                        onPress={() => navigation.navigate("Jarayondagi topshiriqlar")}
                    >
                        <FontAwesome name={"area-chart"} size={40} color={"white"} />
                        <Text style={styles.span}>{statistic?.inProgressCommandsCount || 0}</Text>

                        <Text style={styles.serviceText}>Jarayonda</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.service}
                        onPress={() => navigation.navigate("Kutilayotgan topshiriqlar")}
                    >
                        <FontAwesome name={"handshake-o"} size={40} color={"white"} />
                        <Text style={styles.span}>{statistic?.pendingCommandsCount || 0}</Text>

                        <Text style={styles.serviceText}>Kutilmoqda</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.service}
                        onPress={() => navigation.navigate("Tugallangan topshiriqlar")}
                    >
                        <FontAwesome name={"check"} size={40} color={"white"} />
                        <Text style={styles.span}>{statistic?.completedCommandsCount || 0}</Text>

                        <Text style={styles.serviceText}>Bajarilgan</Text>
                    </TouchableOpacity>
                </View>
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
    servicesContainer: {
        marginTop: 20,
        width: "90%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        height: "100%",
    },
    service: {
        width: 140,
        height: 115,
        marginVertical: 10,
        borderRadius: 10,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    serviceText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
        margin: 5,
    },
    span: {
        marginTop: 5,
        backgroundColor: "#FF5722",
        color: "white",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default Topshiriqlar;
