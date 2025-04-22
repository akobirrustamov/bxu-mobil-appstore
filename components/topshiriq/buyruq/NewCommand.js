import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Alert,
    ActivityIndicator,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { CheckBox } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../../../config/ApiCall";
import * as DocumentPicker from "expo-document-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FontAwesome } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

const NewCommand = () => {
    const navigation = useNavigation();
    const [rating, setRating] = useState(0);
    const [administrator, setAdministrator] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [commander, setCommander] = useState([]);
    const [selectedCommander, setSelectedCommander] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [listStaff, setListStaff] = useState([]);
    const [expandedRank, setExpandedRank] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState({});
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(new Date());
    const [fileUri, setFileUri] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (commander && commander.length > 0) {
            const dropdownItems = commander.map((c) => ({
                label: c.rank.name,
                value: c.id,
            }));
            setItems(dropdownItems);
            setSelectedRole(commander[0].id); // Set the default selected value
        }
    }, [commander]);

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirm = (date) => {
        setSelectedDateTime(date);
        hideDatePicker();
    };

    const toggleExpandRank = (rankId) => {
        setExpandedRank(expandedRank === rankId ? null : rankId);
    };

    const handleRankCheckboxToggle = (rankId, staffList) => {
        setSelectedStaff((prevState) => {
            const isAllSelected = staffList.every((staff) => prevState[staff.id]);
            const updatedStaff = { ...prevState };
            staffList.forEach((staff) => {
                if (isAllSelected) {
                    delete updatedStaff[staff.id];
                } else {
                    updatedStaff[staff.id] = { rankId, staffId: staff.id };
                }
            });

            return updatedStaff;
        });
    };

    const handleStaffCheckboxToggle = (rankId, staffId) => {
        setSelectedStaff((prevState) => {
            const updatedStaff = { ...prevState };

            if (updatedStaff[staffId]) {
                delete updatedStaff[staffId];
            } else {
                updatedStaff[staffId] = { rankId, staffId };
            }

            return updatedStaff;
        });
    };

    useEffect(() => {
        fetchProfileData();
    }, [navigation]);

    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const role = await AsyncStorage.getItem("role");

            if (!token || !role) {
                return;
            }

            if (role === "ROLE_STAFF") {
                const response = await ApiCall(`/api/v1/app/staff/me/${token}`, "GET");
                if (response.status === 200 && response.data) {
                    setAdministrator(response?.data);
                } else {
                    Alert.alert("Error", "Failed to fetch profile data.");
                }

                const com = await ApiCall(`/api/v1/app/staff/commander/${token}`, "GET");
                if (com.status === 200 && com.data) {
                    setCommander(com.data);
                    console.log(com.data)
                    if (com.data.length > 0) {

                        setSelectedCommander(com.data[0]);
                        setSelectedRole(com.data[0]?.rank?.id);


                        const resListStaff = await ApiCall(`/api/v1/app/commander/list-staff/${com.data[0]?.rank?.id}`, "GET");
                        setListStaff(resListStaff.data);
                    }
                } else {
                    Alert.alert("Error", "Failed to fetch commander data.");
                }
            } else {
                // Handle other roles if needed
            }
        } catch (error) {
            Alert.alert("Error", error.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDocumentPick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
            });

            if (result.canceled) return;
            setFileUri(result.assets[0].uri);
            setFileName(result.assets[0].name);
        } catch (error) {
            Alert.alert("Error", "An error occurred while selecting the file.");
        }
    };

    const handleFileUpload = async () => {
        setIsLoading(true);
        try {
            if (!fileUri || !fileName) {
                Alert.alert("Error", "Please select a file first.");
                return;
            }

            const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
            const formData = new FormData();
            formData.append("photo", {
                uri: fileUri,
                name: safeFileName,
                type: getMimeType(safeFileName),
            });
            formData.append("prefix", `/command/${administrator.name}`);

            const response = await ApiCall('/api/v1/file/upload', "POST", formData, {
                "Content-Type": "multipart/form-data",
            });

            if (response.status === 200 && response.data) {
                Alert.alert("Success", "File uploaded successfully.");
                return response.data;
            } else {
                Alert.alert("Error", "Failed to upload file.");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            Alert.alert("Error", "An error occurred during file upload.");
        } finally {
            setIsLoading(false);
        }
    };

    const getMimeType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'zip':
                return 'application/zip';
            case 'rar':
                return 'application/x-rar-compressed';
            case 'png':
                return 'image/png';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'mp4':
                return 'video/mp4';
            case 'pdf':
                return 'application/pdf';
            default:
                return 'application/octet-stream';
        }
    };

    const handleSubmit = async () => {
        const currentDateTime = new Date();
        const timeDifference = selectedDateTime - currentDateTime;

        if (timeDifference <= 60 * 60 * 1000) {
            Alert.alert(
                "Xatolik",
                "Javob berish muddati 1 soatdan kam bo'lishi mumkin emas."
            );
            return;
        }
        const file = fileUri ? await handleFileUpload() : null;

        try {
            const selectedStaffList = Object.values(selectedStaff);
            const submissionData = {
                text: title,
                description,
                ball: rating,
                commandRankId: selectedRole,
                commandStaffId: administrator.id,
                file,
                dateTime: selectedDateTime,
                selectedStaffList,
            };

            Alert.alert(
                "Tasdiqlash",
                "Buyruqni jo'natishga ishonchingiz komilmi?",
                [
                    {
                        text: "Yo'q",
                        onPress: () => console.log("Jo'natish bekor qilindi."),
                        style: "cancel",
                    },
                    {
                        text: "Ha",
                        onPress: async () => {
                            const response = await ApiCall('/api/v1/app/command', "POST", submissionData, {});
                            if (response.status === 200) {
                                setIsLoading(false);
                                Alert.alert("Muvaffaqiyatli", "Malumotlar muvaffaqiyatli jo'natildi.");
                                navigation.navigate("Buyruqlar");
                            } else {
                                Alert.alert("Xato", "Malumotlarni jo'natishda xatolik yuz berdi.");
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert("Xato", "Malumotlarni jo'natishda xatolik yuz berdi.");
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.centered} nestedScrollEnabled={true}>
            <ImageBackground source={require("../../../assets/newbg.jpg")} resizeMode="repeat" style={styles.profileBg}>
                <Text style={styles.title}>Yangi topshiriq yaratish</Text>
                <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, width: "90%", marginBottom: 10 }}>
                    <DropDownPicker
                        disabled={true}
                        open={open}
                        value={selectedRole}
                        items={items}
                        setOpen={setOpen}
                        setValue={setSelectedRole}
                        setItems={setItems}
                        placeholder="Rolini tanlang"
                        placeholderTextColor="#000"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        nestedScrollEnabled={true}
                    />
                </View>
                <TextInput style={styles.input} placeholder="Topshiriq sarlavhasi" placeholderTextColor="#000" value={title} onChangeText={setTitle} />
                <TextInput style={[styles.input]} placeholder="Topshiriq haqida" placeholderTextColor="#000" value={description} onChangeText={setDescription} multiline />
                <TouchableOpacity style={styles.button} onPress={handleDocumentPick}>
                    {fileName ? (
                        <View style={styles.fileDiv}>
                            <FontAwesome name="file-o" size={20} />
                            <Text> Fayl: {fileName}</Text>
                        </View>
                    ) : (
                        <View style={styles.fileDiv}>
                            <FontAwesome style={{ width: 18 }} name="file-o" size={20} />
                            <Text> Topshiriq fayli</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={showDatePicker}>
                    {selectedDateTime ? (
                        <View style={styles.fileDiv}>
                            <FontAwesome style={{ width: 18 }} name="clock-o" size={20} />
                            <Text> Muddat: {selectedDateTime.toLocaleDateString('en-GB')} {selectedDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                    ) : (
                        <View style={styles.fileDiv}>
                            <FontAwesome style={{ width: 18 }} name="clock-o" size={20} />
                            <Text> Topshiriq topshirish muddatini tanlang</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="datetime"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    minimumDate={new Date(new Date().getTime() + 60 * 60 * 1000)} // +1 hour
                />
                <Text style={styles.xodim}> <FontAwesome style={{ width: 18 }} name="users" size={20} /> Xodimlarni tanlang</Text>
                {listStaff?.map((item) => (
                    <View key={item?.rank?.id} style={styles.rankContainer}>
                        <TouchableOpacity onPress={() => toggleExpandRank(item.rank.id)} style={styles.rankHeader}>
                            <View style={[item?.staff.length === 0 && styles.disabledRank]}>
                                <View style={styles.rankHeader}>
                                    <CheckBox
                                        checked={
                                            item.staff.length > 0 &&
                                            item.staff.every(
                                                (staff) =>
                                                    selectedStaff[staff.id] &&
                                                    selectedStaff[staff.id].rankId === item.rank.id
                                            )
                                        }
                                        onPress={() => handleRankCheckboxToggle(item.rank.id, item.staff)}
                                        disabled={item.staff.length === 0}
                                    />
                                    <Text style={[item.staff.length === 0 ? styles.disabledRank : styles.rankTitle]}>- {item.rank.name}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {expandedRank === item.rank.id && (
                            <View style={styles.staffList}>
                                {item.staff.length > 0 ? (
                                    item.staff.map((staffMember, index) => (
                                        <View key={index} style={styles.staffItem}>
                                            <CheckBox
                                                checked={
                                                    !!selectedStaff[staffMember.id] &&
                                                    selectedStaff[staffMember.id].rankId === item.rank.id
                                                }
                                                onPress={() => handleStaffCheckboxToggle(item.rank.id, staffMember.id)}
                                            />
                                            <Text style={styles.staffName}>{staffMember.name}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text>No staff assigned</Text>
                                )}
                            </View>
                        )}
                    </View>
                ))}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Yuborish</Text>
                </TouchableOpacity>
            </ImageBackground>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centered: {
        flexGrow: 1,
        alignItems: "center",
        paddingBottom: 20,
    },
    profileBg: {
        width: "100%",
        height: "100%",
        flex: 1,
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 20,
    },
    input: {
        padding: 5,
        width: "90%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 10,
    },
    rankContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        width: "90%",
    },
    rankHeader: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    rankTitle: {
        width: "85%",
        fontSize: 16,
        fontWeight: "bold",
    },
    staffItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    staffName: {
        fontSize: 14,
    },
    disabledRank: {
        width: "90%",
        color: "gray",
        textDecorationLine: "line-through",
    },
    submitButton: {
        backgroundColor: "green",
        height: 50,
        borderRadius: 5,
        marginTop: 20,
        width: "90%",
        alignItems: "center",
    },
    submitButtonText: {
        marginTop: 10,
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    button: {
        paddingTop: 12,
        paddingLeft: 5,
        width: "90%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 10,
    },
    fileDiv: {
        color: "#FFFF",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    xodim: {
        marginBottom: 5,
        marginTop: 10,
        fontSize: 20,
    },
    dropdown: {
        borderWidth: 0,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
    },
});

export default NewCommand;