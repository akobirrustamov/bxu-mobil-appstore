import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    ImageBackground,
    Dimensions, Button, TouchableOpacity, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ApiCallBuxpxti from "../../config/ApiCallBuxpxti";
import {FontAwesome} from "@expo/vector-icons";
import ApiCall, {BASE_URL} from "../../config/ApiCall";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const DetailGroup = ({ route, navigation }) => {
    const [students, setStudents] = useState([]);

    const { groupId } = route.params;
    console.log("Selected Group ID:", groupId);

    const fetchGroups = async () => {
        try {
            const response = await ApiCallBuxpxti(`/v1/data/student-list?_group=${groupId}&limit=60`, "GET");
            setStudents(response.data.data.items); // items massivini olish
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchGroups();
        }, [])
    );
    const downloadAttendance = async () => {
        try {
            const fileName = `davomat_${groupId}.xlsx`; // Guruh ID bo‘yicha nom beramiz
            const localFileUri = `${FileSystem.documentDirectory}${fileName}`;

            // Faylni yuklab olish
            const downloadResponse = await FileSystem.downloadAsync(
                `${BASE_URL}/api/v1/app/attendance/${groupId}`,
                localFileUri
            );

            if (downloadResponse.status === 200) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(downloadResponse.uri);
                } else {
                    Alert.alert("Success", "File downloaded successfully!");
                }
            } else {
                Alert.alert("Error", "Failed to download the file. Please try again.");
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            Alert.alert("Error", "An unexpected error occurred while downloading the file.");
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../../assets/bg21.jpg")}
                style={styles.myBg}
                resizeMode="repeat"
            >
                <ScrollView style={styles.cardsContainer}>
                    {/* Group Info Section */}
                    <View style={styles.groupInfoContainer}>
                        <Text style={styles.groupInfoText}>Guruh: {students[0]?.group?.name}</Text>
                        <Text style={styles.groupInfoText}>Talabalar soni: {students.length}</Text>
                        <View style={styles.myRow}>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("HaftalikJadval", { groupId: groupId })}>
                                <FontAwesome name="table" size={18} color="#fff" />
                                <Text style={styles.buttonText}> Dars Jadvali </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={downloadAttendance}>
                                <FontAwesome name="newspaper-o" size={18} color="#fff"/>
                                <Text style={styles.buttonText}> Davomat jurnali </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Table Section */}
                    <View style={styles.table}>
                        <View style={[styles.row, styles.headerRow]}>
                            <Text style={[styles.cell1, styles.headerText]}>#</Text>
                            <Text style={[styles.cell, styles.headerText]}>F.I.Sh.</Text>
                            <Text style={[styles.cell, styles.headerText]}>Semester</Text>
                            <Text style={[styles.cell, styles.headerText]}>Rasm</Text>
                        </View>
                        {students.map((student, index) => (
                            <View key={student.id} style={styles.row}>
                                <Text style={styles.cell1}>{index + 1}</Text>
                                <Text style={styles.cell}>{student.short_name}</Text>
                                <Text style={styles.cell}>{student.semester.name}</Text>
                                <Image source={{ uri: student.image }} style={styles.studentImage} />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

export default DetailGroup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    myBg: {
        flex: 1,
        width: Dimensions.get("window").width,
    },
    cardsContainer: {
        paddingVertical: 20,
    },
    groupInfoContainer: {
        backgroundColor: "#fff",
        padding: 15,
        margin: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    groupInfoText: {
        fontSize: 16,
        color: "#333",
        marginBottom: 5,
        fontWeight: "bold",
    },
    table: {
        borderWidth: 1,
        borderColor: "#ccc",
        margin: 10,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    headerRow: {
        backgroundColor: "#007bff",
    },
    evenRow: {
        backgroundColor: "#f9f9f9",
    },
    oddRow: {
        backgroundColor: "#fff",
    },
    cell: {
        flex: 2,
        fontSize: 14,
        paddingVertical: 1,
        color: "#333",
    },
    cell1: {
        flex: 0.5,
        fontSize: 14,
        paddingLeft: 2,
        paddingVertical: 2,
        color: "#333",
    },
    headerText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    studentImage: {
        width: 35,
        height: 35,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#007bff",
    },
    button: {
        width: "40%",
        height: 50,
        marginTop:5,
        backgroundColor: "#007BFF",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
    myRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,

    }

});