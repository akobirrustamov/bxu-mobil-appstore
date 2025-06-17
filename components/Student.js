import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    Modal,
    ActivityIndicator,
    Linking
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../config/ApiCall";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from "axios";
const Student = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [contractData, setContractData] = useState(null);
    const [referenceData, setReferenceData] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [debtData, setDebtData] = useState(null);
    const [timetableData, setTimetableData] = useState(null);
    const [applicationData, setApplicationData] = useState(null);
    const [loading, setLoading] = useState({
        contract: false,
        reference: false,
        payment: false,
        debt: false,
        timetable: false,
        application: false
    });
    const [modalVisible, setModalVisible] = useState({
        contract: false,
        reference: false,
        payment: false,
        debt: false,
        timetable: false,
        application: false
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const role = await AsyncStorage.getItem("role");

                if (!token || !role) {
                    Alert.alert("Ogohlantirish", "Tizimga kirishdan oldin ro'yxatdan o'ting");
                    navigation.replace("Login");
                    return;
                }

                if (role === "ROLE_STUDENT") {
                    const response = await ApiCall("/api/v1/app/student/account/" + token, "GET");
                    if (response.status === 200 && response.data) {
                        setProfileData(response.data);
                    } else {
                        Alert.alert("Xatolik", "Profil ma'lumotlarini yuklab bo'lmadi.");
                        navigation.replace("Login");
                    }
                }
            } catch (error) {
                Alert.alert("Xatolik", error.message || "Xatolik yuz berdi.");
                navigation.replace("Login");
            }
        };

        fetchProfileData();
    }, [navigation]);

    // Formatting functions
    const formatMoney = (amount) => {
        if (amount === undefined || amount === null) return "0 soʻm";
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0
        }).format(amount).replace('UZS', 'soʻm');
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Noma'lum";
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handlers for each service
    const handleGetContract = async () => {
        setLoading({...loading, contract: true});
        try {
            const response = await ApiCall(`/api/v1/app/student/contract/${profileData.login}`, "GET");
            if (response.status === 200 && response.data) {
                setContractData(response.data);
                setModalVisible({...modalVisible, contract: true});
            } else {
                Alert.alert("Xatolik", "Shartnoma ma'lumotlarini olishda xatolik");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Shartnoma ma'lumotlarini olishda xatolik");
        } finally {
            setLoading({...loading, contract: false});
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
            Alert.alert("Error", "Failed to generate reference. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const handleGetPayment = async () => {
        setLoading({...loading, payment: true});
        try {
            const api_url = `https://qabul.buxpxti.uz/api/?jshir=${profileData?.passport_pin}&passport=${profileData.passport_number}`;
            const headers = {
                Authorization: 'Bearer 6d8f01f8c8f1e8f385415ee0894055f2',
            };

            const response = await ApiCall(api_url, "GET", null, headers);
            if (response.status === 200 && response.data) {
                setPaymentData(response.data);
                setModalVisible({...modalVisible, payment: true});
            } else {
                Alert.alert("Xatolik", "To'lov ma'lumotlari topilmadi");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "To'lov ma'lumotlarini olishda xatolik");
        } finally {
            setLoading({...loading, payment: false});
        }
    };

    const handleDebt = async () => {
        setLoading({...loading, debt: true});
        const token = await AsyncStorage.getItem("token");

        try {
            const response = await ApiCall('/api/v1/app/student/debt/'+token, "GET");
            if (response.status === 200 && response.data) {
                setDebtData(response.data);
                setModalVisible({...modalVisible, debt: true});
            } else {
                Alert.alert("Xatolik", "Qarzdorlik ma'lumotlari topilmadi");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Qarzdorlik ma'lumotlarini olishda xatolik");
        } finally {
            setLoading({...loading, debt: false});
        }
    };

    const handleTimetable = async () => {
        setLoading({...loading, timetable: true});
        try {
            const response = await ApiCall('/api/v1/app/student/timetable', "GET");
            if (response.status === 200 && response.data) {
                setTimetableData(response.data);
                setModalVisible({...modalVisible, timetable: true});
            } else {
                Alert.alert("Xatolik", "Dars jadvali ma'lumotlari topilmadi");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Dars jadvalini olishda xatolik");
        } finally {
            setLoading({...loading, timetable: false});
        }
    };

    const handleApplication = async () => {
        setLoading({...loading, application: true});
        try {
            const response = await ApiCall('/api/v1/app/student/applications', "GET");
            if (response.status === 200 && response.data) {
                setApplicationData(response.data);
                setModalVisible({...modalVisible, application: true});
            } else {
                Alert.alert("Xatolik", "Arizalar ma'lumotlari topilmadi");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Arizalarni olishda xatolik");
        } finally {
            setLoading({...loading, application: false});
        }
    };

    const downloadFile = async (url, filename) => {
        try {
            const fileUri = FileSystem.documentDirectory + filename;
            const { uri } = await FileSystem.downloadAsync(url, fileUri);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert("Yuklab olindi", `Fayl saqlandi: ${uri}`);
            }
        } catch (error) {
            Alert.alert("Xatolik", "Faylni yuklab olishda xatolik");
        }
    };

    const closeModal = (modalName) => {
        setModalVisible({...modalVisible, [modalName]: false});
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require("../assets/newbg.jpg")}
                             resizeMode={"repeat"}
                             style={styles.profileBg}>

                {profileData ? (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.servicesContainer}>
                            {/* Ma'lumotnoma */}
                            <TouchableOpacity
                                style={styles.service}
                                onPress={handleGenerateReference}
                                disabled={loading.reference}
                            >
                                {loading.reference ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="description" size={24} color="#fff" />
                                        <Text style={styles.serviceText}>Ma'lumotnoma1</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Kontrakt to'lovi */}
                            <TouchableOpacity
                                style={styles.service}
                                onPress={handleGetContract}
                                disabled={loading.contract}
                            >
                                {loading.contract ? (
                                    <ActivityIndicator color="#fff" />

                                ) : (
                                    <>
                                        <MaterialIcons name="receipt" size={24} color="#fff" />
                                        <Text style={styles.serviceText}>Kontrakt to'lovi</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* To'lov shartnoma */}
                            <TouchableOpacity
                                style={styles.service}
                                onPress={handleGetPayment}
                                disabled={loading.payment}
                            >
                                {loading.payment ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="account-balance" size={24} color="#fff" />
                                        <Text style={styles.serviceText}>To'lov shartnoma</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Qarzdorlik */}
                            <TouchableOpacity
                                style={styles.service}
                                onPress={handleDebt}
                                disabled={loading.debt}
                            >
                                {loading.debt ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="money-off" size={24} color="#fff" />
                                        <Text style={styles.serviceText}>Qarzdorlik</Text>
                                    </>
                                )}
                            </TouchableOpacity>



                            {/* Arizalar */}
                            <TouchableOpacity
                                style={styles.service}
                                onPress={handleApplication}
                                disabled={loading.application}
                            >
                                {loading.application ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="assignment" size={24} color="#fff" />
                                        <Text style={styles.serviceText}>Arizalar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>Ma'lumotlar yuklanmoqda...</Text>
                    </View>
                )}

                {/* Contract Data Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible.contract}
                    onRequestClose={() => closeModal('contract')}
                >
                    <View style={styles.modalOverlay}>
                        <Animatable.View
                            animation="fadeInUp"
                            duration={500}
                            style={styles.modalContainer}
                        >
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => closeModal('contract')}
                            >
                                <MaterialIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>Kontrakt To'lov Ma'lumotlari</Text>

                            {contractData && (
                                <View style={styles.contractDetails}>
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="person" size={20} color="#4CAF50" />
                                        <Text style={styles.detailLabel}>To'liq ismi:</Text>
                                        <Text style={styles.detailValue}>{contractData.fullName}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="class" size={20} color="#4CAF50" />
                                        <Text style={styles.detailLabel}>Kurs:</Text>
                                        <Text style={styles.detailValue}>{contractData.level}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="fingerprint" size={20} color="#4CAF50" />
                                        <Text style={styles.detailLabel}>HEMIS ID:</Text>
                                        <Text style={styles.detailValue}>{contractData.hemisId}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="attach-money" size={20} color="#4CAF50" />
                                        <Text style={styles.detailLabel}>Kontrakt summasi:</Text>
                                        <Text style={styles.detailValue}>{formatMoney(contractData.amount)}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="payment" size={20} color="#4CAF50" />
                                        <Text style={styles.detailLabel}>To'langan summa:</Text>
                                        <Text style={[styles.detailValue, styles.paidAmount]}>
                                            {formatMoney(Math.abs(contractData.payment))}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="money-off" size={20} color="#E74C3C" />
                                        <Text style={styles.detailLabel}>Qarzdorlik:</Text>
                                        <Text style={[styles.detailValue, styles.debtAmount]}>
                                            {formatMoney(contractData.debt)}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="update" size={20} color="#4CAF50" />
                                        <Text style={styles.detailLabel}>Yangilangan sana:</Text>
                                        <Text style={styles.detailValue}>{formatDate(contractData.createdAt)}</Text>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => closeModal('contract')}
                            >
                                <Text style={styles.modalButtonText}>Yopish</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    </View>
                </Modal>

                {/* Reference Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible.reference}
                    onRequestClose={() => closeModal('reference')}
                >
                    <View style={styles.modalOverlay}>
                        <Animatable.View
                            animation="fadeInUp"
                            duration={500}
                            style={styles.modalContainer}
                        >
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => closeModal('reference')}
                            >
                                <MaterialIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>Ma'lumotnoma</Text>

                            {referenceData && (
                                <View style={styles.referenceDetails}>
                                    <Text style={styles.referenceText}>
                                        Talaba haqidagi ma'lumotnoma tayyor. Quyidagi havola orqali yuklab olishingiz mumkin:
                                    </Text>

                                    {referenceData.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.downloadButton}
                                            onPress={() => downloadFile(item.file, `malumotnoma_${index}.pdf`)}
                                        >
                                            <MaterialIcons name="cloud-download" size={20} color="#fff" />
                                            <Text style={styles.downloadButtonText}>Yuklab olish {index + 1}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => closeModal('reference')}
                            >
                                <Text style={styles.modalButtonText}>Yopish</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    </View>
                </Modal>

                {/* Payment Contract Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible.payment}
                    onRequestClose={() => closeModal('payment')}
                >
                    <View style={styles.modalOverlay}>
                        <Animatable.View
                            animation="fadeInUp"
                            duration={500}
                            style={styles.modalContainer}
                        >
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => closeModal('payment')}
                            >
                                <MaterialIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>To'lov Shartnomasi</Text>

                            {paymentData && (
                                <View style={styles.paymentDetails}>
                                    <Text style={styles.paymentText}>
                                        To'lov shartnomasi tayyor. Quyidagi tugma orqali yuklab olishingiz mumkin:
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.downloadButton}
                                        onPress={() => {
                                            // Implement PDF download functionality
                                            Alert.alert("Yuklab olish", "To'lov shartnomasi yuklanmoqda...");
                                        }}
                                    >
                                        <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
                                        <Text style={styles.downloadButtonText}>PDF shaklda yuklab olish</Text>
                                    </TouchableOpacity>

                                    <View style={styles.paymentInfo}>
                                        <Text style={styles.paymentInfoTitle}>To'lov ma'lumotlari:</Text>
                                        <View style={styles.detailRow}>
                                            <MaterialIcons name="account-balance" size={18} color="#4CAF50" />
                                            <Text style={styles.detailLabel}>Bank:</Text>
                                            <Text style={styles.detailValue}>Xalq Banki</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <MaterialIcons name="credit-card" size={18} color="#4CAF50" />
                                            <Text style={styles.detailLabel}>Hisob raqam:</Text>
                                            <Text style={styles.detailValue}>8600 1234 5678 9012</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <MaterialIcons name="attach-money" size={18} color="#4CAF50" />
                                            <Text style={styles.detailLabel}>To'lov summasi:</Text>
                                            <Text style={styles.detailValue}>{formatMoney(contractData?.amount)}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => closeModal('payment')}
                            >
                                <Text style={styles.modalButtonText}>Yopish</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    </View>
                </Modal>

                {/* Debt Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible.debt}
                    onRequestClose={() => closeModal('debt')}
                >
                    <View style={styles.modalOverlay}>
                        <Animatable.View
                            animation="fadeInUp"
                            duration={500}
                            style={styles.modalContainer}
                        >
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => closeModal('debt')}
                            >
                                <MaterialIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>Fanlar Bo'yicha Qarzdorlik</Text>

                            {debtData && debtData.length > 0 ? (
                                <ScrollView style={styles.debtScroll}>
                                    {debtData.map((subject, index) => (
                                        <View key={index} style={styles.debtItem}>
                                            <Text style={styles.subjectName}>{subject.subjectName}</Text>

                                            <View style={styles.debtDetails}>
                                                <Text style={styles.debtLabel}>Semestr:</Text>
                                                <Text style={styles.debtValue}>{subject._semester}-semestr</Text>
                                            </View>

                                            <View style={styles.debtDetails}>
                                                <Text style={styles.debtLabel}>Kredit:</Text>
                                                <Text style={styles.debtValue}>{subject.credit} kredit</Text>
                                            </View>

                                            <View style={styles.debtDetails}>
                                                <Text style={styles.debtLabel}>Yuklama:</Text>
                                                <Text style={styles.debtValue}>{subject.total_acload} soat</Text>
                                            </View>

                                            <View style={styles.debtDetails}>
                                                <Text style={styles.debtLabel}>Bahosi:</Text>
                                                <Text style={styles.debtValue}>{subject.overallScore?.label || "0 / 100"}</Text>
                                            </View>


                                                <View style={styles.debtDetails}>
                                                    <Text style={styles.debtLabel}>Qarzdorlik sababi:</Text>
                                                    <Text style={styles.debtValue}>Baho yetarli emas</Text>
                                                </View>

                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={styles.noDebtText}>Qarzdorliklar mavjud emas</Text>
                            )}

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => closeModal('debt')}
                            >
                                <Text style={styles.modalButtonText}>Yopish</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    </View>
                </Modal>




                {/* Applications Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible.application}
                    onRequestClose={() => closeModal('application')}
                >
                    <View style={styles.modalOverlay}>
                        <Animatable.View
                            animation="fadeInUp"
                            duration={500}
                            style={styles.modalContainer}
                        >
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => closeModal('application')}
                            >
                                <MaterialIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>Arizalar</Text>

                            {applicationData ? (
                                <ScrollView style={styles.applicationsScroll}>
                                    {applicationData.map((app, index) => (
                                        <View key={index} style={styles.applicationItem}>
                                            <Text style={styles.applicationTitle}>{app.title}</Text>
                                            <Text style={styles.applicationDate}>{formatDate(app.date)}</Text>
                                            <Text style={styles.applicationStatus(app.status)}>
                                                {app.status === 'pending' ? 'Koʻrib chiqilmoqda' :
                                                    app.status === 'approved' ? 'Qabul qilingan' : 'Rad etilgan'}
                                            </Text>
                                            {app.comment && (
                                                <Text style={styles.applicationComment}>Izoh: {app.comment}</Text>
                                            )}
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={styles.noApplicationsText}>Arizalar mavjud emas</Text>
                            )}

                            <TouchableOpacity
                                style={styles.newApplicationButton}
                                onPress={() => {
                                    closeModal('application');
                                    // Navigate to new application screen
                                }}
                            >
                                <MaterialIcons name="add" size={20} color="#fff" />
                                <Text style={styles.newApplicationButtonText}>Yangi ariza</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    </View>
                </Modal>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    profileBg: {
        flex: 1,
        width: "100%",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#fff",
        fontSize: 16,
    },
    servicesContainer: {
        padding: 20,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    service: {
        width: "48%",
        height: 100,
        marginBottom: 15,
        borderRadius: 12,
        backgroundColor: "rgba(76, 175, 80, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    serviceText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 8,
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        position: "relative",
    },
    timetableModal: {
        maxHeight: "90%",
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#E74C3C",
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2C3E50",
        marginBottom: 20,
        textAlign: "center",
    },
    contractDetails: {
        marginBottom: 20,
    },
    referenceDetails: {
        marginBottom: 20,
        alignItems: "center",
    },
    paymentDetails: {
        marginBottom: 20,
        alignItems: "center",
    },
    paymentInfo: {
        width: "100%",
        marginTop: 20,
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
    },
    paymentInfoTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    paymentText: {
        fontSize: 16,
        color: "#555",
        marginBottom: 20,
        textAlign: "center",
    },
    referenceText: {
        fontSize: 16,
        color: "#555",
        marginBottom: 20,
        textAlign: "center",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        flexWrap: "wrap",
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#555",
        marginLeft: 8,
        marginRight: 4,
    },
    detailValue: {
        fontSize: 14,
        color: "#333",
    },
    paidAmount: {
        color: "#27AE60",
        fontWeight: "bold",
    },
    debtAmount: {
        color: "#E74C3C",
        fontWeight: "bold",
    },
    modalButton: {
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    downloadButton: {
        backgroundColor: "#3498db",
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        width: "80%",
    },
    downloadButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
    debtScroll: {
        width: "100%",
        maxHeight: "60%",
    },
    debtItem: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2C3E50",
        marginBottom: 5,
    },
    debtDetails: {
        flexDirection: "row",
        marginBottom: 5,
    },
    debtLabel: {
        fontSize: 14,
        color: "#555",
        marginRight: 5,
    },
    debtAmount: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#E74C3C",
    },
    debtReason: {
        fontSize: 14,
        color: "#555",
        fontStyle: "italic",
    },
    noDebtText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginVertical: 20,
    },
    timetableScroll: {
        width: "100%",
    },
    dayContainer: {
        marginBottom: 20,
    },
    dayHeader: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2C3E50",
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    lessonItem: {
        backgroundColor: "#f5f5f5",
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
    },
    lessonTime: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#3498db",
    },
    lessonName: {
        fontSize: 16,
        color: "#2C3E50",
        marginVertical: 3,
    },
    lessonTeacher: {
        fontSize: 14,
        color: "#555",
    },
    lessonRoom: {
        fontSize: 14,
        color: "#27AE60",
        fontWeight: "bold",
    },
    noTimetableText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginVertical: 20,
    },
    applicationsScroll: {
        width: "100%",
        maxHeight: "60%",
    },
    applicationItem: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    applicationTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2C3E50",
        marginBottom: 5,
    },
    applicationDate: {
        fontSize: 14,
        color: "#555",
        marginBottom: 5,
    },
    applicationStatus: (status) => ({
        fontSize: 14,
        fontWeight: "bold",
        color: status === 'approved' ? '#27AE60' :
            status === 'rejected' ? '#E74C3C' : '#F39C12',
    }),
    applicationComment: {
        fontSize: 14,
        color: "#555",
        marginTop: 5,
        fontStyle: "italic",
    },
    noApplicationsText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginVertical: 20,
    },
    newApplicationButton: {
        backgroundColor: "#3498db",
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    newApplicationButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
});

export default Student;