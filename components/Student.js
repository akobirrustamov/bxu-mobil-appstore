import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, Alert, ImageBackground, TouchableOpacity} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import ApiCall from "../config/ApiCall";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
const Student = (navigation) => {
    const [profileData, setProfileData] = useState(null);

    const [pdfUri, setPdfUri] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const role = await AsyncStorage.getItem("role");

                if (!token || !role) {
                    Alert.alert("Ogohlantirish", "Tizimga kirishdan oldin ro'yxatdan o'ting");
                    navigation.replace("Login"); // Redirect to Login screen
                    return;
                }

                if (role === "ROLE_STUDENT") {
                    const response = await ApiCall("/api/v1/app/student/account/" + token, "GET");
                    if (response.status === 200 && response.data) {
                        setProfileData(response.data);
                        setLoading(false)
                    } else {
                        Alert.alert("Error", "Failed to fetch profile data.");
                        navigation.replace("Login");
                    }
                }
            } catch (error) {
                Alert.alert("Error", error.message || "An error occurred.");
                navigation.replace("Login");
            }
        };

        fetchProfileData();
    }, [navigation]);



    const handleGetPayment = async () => {
        setLoading(true);
        const api_url = `https://qabul.buxpxti.uz/api/?jshir=${profileData?.passport_pin}&passport=${profileData.passport_number}`;
        const headers = {
            Authorization: 'Bearer 6d8f01f8c8f1e8f385415ee0894055f2',
        };
        try {
            // Fetch the PDF
            const response = await axios.get(api_url, {
                headers,
            });
            // const fileUri = `${FileSystem.documentDirectory}payment_contract.pdf`;
            //
            // await FileSystem.writeAsStringAsync(fileUri, response.data, {
            //     encoding: FileSystem.EncodingType.Base64,
            // });
            //
            // // Share or open the PDF
            // if (await Sharing.isAvailableAsync()) {
            //     await Sharing.shareAsync(fileUri);
            // } else {
            //     Alert.alert("Success", "PDF saved successfully!");
            // }
        } catch (error) {
            console.error("Error fetching the PDF:", error);
            Alert.alert("Error", "Failed to download the PDF. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleGenerateReference = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Error", "Token not found. Please log in again.");
                navigation.replace("Login");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            // Request the file details
            const response = await axios.get(
                'https://student.buxpxti.uz/rest/v1/student/reference',
                { headers }
            );

            const profileData = response.data?.data;
            if (profileData && profileData.length > 0) {
                const fileUrl = profileData[0].file;

                const fileName = `${FileSystem.documentDirectory}student_reference.pdf`;
                const downloadResponse = await FileSystem.downloadAsync(fileUrl, fileName, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(downloadResponse.uri);
                } else {
                    Alert.alert("Success", "File downloaded successfully!");
                }
            } else {
                Alert.alert("Error", "No reference data found.");
            }
        } catch (error) {
            console.error("Error generating reference:", error);
            Alert.alert("Error", "Failed to generate reference. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const handleGetContract = async () => {
        const response = await ApiCall(`/api/v1/app/student/contract/${profileData.passport_pin}/${profileData.level}`, "GET");
        console.log(response)
        if (response.status === 200 && response.data) {
            Alert.alert("Contract Data", JSON.stringify(response.data, null, 2));
        } else {
            Alert.alert("Error", "Failed to fetch contract data.");
        }
    };
    const handleGetPaper = async ()=>{
        console.log("hi i'm here")
    }
    const handleTimetable = async ()=>{
        console.log("it's for time table get from backend")
    }
    const handleDebt = async () =>{
        console.log("it's for debt")
    }
    const handleApplication = async() =>{
        console.log("application")
    }
    return (
        <View style={styles.container}>
            <ImageBackground   source={require("../assets/newbg.jpg")}
                               resizeMode={"repeat"}
                               style={styles.profileBg}>
                {profileData ? (
                    <View style={styles.servicesContainer}>
                        <TouchableOpacity style={styles.service} onPress={handleGenerateReference}>
                            <Text style={styles.serviceText}>Ma'lumotnoma</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.service}>
                            <Text style={styles.serviceText} onPress={handleGetPaper}>Chaqiruv qog'ozi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.service}>
                            <Text style={styles.serviceText} onPress={handleGetContract}>Kontrakt to'lovi</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.service}>
                            <Text style={styles.serviceText}  onPress={handleTimetable}>Dars jadvali</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.service} onPress={handleGetPayment}>
                            <Text style={styles.serviceText}>To'lov shartnoma</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.service}>
                            <Text style={styles.serviceText} onPress={handleDebt}>Fandan qarzdorlik</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.service}>
                            <Text style={styles.serviceText}  onPress={handleApplication}>Ariza qoldirish</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text>Loading profile data...</Text>
                )}
            </ImageBackground>
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
    profileBg: {
        flex: 1,
        justifyContent: "center", // Center content vertically
        alignItems: "center", // Center content horizontally
        width: "100%",
    },
    servicesContainer: {
        marginTop: 20,
        width: "90%",
        margin: "auto",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 30,
        height: "100%",
    },
    service: {
        width: 160,
        height: 80,
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
        fontSize: 14,
    },
});

export default Student;
