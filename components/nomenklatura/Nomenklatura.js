import React, {useCallback, useEffect, useState} from "react";
import { View, Text, StyleSheet, Button, FlatList, Alert, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import ApiCall, {BASE_URL} from "../../config/ApiCall"; // Your API utility
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import {useFocusEffect} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {FontAwesome} from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const Nomenklatura = ({ route }) => {
    const { itemData } = route.params; // Passed data from navigation
    console.log(itemData)
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fileDescription, setFileDescription] = useState("");
    const [isFormVisible, setIsFormVisible] = useState(false); // State to toggle form visibility
    const [fileUri, setFileUri] = useState(null); // To store selected file URI
    const [fileName, setFileName] = useState(""); // To store selected file name
    const [searchQuery, setSearchQuery] = useState(""); // State for search query

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await ApiCall(`/api/v1/app/nomenklaturafile/${itemData.id}/${itemData.folder}`, "GET");
            if (response.status === 200 && response.data) {
                setFiles(response.data);
            } else {
                Alert.alert("Error", "Failed to fetch files.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "An error occurred while fetching files.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [itemData.id]);


    const handleUploadFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf", // Restrict to PDF files
            });

            // Check if the file selection was canceled
            if (result.canceled) return;

            const selectedUri = result.assets[0]?.uri; // Get URI
            const selectedName = result.assets[0]?.name || "file.pdf";

            console.log("File Details:", { selectedUri, selectedName });

            if (!selectedUri) {
                Alert.alert("Error", "Invalid file selected.");
                return;
            }

            // Store selected file URI and name
            setFileUri(selectedUri);
            setFileName(selectedName);

            // Show the form to input description and save
            setIsFormVisible(true);
        } catch (error) {
            console.error("Upload Error:", error);
            Alert.alert("Error", "An error occurred while selecting the file.");
        }
    };

    const handleSaveFile = async () => {
        try {
            if (!fileUri || !fileDescription) {
                Alert.alert("Error", "Please select a file and enter a description.");
                return;
            }

            // Prepare FormData for file upload
            const formData = new FormData();
            formData.append("photo", {
                uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri, // Fix for iOS
                name: fileName,
                type: "application/pdf",
            });
            formData.append("prefix", "/"+itemData.name+"/"+itemData.code+"-"+itemData.folder);

            const response = await ApiCall(`/api/v1/file/upload`, "POST", formData, {
                "Content-Type": "multipart/form-data",
            });

            console.log(response.data);
            if (response.status === 200 && response.data) {
                await saveFileDetails(response.data); // Save file details to backend
            } else {
                Alert.alert("Xatolik", "Fayl saqlashda xatolik ro'y berdi.");
            }
        } catch (error) {
            console.error("Save Error:", error);
            Alert.alert("Xatolik", "Fayl saqlashda xatolik ro'y berdi.");
        }
    };

    const handleCancel = () => {
        setFileUri(null); // Clear the selected file
        setFileDescription(""); // Reset the description
        setIsFormVisible(false); // Hide the form
    };

    const saveFileDetails = async (attachmentId) => {
        try {
            const fileData = {
                description: fileDescription,
                userId: itemData.user.id,
                nomenklaturaId: itemData.id,
                fileId: attachmentId,
                folder: itemData.folder
            };

            const response = await ApiCall("/api/v1/app/nomenklaturafile", "PUT", fileData);

            if (response.status === 200) {
                Alert.alert("Success", "Muvaffaqiyatli saqlandi.");
                setFileDescription(""); // Reset the description field
                setFileUri(null); // Clear the selected file
                setIsFormVisible(false); // Hide form again
                fetchFiles(); // Refresh the list
            } else {
                Alert.alert("Error", "Failed to save file details.");
            }
        } catch (error) {
            console.error("Save Details Error:", error);
            Alert.alert("Error", "An error occurred while saving file details.");
        }
    };

    const filteredFiles = files.filter((file) => {
        const descriptionMatch = file.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const dateMatch = new Date(file.createdAt).toLocaleDateString().includes(searchQuery);
        return descriptionMatch || dateMatch;
    });
    const downloadFile = async (file) => {

        try {
            const response = await ApiCall(`/api/v1/file/getFile/${file.id}`, "GET", {
                responseType: 'blob',
            });
            if (response.status === 200) {
                const localFileUri = `${FileSystem.documentDirectory}${file.name.split("_").slice(1).join("_")}`;

                const downloadResponse = await FileSystem.downloadAsync(`${BASE_URL}/api/v1/file/getFile/${file.id}`, localFileUri);
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

    const renderFileItem = ({ item }) => (
        <View style={styles.fileItemContainer}>
            <Text style={[styles.fileText, styles.boldText]}>Izoh: {item.description || 'No description'}</Text>
            <Text style={styles.fileText}>Yuklangan vaqt: {new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text onPress={()=>downloadFile(item?.file)} style={styles.fileText}>
                Nomenklatura faylini yuklab olish: <FontAwesome  name={"download"} style={[styles.myCheck, { marginLeft: 10 }]} />


            </Text>

        </View>
    );

    return (
                <View style={styles.container}>
            {/* Button to trigger file selection */}
            {!isFormVisible && (
                <Button title="Fayl yuklash" onPress={handleUploadFile} />
            )}

            {/* File description and save form */}
            {isFormVisible && (
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="Qisqacha izoh"
                        value={fileDescription}
                        onChangeText={setFileDescription}
                    />

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveFile}>
                            <Text style={styles.buttonText}>Saqlash</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.buttonText}>Bekor qilish</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* File list */}
                    <View >
                        <Text style={styles.filesTitle}>{itemData.code}-{itemData.name} </Text>
                        <Text>{itemData.code}-0{itemData.folder} bo'yicha yuklangan fayllar</Text>
                    </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Qidiruv.."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {loading ? (
                <Text style={styles.loadingText}>Fayllar yuklanmoqda...</Text>
            ) : (
                filteredFiles.length === 0 ? (
                    <Text style={styles.noFilesText}>Fayllar mavjud emas</Text>
                ) : (
                    <FlatList
                        data={filteredFiles}
                        renderItem={renderFileItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.filesListContainer}
                    />
                )
            )}
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
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    searchInput: {
        borderRadius: 8,
        width: "100%",
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        marginBottom: 10,
        marginTop: 10,
        paddingLeft: 10,
    },
    filesTitle: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: "bold",
    },
    loadingText: {
        fontSize: 16,
        color: "gray",
    },
    filesListContainer: {
        paddingTop: 10,
        width: "100%",
    },
    fileItemContainer: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    fileText: {
        fontSize: 16,
    },
    boldText: {
        fontWeight: "bold",
    },
    descriptionInput: {
        width: "100%",
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
    },
    formContainer: {
        marginBottom: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 5,
        width: "48%",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f44336",
        padding: 10,
        borderRadius: 5,
        width: "48%",
        alignItems: "center",
    },
    buttonText: {
        color: "white",

        fontSize: 16,
    },
    noFilesText: {
        fontSize: 16,
        color: "gray",
        textAlign: "center",
        marginTop: 20,
    },
});

export default Nomenklatura;
