import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ImageBackground, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../config/ApiCall";
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome icons

const Profile = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [administrator, setAdministrator] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const role = await AsyncStorage.getItem("role");
                if (!token || !role) {
                    navigation.replace("Login"); // Redirect to Login screen
                    return;
                }
                if (role === "ROLE_STUDENT") {
                    const response = await ApiCall("/api/v1/app/student/account/" + token, "GET");
                    if (response.status === 200 && response.data) {
                        setProfileData(response.data); // Update the profile data state
                    } else {
                        Alert.alert("Error", "Failed to fetch profile data.");
                        navigation.replace("Login"); // Redirect to Login screen
                    }
                }
                if (role === "ROLE_ADMINISTRATOR") {
                    const response = await ApiCall("/api/v1/app/rector/account/" + token, "GET");
                    if (response.status === 200 && response.data) {
                        setAdministrator(response.data);
                    } else {
                        // Alert.alert("Error", "Failed to fetch profile data.");
                        navigation.replace("Login");
                    }
                }
                if(role==="ROLE_STAFF"){
                    navigation.replace("StaffProfile");
                }
            } catch (error) {
                // Alert.alert("Error", error.message || "An error occurred.");
                navigation.replace("Login");
            } finally {
                setIsLoading(false); // Set loading to false after data fetching
            }
        };

        fetchProfileData();
    }, [navigation]);

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear(); // Clear all stored data
            navigation.replace("Login"); // Redirect to Login screen
        } catch (error) {
            Alert.alert("Error", "Failed to log out. Please try again.");
        }
    };
    return (
        <View style={styles.centered}>
            <ImageBackground source={require("../assets/newbg.jpg")} resizeMode="repeat" style={styles.profileBg}>
                {isLoading ? (
                    <Text>Loading profile data...</Text>
                ) : (
                    <>
                        {profileData && (<View>
                            <View style={styles.profileContainer}>
                                <Image
                                    style={styles.tinyLogo}
                                    source={{
                                        uri: profileData?.image,
                                    }}
                                />
                                <Text style={styles.nameText}>
                                    {profileData?.second_name} {profileData?.first_name}
                                </Text>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => navigation.navigate("EditProfile")} // Navigate to edit profile page
                                >
                                    <Text style={styles.buttonText}>Shaxsiy ma'lumotlar</Text>
                                </TouchableOpacity>

                                {/* Logout Button */}
                                <TouchableOpacity
                                    style={styles.buttonLogOut}
                                    onPress={handleLogout} // Call the logout function
                                >
                                    <FontAwesome name="sign-out" size={18} color="#fff" style={{ marginRight: 10 }} />
                                    <Text style={styles.buttonText}>Tizimdan chiqish</Text>
                                </TouchableOpacity>
                            </View>
                        </View>)}
                        {administrator && (<View>
                            <View style={styles.profileContainer}>
                                <FontAwesome
                                    name="user-circle"
                                    size={60}
                                    color="#fff"
                                    style={styles.adminIcon}
                                />
                                <Text style={styles.nameText}>
                                    {administrator.name}
                                </Text>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => navigation.navigate("EditProfile")} // Navigate to edit profile page
                                >
                                    <Text style={styles.buttonText}>Nominklatura bo'yicha masul</Text>
                                </TouchableOpacity>

                                {/* Logout Button */}
                                <TouchableOpacity
                                    style={styles.buttonLogOut}
                                    onPress={handleLogout} // Call the logout function
                                >
                                    <FontAwesome name="sign-out" size={18} color="#fff" style={{ marginRight: 10 }} />
                                    <Text style={styles.buttonText}>Tizimdan chiqish</Text>
                                </TouchableOpacity>
                            </View>
                        </View>)}
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
        width:"100%",
        flex: 1,
        alignItems: "center",
    },
    profileContainer: {
        marginTop: 65,
        width: "90%",
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background to improve text readability
        padding: 15,
        borderRadius: 10,
    },
    nameText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        marginTop: 10,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#4CAF50", // Green background for the button
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
        alignItems: "center",
        flexDirection: "row", // Align icon and text horizontally
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 5,
    },
    tinyLogo: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginTop: -60,
        borderWidth: 2,
        margin: "auto",
        borderColor: "rgba(0, 0, 0, 0.7)",
    },
    buttonLogOut: {
        marginTop: 10,
        backgroundColor: "#3c673d", // Green background for the button
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: "center",
        flexDirection: "row", // Align icon and text horizontally
    },
    adminIcon: {
        width:200,
        justifyContent: "center",
        // margin:"auto",
    },

});

export default Profile;
