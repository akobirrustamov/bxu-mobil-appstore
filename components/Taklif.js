import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    ImageBackground,
    ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../config/ApiCall";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';

const Taklif = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [role, setRole] = useState(null);
    const [offers, setOffers] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const userRole = await AsyncStorage.getItem("role");
            const token = await AsyncStorage.getItem("token");

            if (userRole === "ROLE_STUDENT") {
                const response = await ApiCall("/api/v1/app/student/account/" + token, "GET");
                if (response.status === 200 && response.data) {
                    setProfileData(response.data);

                    setRole("student");
                    await getOffersByStudentId(response.data.id);
                } else {
                    Alert.alert("Xatolik", "Talaba profili topilmadi");
                    navigation.replace("Login");
                }
            } else if (userRole === "ROLE_STAFF") {
                const response = await ApiCall("/api/v1/app/staff/me/" + token, "GET");
                if (response.status === 200 && response.data) {
                    setProfileData(response.data);
                    setRole("staff");
                    await getOffersByStaffId(response.data.id);
                } else {
                    Alert.alert("Xatolik", "Xodim profili topilmadi");
                    navigation.replace("Login");
                }
            } else {
                navigation.replace("Login");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Xatolik yuz berdi");
        } finally {
            setIsLoading(false);
        }
    };

    const getOffersByStudentId = async (studentId) => {
        setIsLoading(true);
        try {
            const response = await ApiCall(`/api/v1/app/app-offer/student-offers/${studentId}`, "GET");
            if (response.status === 200) {
                setOffers(response.data);
            } else {
                Alert.alert("Xatolik", "Takliflarni yuklab bo'lmadi");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Takliflarni yuklashda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

    const getOffersByStaffId = async (staffId) => {
        setIsLoading(true);
        try {
            const response = await ApiCall(`/api/v1/app/app-offer/staff-offers/${staffId}`, "GET");
            if (response.status === 200) {
                setOffers(response.data);
            } else {
                Alert.alert("Xatolik", "Takliflarni yuklab bo'lmadi");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Takliflarni yuklashda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert("Diqqat", "Barcha maydonlarni to'ldiring");
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                title,
                description,
                isActive: true,
                isInActive: false,
                isStudent: role === "student",
                studentId: role === "student" ? profileData.id : null,
                staffId: role === "staff" ? profileData.id : null,
            };

            const response = await ApiCall("/api/v1/app/app-offer", "POST", data);
            if (response.status === 201) {
                Alert.alert("Muvaffaqiyatli", "Taklifingiz qabul qilindi");
                setTitle("");
                setDescription("");

                if (role === "student") {
                    await getOffersByStudentId(profileData.id);
                } else {
                    await getOffersByStaffId(profileData.id);
                }
            } else {
                Alert.alert("Xatolik", "Taklif yuborishda xatolik");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Taklif yuborishda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

    const renderOfferItem = ({ item }) => {
        const isAnswered = item.isActive === false;

        return (
            <Animatable.View
                animation="fadeInUp"
                duration={500}
                style={[
                    styles.offerItem,
                    isAnswered && { backgroundColor: "#E8F5E9" } // Yashil fon
                ]}
            >
                <View style={styles.offerHeader}>
                    <MaterialIcons
                        name={role === "student" ? "school" : "work"}
                        size={20}
                        color={isAnswered ? "#2E7D32" : "#4CAF50"} // Yashilrang ikonka
                    />
                    <Text style={styles.offerTitle}>{item.title}</Text>
                </View>

                <Text style={styles.offerDescription}>{item.description}</Text>

                {isAnswered && (
                    <>
                        <Text style={styles.answeredText}>
                            Javob:
                        </Text>
                        <Text style={styles.answerText}>{item.answer}</Text>
                    </>
                )}

                <Text style={styles.offerDate}>
                    {new Date(item.createdAt).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </Animatable.View>
        );
    };


    return (
        <ImageBackground
            source={require("../assets/newbg.jpg")}
            resizeMode="cover"
            style={styles.background}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Animatable.View
                        animation="fadeInDown"
                        duration={500}
                        style={styles.header}
                    >
                        <Text style={styles.title}>Taklif va Shikoyatlar</Text>
                        <Text style={styles.subtitle}>
                            {role === "student" ? "Talaba" : "Xodim"} sifatida fikringizni bildiring
                        </Text>
                    </Animatable.View>

                    <Animatable.View
                        animation="fadeInUp"
                        duration={500}
                        style={styles.formContainer}
                    >
                        <Text style={styles.inputLabel}>Sarlavha</Text>
                        <TextInput
                            placeholder="Taklif/shikoyat mavzusi..."
                            placeholderTextColor="#999"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                        />

                        <Text style={styles.inputLabel}>Tavsif</Text>
                        <TextInput
                            placeholder="Batafsil tavsif..."
                            placeholderTextColor="#999"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            style={[styles.input, styles.multilineInput]}
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <FontAwesome name="send" size={16} color="#fff" />
                                    <Text style={styles.submitButtonText}>Yuborish</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animatable.View>

                    <Animatable.View
                        animation="fadeInUp"
                        duration={700}
                        style={styles.offersContainer}
                    >
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="history" size={24} color="#4CAF50" />
                            <Text style={styles.sectionTitle}>Yuborilgan takliflar</Text>
                        </View>

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#4CAF50" />
                        ) : offers.length > 0 ? (
                            <FlatList
                                data={offers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderOfferItem}
                                scrollEnabled={false}
                                contentContainerStyle={styles.offersList}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="info-outline" size={40} color="#999" />
                                <Text style={styles.emptyText}>Hozircha takliflar mavjud emas</Text>
                            </View>
                        )}
                    </Animatable.View>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "black",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 16,
        color: "black",
        marginTop: 5,
    },
    formContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C3E50",
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        backgroundColor: "#fff",
        color: "#333",
    },
    multilineInput: {
        height: 120,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    offersContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2C3E50",
        marginLeft: 10,
    },
    offersList: {
        paddingBottom: 10,
    },
    offerItem: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    offerHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    offerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2C3E50",
        marginLeft: 10,
    },
    offerDescription: {
        fontSize: 15,
        color: "#555",
        marginBottom: 10,
        lineHeight: 22,
    },
    offerDate: {
        fontSize: 12,
        color: "#888",
        textAlign: "right",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
    },
    emptyText: {
        fontSize: 16,
        color: "#888",
        marginTop: 10,
    },
    answeredText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#2E7D32",
        marginTop: 10,
    },

    answerText: {
        fontSize: 14,
        color: "#2E7D32",
        marginTop: 5,
        fontStyle: "italic",
        lineHeight: 20,
    },

});

export default Taklif;