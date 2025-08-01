import React, {useCallback, useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ImageBackground,
    TouchableOpacity,
    Image,
    TextInput,
    Button,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../config/ApiCall";
import { FontAwesome } from "@expo/vector-icons";
import { BASE_URL } from "../config/ApiCall";
import * as DocumentPicker from "expo-document-picker";
import {useFocusEffect, useNavigation} from "@react-navigation/native"; // Import FontAwesome icons
const StaffProfile = ({ navigation }) => {
    const [fileUri, setFileUri] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [rank, setRank] = useState([]);
    const [administrator, setAdministrator] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [showPoneInput, setShowPhoneInput] = useState(false)
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("+998");
    const [reenteredPassword, setReenteredPassword] = useState("");
    const [imageUploadInProgress, setImageUploadInProgress] = useState(false); // To prevent multiple uploads at once
    const navi = useNavigation()






    useEffect(() => {
        fetchProfileData();
        // if (administrator?.telegramId && isValidPhoneNumber(administrator.telegramId)) {
        //     setShowPhoneInput(true);
        // }
    }, []); // administrator o'zgarganda qayta tekshiriladi



    const fetchProfileData = async () => {
        let timeoutId; // Variable to store the timeout ID

        try {
            const token = await AsyncStorage.getItem("token");
            const role = await AsyncStorage.getItem("role");

            if (!token || !role) {
                navigation.replace("Login");
                return;
            }

            // Set a timeout for 10 seconds
            timeoutId = setTimeout(async () => {
                // If the timeout is triggered, clear the token and navigate to login
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("role");
                navigation.replace("Login");
            }, 10000); // 10 seconds

            if (role === "ROLE_STAFF") {
                const response = await ApiCall("/api/v1/app/staff/me/" + token, "GET");
                if (response.status === 200 && response.data) {
                    setAdministrator(response.data);
                } else {
                    navigation.replace("Login");
                }

                const res = await ApiCall("/api/v1/app/staff/rank/" + token, "GET");
                if (res.status === 200 && res.data) {
                    setRank(res.data);
                    const hasRelevantRank = res.data.some((item) => item.id === 1 || item.id === 2);
                    await AsyncStorage.setItem("attendance", hasRelevantRank ? "true" : "false");
                } else {
                    navigation.replace("Login");
                }
            } else {
                navigation.replace("Login");
            }
        } catch (error) {
            navigation.replace("Login");
        } finally {
            setIsLoading(false);
            clearTimeout(timeoutId); // Clear the timeout if the API call completes successfully
        }
    };

    const handleLogout = async () => {
        try {
            if(administrator.telegramId.length!==13){
                Alert.alert("Xatolik", "Telegram mavjud bo'lgan telefon raqamingizni kiriting!")
                setShowPhoneInput(true)
                return;
            }

            await AsyncStorage.clear();
            navigation.replace("Login");
        } catch (error) {
            Alert.alert("Error", "Failed to log out. Please try again.");
        }
    };

    const handleSubmit = async () => {
        if (password !== reenteredPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            const response = await ApiCall(`/api/v1/app/staff/password/${token}`, "POST", password);
            if (response.status === 200) {
                Alert.alert("Success", "Password changed successfully.");
                setPassword("");
                setReenteredPassword("");
                setShow(false);
                fetchProfileData();
            } else {
                Alert.alert("Error", "Failed to change password.");
            }
        } catch (error) {
            Alert.alert("Error", error.message || "An error occurred.");
        }
    };
    const isValidPhoneNumber = (phone) => /^\+998\d{9}$/.test(phone);

    const handleSubmitPhoneNumber = async () => {
        if (!isValidPhoneNumber(phone)) {
            Alert.alert("Error", "Telefon raqam noto'g'ri kiritildi.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            const response = await ApiCall(`/api/v1/app/staff/phone/${token}`, "POST", { phone });
            if (response.status === 200) {
                Alert.alert("Success", "Telefon raqam muvaffaqiyatli saqlandi.");
                setPhone("+998");
                setShowPhoneInput(false);
                fetchProfileData();
            } else {
                Alert.alert("Error", "Telefon raqamni saqlashda xatolik yuz berdi.");
            }
        } catch (error) {
            Alert.alert("Error", error.message || "Noma'lum xatolik yuz berdi.");
        }
    };


    const handleDocumentPick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "image/*", // Restrict to images (png, jpg, jpeg)
            });
            // Check if the user canceled the selection
            if (result.canceled) return;
            const uri = result.assets[0].uri
            const name = result.assets[0].name
            // Validate that both uri and name are available
            if (!uri || !name) {
                Alert.alert("Error", "Selected file is invalid.");
                return;
            }
            const validExtensions = ["png", "jpg", "jpeg"];
            const fileExtension = name.split(".").pop().toLowerCase();
            if (!validExtensions.includes(fileExtension)) {
                Alert.alert("Invalid File", "Please select a PNG, JPG, or JPEG image.");
                return;
            }
            setFileUri(uri);
            setFileName(name);
        } catch (error) {
            Alert.alert("Error", "An error occurred while selecting the file.");
        }
    };
    const handleFileUpload = async () => {
        if (imageUploadInProgress) return;
        setImageUploadInProgress(true);
        try {
            if (!fileUri || !fileName) {
                Alert.alert("Error", "Please select a file first.");
                return;
            }
            const formData = new FormData();
            formData.append("photo", {
                uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
                name: fileName,
                type: "application/pdf",
            });
            formData.append("prefix", `/command/staff`);
            const response = await ApiCall(`/api/v1/file/upload`, "POST", formData, {
                "Content-Type": "multipart/form-data",
            });
            if (response.status === 200 && response.data) {
                const fileUUID = response.data; // Assuming 'id' is the UUID returned from the server
                await handleProfileImageUpdate(fileUUID); // Send UUID to update profile image
            } else {
                Alert.alert("Error", "Failed to upload file.");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred during file upload.");
        } finally {
            setImageUploadInProgress(false);
        }
    };

    const handleProfileImageUpdate = async (uuid) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await ApiCall(`/api/v1/app/staff/setPhoto/${token}`, "PUT", { uuid });
            if (response.status === 200) {
                Alert.alert("Success", "Profil rasmi muvaffaqiyatli o'zgartirildi.");
                fetchProfileData()
                setFileUri(null); // Reset the file URI after successful upload
                setFileName(null); // Reset the file name
            } else {
                Alert.alert("Error", "Failed to update profile image.");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred while updating profile image.");
        }
    };




    // const getFcmToken = async () => {
    //     const token = await AsyncStorage.getItem("token");
    //
    //     try {
    //         // Request permission to send notifications
    //         await messaging().requestPermission();
    //
    //         // Get the device's FCM token
    //         const fcmToken = await messaging().getToken();
    //         console.log('FCM Token:', fcmToken);
    //
    //         if (fcmToken) {
    //             // Send the token to your backend to store it
    //             const response = await ApiCall(`/api/v1/app/staff/update-fcm-token/${token}`, 'POST', {
    //                 token: fcmToken,
    //             });
    //
    //             if (response.status === 200) {
    //                 console.log('FCM token successfully sent to the backend');
    //             } else {
    //                 console.error('Failed to send FCM token to the backend');
    //             }
    //         } else {
    //             console.error('Failed to get FCM token');
    //         }
    //     } catch (error) {
    //         console.error('Error getting FCM token:', error);
    //     }
    // };




    return (
        <View style={styles.centered}>
            <ImageBackground source={require("../assets/newbg.jpg")} resizeMode="repeat" style={styles.profileBg}>
                {isLoading ? (
                    <Text>Loading profile data...</Text>
                ) : (
                    <>
                        {administrator && (
                            <View>
                                <View style={styles.profileContainer}>
                                    {administrator.file ? (
                                        <TouchableOpacity onPress={handleDocumentPick}>
                                            <Image
                                                style={styles.tinyLogo}
                                                source={{ uri: `${BASE_URL}/api/v1/file/getFile/${administrator.file.id}` }}
                                            />
                                        </TouchableOpacity>

                                    ) : (
                                        <FontAwesome onProgress={handleDocumentPick} name="user-circle" size={60} color="#fff" style={styles.adminIcon} />
                                    )}


                                    <Text style={styles.nameText}>{administrator.name}</Text>
                                    {rank.map((item, index) => (
                                        <TouchableOpacity key={index} style={styles.button}>
                                            <FontAwesome name="user" size={18} color="#fff" style={{ marginRight: 10 }} />

                                            <Text style={styles.buttonText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    <TouchableOpacity style={styles.buttonProfil} onPress={() => setShow(!show)}>
                                        <View style={styles.myRow}>
                                        <FontAwesome name="lock" size={18} color="#fff" style={{ marginRight: 10 }} />
                                        <Text style={styles.buttonText}>Parolni almashtirish</Text>
                                        </View>
                                        <FontAwesome name="pencil" size={18} color="#fff" style={{ marginRight: 10 }} />

                                    </TouchableOpacity>
                                    {show && (
                                        <View>
                                            <Text style={styles.label}> Yangi parol kiriting</Text>
                                            <TextInput
                                                placeholder="Yangi parol"
                                                secureTextEntry
                                                style={styles.input}
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                            <Text style={styles.label}> Parolni takrorlang</Text>

                                            <TextInput
                                                placeholder="Parolni qayta kiriting"
                                                secureTextEntry
                                                style={styles.input}
                                                value={reenteredPassword}
                                                onChangeText={setReenteredPassword}
                                            />
                                            <Button style={{ width: "50%" }} title="Saqlash" onPress={handleSubmit} />
                                        </View>
                                    )}



                                    {/* Image selection and upload */}
                                    <TouchableOpacity style={styles.buttonProfil} onPress={handleDocumentPick}>
                                        <View style={styles.myRow}>
                                            <FontAwesome name="camera" size={18} color="#fff" style={{ marginRight: 10 }} />
                                            <Text style={styles.buttonText}>Profil rasmini tanlash</Text>
                                        </View>

                                        <FontAwesome name="pencil" size={18} color="#fff" style={{ marginRight: 10 }} />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.buttonProfil} onPress={()=>setShowPhoneInput(!showPoneInput)}>
                                        <View style={styles.myRow}>
                                        <FontAwesome name="phone" size={18} color="#fff" style={{ marginRight: 10 }} />
                                        <Text style={styles.buttonText}>{administrator.telegramId==="0"?"Telefon raqamingizni kirirting":administrator.telegramId}</Text>
                                        </View>
                                        <FontAwesome name="pencil" size={18} color="#fff" style={{ marginRight: 10 }} />


                                    </TouchableOpacity>

                                    {showPoneInput && (
                                        <View>
                                            <Text style={styles.label}>Yangi telefon raqamini kiriting</Text>
                                            <TextInput
                                                placeholder="Telefon raqami"
                                                keyboardType="phone-pad"
                                                style={styles.input}
                                                value={phone}
                                                onChangeText={setPhone}
                                            />

                                            <Button style={{ width: "50%" }} title="Saqlash" onPress={handleSubmitPhoneNumber} />
                                        </View>
                                    )}


                                    {fileUri && (
                                        <View>
                                            <Text style={styles.label}>Yuklangan fayl: {fileName}</Text>
                                            <Button title="Yuklash" onPress={handleFileUpload} />
                                        </View>
                                    )}

                                    <TouchableOpacity style={styles.buttonLogOut} onPress={handleLogout}>
                                        <FontAwesome name="sign-out" size={18} color="#fff" style={{ marginRight: 10 }} />
                                        <Text style={styles.buttonText}>Tizimdan chiqish</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
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
    label: {
        marginTop: 10,
        fontSize: 16,
        color: "white",
    },
    input: {
        backgroundColor: "#fff",
        marginBottom: 15,
        borderRadius: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },

    profileContainer: {
        marginTop: 65,
        width: "90%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
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
    buttonProfil: {
        justifyContent:"space-between",
        backgroundColor: "#4453bc", // Blue background for the button
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
        justifyContent: "center",
        margin: "auto",
    },
    myRow:{
        flexDirection:"row",
        alignItems: "center"
    }
});

export default StaffProfile;
