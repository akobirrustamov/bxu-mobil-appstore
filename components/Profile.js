import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ImageBackground, TouchableOpacity, Image, Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../config/ApiCall";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';

const Profile = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [administrator, setAdministrator] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(300))[0];

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const role = await AsyncStorage.getItem("role");
                if (!token || !role) {
                    navigation.replace("Login");
                    return;
                }
                if (role === "ROLE_STUDENT") {
                    const response = await ApiCall("/api/v1/app/student/account/" + token, "GET");
                    if (response.status === 200 && response.data) {
                        setProfileData(response.data);
                        animateIn();
                    } else {
                        Alert.alert("Error", "Failed to fetch profile data.");
                        navigation.replace("Login");
                    }
                }
            } catch (error) {
                navigation.replace("Login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [navigation]);

    const animateIn = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 30,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            navigation.replace("Login");
        } catch (error) {
            Alert.alert("Error", "Failed to log out. Please try again.");
        }
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    return (
        <ImageBackground
            source={require("../assets/newbg.jpg")}
            resizeMode="cover"
            style={styles.profileBg}
            blurRadius={2}
        >
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Animatable.Text
                        animation="pulse"
                        easing="ease-out"
                        iterationCount="infinite"
                        style={styles.loadingText}
                    >
                        Loading profile data...
                    </Animatable.Text>
                </View>
            ) : (
                <Animated.View
                    style={[
                        styles.container,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {profileData && (
                        <View style={styles.profileCard}>
                            <View style={styles.header}>
                                <Image
                                    style={styles.profileImage}
                                    source={{ uri: profileData?.image || 'https://via.placeholder.com/150' }}
                                />
                                <Text style={styles.nameText}>
                                    {profileData?.second_name} {profileData?.first_name}
                                </Text>
                                <Text style={styles.roleText}>Talaba</Text>
                            </View>

                            {/*<TouchableOpacity*/}
                            {/*    style={[styles.button, showDetails && styles.buttonActive]}*/}
                            {/*    onPress={toggleDetails}*/}
                            {/*    activeOpacity={0.7}*/}
                            {/*>*/}
                            {/*    <MaterialIcons*/}
                            {/*        name={showDetails ? "keyboard-arrow-up" : "keyboard-arrow-down"}*/}
                            {/*        size={24}*/}
                            {/*        color="#fff"*/}
                            {/*    />*/}
                            {/*    <Text style={styles.buttonText}>Personal Information</Text>*/}
                            {/*</TouchableOpacity>*/}


                                <Animatable.View
                                    animation="fadeInUp"
                                    duration={500}
                                    style={styles.detailsBox}
                                >
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="location-on" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Manzil:</Text> {profileData.address || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="person" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Jinsi:</Text> {profileData.gender || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="phone" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Telefon:</Text> {profileData.phone || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="school" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Fakultet:</Text> {profileData.faculty || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="class" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Yo'nalish:</Text> {profileData.specialty || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="book" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Kurs:</Text> {profileData.level || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="group" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Guruh:</Text> {profileData.group_name || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="payment" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>To'lov turi:</Text> {profileData.paymentForm || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="school" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Ta'lim shakli:</Text> {profileData.educationForm || 'Mavjud emas'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="info" size={18} color="#4CAF50" />
                                        <Text style={styles.detailItem}><Text style={styles.label}>Status:</Text> {profileData.studentStatus || 'Mavjud emas'}</Text>
                                    </View>
                                </Animatable.View>


                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                                activeOpacity={0.7}
                            >
                                <FontAwesome name="sign-out" size={18} color="#fff" />
                                <Text style={styles.logoutButtonText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {administrator && (
                        <View style={styles.profileCard}>
                            <View style={styles.header}>
                                <View style={styles.adminIconContainer}>
                                    <FontAwesome
                                        name="user-circle"
                                        size={80}
                                        color="#fff"
                                    />
                                </View>
                                <Text style={styles.nameText}>
                                    {administrator.name}
                                </Text>
                                <Text style={styles.roleText}>Administrator</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigation.navigate("EditProfile")}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="edit" size={18} color="#fff" />
                                <Text style={styles.buttonText}>Edit Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                                activeOpacity={0.7}
                            >
                                <FontAwesome name="sign-out" size={18} color="#fff" />
                                <Text style={styles.logoutButtonText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    profileBg: {
        flex: 1,
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 15,
    },
    nameText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    roleText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        marginTop: 5,
    },
    button: {
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonActive: {
        backgroundColor: 'rgba(76, 175, 80, 1)',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    detailsBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        padding: 20,
        marginTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailItem: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
    },
    label: {
        fontWeight: 'bold',
        color: '#555',
    },
    logoutButton: {
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    adminIconContainer: {
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
});

export default Profile;