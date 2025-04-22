import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    Button,
    Alert,
    Platform, ScrollView, ActivityIndicator
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import ApiCall, {BASE_URL} from "../../../config/ApiCall";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
const JavobTopshiriq = ({ route, navigation }) => {
    const { itemData: item } = route.params; // Correctly map itemData to item
    const [expanded, setExpanded] = useState(false);
    const [history, setHistory] = useState([])
    const now = new Date();
    const tileLimitDate = new Date(item.timeLimit);
    const timeDifferenceInMs = tileLimitDate - now;
    const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60);
    const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);
    const remainingHours = Math.floor(timeDifferenceInHours % 24);
    const [responseText, setResponseText] = useState("");
    const [fileUri, setFileUri] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    let circleColor = "red";
    let timeText = `Qolgan vaqt: ${Math.abs(timeDifferenceInDays)} kun ${Math.abs(remainingHours)} soat`;
    if (timeDifferenceInHours < 0) {
        timeText = `Topshiriq muddatida bajarilmadi: ${Math.abs(timeDifferenceInDays)} kun va ${Math.abs(remainingHours)} soat o'tdi`;
        circleColor = "red";
    } else if (timeDifferenceInHours > 24) {
        circleColor = "green";
    } else if (timeDifferenceInHours > 12) {
        circleColor = "yellow";
    }
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };
    const handleDocumentPick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
            });
            if (result.canceled ) return;
                setFileUri(result.assets[0].uri);
                setFileName(result.assets[0].name);

        } catch (error) {
            Alert.alert("Error", "An error occurred while selecting the file.");
        }
    };
    const handleFileUpload = async () => {
        setIsLoading(true)
        try {
            if (!fileUri || !fileName) {
                Alert.alert("Error", "Please select a file first.");
                return null;
            }

            const formData = new FormData();
            formData.append("photo", {
                uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
                name: fileName,
                type: "application/pdf",
            });
            formData.append("prefix", `/command/${item?.staff.name}`);

            const response = await ApiCall(`/api/v1/file/upload`, "POST", formData, {
                "Content-Type": "multipart/form-data",
            });

            if (response.status === 200 && response.data) {
                return response.data; // Assume `response.data` contains the file ID.
            } else {
                Alert.alert("Error", "Failed to upload file.");
                return null;
            }

        } catch (error) {
            console.error("Upload Error:", error);
            Alert.alert("Error", "An error occurred during file upload.");
            return null;
        }
        setIsLoading(false)

    };

    const postResponse = async () => {
        setIsLoading(true)
        if (!responseText && !fileUri) {
            Alert.alert("Error", "Response text or file is required.");
            setIsLoading(false)
            return;
        }

        try {
            let file = null;
            if (fileUri) {
                file = await handleFileUpload();
                if (!file) {
                    Alert.alert("Error", "File upload failed.");
                    return;
                }
            }

            const obj = {
                responseText: responseText,
               fileId: file,
            };

            const response = await ApiCall(`/api/v1/app/staff/my-commands/${item.id}`, "PUT", obj);

            if (response.status === 200) {
                Alert.alert("Success", "Response submitted successfully.");
                navigation.goBack();
            } else {
                Alert.alert("Error", "Failed to submit the response.");
            }
        } catch (error) {
            console.error("Error submitting response:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }
        setIsLoading(false)
    };


    useEffect(() => {
        getHistory(item.id)
    }, [item]);
    const getHistory = async (id) => {
        setIsLoading(true)
        try {

            const response = await ApiCall(`/api/v1/app/command/get-history/${id}`, "GET");
            if (response.status === 200 && response.data) {
                setHistory(response.data);
            } else {
                Alert.alert("Error", "Failed to fetch profile data.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
        }
        setIsLoading(false)
    };

    const downloadFile = async (file) => {
        setIsLoading(true)
        try {
            const response = await ApiCall(`/api/v1/file/getFile/${file.id}`, "GET", {
                responseType: 'blob',  // Use 'blob' to handle the file content as a stream
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
        setIsLoading(false)
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
        <View style={styles.centered}>
            <ImageBackground source={require("../../../assets/newbg.jpg")} resizeMode="repeat" style={styles.profileBg}>
                <ScrollView>
                <View style={[styles.box, styles.paddingForEnd]}>
                    <View style={styles.box} key={item.id}>
                        <Text style={styles.commandTitle}>{item.text}</Text>
                        <Text  style={styles.commandDescription}>
                            <Text style={styles.label}>
                                <FontAwesome name={"archive"} style={styles.myCheck} /> Topshiriq mazmuni:
                                 </Text>{" "}
                            {item.description } </Text>
                        <Text style={styles.commandInfo}>
                            <Text style={styles.label}>
                                <FontAwesome name={"clock-o"} style={styles.myCheck} /> Topshiriq berilgan sana:
                            </Text>{" "}
                            {new Date(item.createdAt).toLocaleDateString("en-GB")}{" "}
                            {new Date(item.createdAt).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                        <Text style={styles.commandInfo}>
                            <Text style={styles.label}>
                                <FontAwesome name={"clock-o"} style={styles.myCheck} /> Bajarish muddati:
                            </Text>{" "}
                            {`${tileLimitDate.toLocaleDateString("en-GB")} ${tileLimitDate.toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}`}
                        </Text>
                        {item.responseTime&&
                            <Text style={styles.commandInfo}>
                                <Text style={styles.label}>
                                    <FontAwesome name={"clock-o"} style={styles.myCheck} /> Yuklangan muddati:
                                </Text>{" "}
                                {`${tileLimitDate.toLocaleDateString("en-GB")} ${tileLimitDate.toLocaleTimeString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}`}
                            </Text>
                        }
                        <Text style={styles.commandInfo}>
                            <Text style={styles.label}>
                                <FontAwesome name={"user-o"} style={styles.myCheck} /> Topshiriq beruvchi:
                            </Text>{" "}
                            {item?.commandStaff?.name || "N/A"}
                        </Text>

                        {item.file && (
                            <View  style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                <Text onPress={()=>downloadFile(item.file)}  style={styles.commandInfo}>
                                    <Text style={styles.label}>
                                        <FontAwesome name={"file-o"} style={styles.myCheck} /> Topshiriq fayli:
                                    </Text>{" "}
                                    {item.file?.name?.split("_").slice(1).join("_") || "N/A"}
                                </Text>
                                <FontAwesome onPress={()=>downloadFile(item.file)} name={"download"} style={[styles.myCheck, { marginLeft: 10 }]} />
                            </View>
                        )}
                        {item.responseFile && (
                            <View  style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                <Text onPress={()=>downloadFile(item.responseFile)} style={styles.commandInfo}>
                                    <Text style={styles.label}>
                                        <FontAwesome name={"file-o"} style={styles.myCheck} /> Javob fayli:
                                    </Text>{" "}
                                    {item.responseFile?.name?.split("_").slice(1).join("_") || "N/A"}
                                </Text>
                                <FontAwesome onPress={()=>downloadFile(item.responseFile)} name={"download"} style={[styles.myCheck, { marginLeft: 10 }]} />
                            </View>
                        )}
                        {item.responseText &&
                            <Text >
                                <Text style={styles.label}>
                                    <FontAwesome name={"archive"} style={styles.myCheck} /> Javob mazmuni:
                                </Text>{" "}
                                {item.responseText}
                            </Text>
                        }
                        <View style={styles.checked}>

                        </View>

                    </View>
                    {history.length > 0 ? (
                        <View>
                            <Text style={styles.commandTitle}>Topshiriq tarixi</Text>
                            {history?.map((his, index) => {
                                // Check data validity
                                if (!his || !his.fromStatus || !his.toStatus) return null;

                                // Format date and time
                                const date = his.createdAt
                                    ? new Date(his.createdAt).toLocaleDateString("en-GB")
                                    : "Noma'lum sana";
                                const time = his.createdAt
                                    ? new Date(his.createdAt).toLocaleTimeString("en-GB", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : "Noma'lum vaqt";

                                // Return corresponding status message
                                return (
                                    <View key={index} style={styles.box}>
                                        {his.fromStatus === 1 && his.toStatus === 2 && (
                                            <Text>
                                                <View
                                                    style={[
                                                        styles.timeIndicatorCircle,

                                                    ]}
                                                /> Topshiriq {item?.staff?.name || "Noma'lum xodim"} tomonidan {date}, {time} da ko'rildi.
                                            </Text>
                                        )}
                                        {his.fromStatus === 2 && his.toStatus === 3 && (
                                            <Text>
                                                <View
                                                    style={[
                                                        styles.timeIndicatorCircle,

                                                    ]}
                                                /> Topshiriq {item?.staff?.name || "Noma'lum xodim"} tomonidan {date}, {time} da yuklandi.
                                            </Text>
                                        )}
                                        {his.fromStatus === 3 && his.toStatus === 1 && (
                                            <Text>
                                                <View
                                                    style={[
                                                        styles.timeIndicatorCircle,

                                                    ]}
                                                /> Topshiriq {item?.commandStaff?.name || "Noma'lum xodim"} tomonidan {date}, {time} da qaytarildi.
                                            </Text>
                                        )}
                                        {his.fromStatus === 3 && his.toStatus === 4 && (
                                            <Text>
                                                <View
                                                    style={[
                                                        styles.timeIndicatorCircle,

                                                    ]}
                                                /> Topshiriq {item?.commandStaff?.name || "Noma'lum xodim"} tomonidan {date}, {time} da qabul qilindi.
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text style={styles.noHistory}>Topshiriq tarixi mavjud emas.</Text>
                    )}



                    {item.status===2&&
                                <View style={styles.box}>
                                    <Text style={styles.commandTitle}>Topshiriqni yuklash</Text>
                                    <TextInput
                                        value={responseText}
                                        onChangeText={setResponseText}
                                        placeholder="Javob matni"
                                        placeholderTextColor="#000"
                                        style={styles.input}
                                    />
                                    <TouchableOpacity style={styles.button} onPress={handleDocumentPick}>
                                        {fileName ? (
                                            <View style={styles.fileDiv}>
                                                <FontAwesome
                                                    name="file-o"
                                                    size={20}

                                                />
                                                <Text > Fayl: {fileName}</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.fileDiv}>
                                                <FontAwesome style={{width:18}} name="file-o" size={20}/>
                                                <Text> Topshiriq fayli</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>


                                    <Button style={{marginBottom:10}} onPress={postResponse} title={"Javob yuborish"} />
                                </View>
                        }
                </View>
        </ScrollView>
            </ImageBackground>
        </View>

    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
    },

    profileBg: {
        width: "100%",
        flex: 1,
        paddingTop: 0,
    },
    box: {
        paddingRight: 10,
        paddingLeft: 10,

    },
    paddingForEnd:{
        marginBottom:40,
    },
    commandCard: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    commandTitle: {
        marginTop:10,
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    commandDescription: {
        fontSize: 16,
        marginBottom: 10,
    },
    commandInfo: {
        fontSize: 14,
        marginBottom: 5,
    },
    label: {
        fontWeight: "bold",
    },
    timeIndicatorContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeIndicatorCircle: {
        borderWidth:2,
        borderColor:"blue",
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    timeIndicatorText: {
        fontSize: 14,
    },
    input:{
        padding: 5,
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 10,
    },
    fileInputContainer: {

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 100,
        width: "100%",
        margin:"auto",
        borderWidth: 2,
        borderColor: "#ccc",
        borderRadius: 12,
        backgroundColor: "rgba(52,138,230,0.75)",
        marginBottom: 20,
        padding: 10,
    },
    fileInputContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
    },
    filePlaceholder: {
        color: "white",
        fontSize: 18,
        marginTop: 10,
        textAlign: "center",
    },
    fileName: {
        color: "white",
        fontSize: 16,
        marginTop: 10,
        textAlign: "center",
        fontWeight: "bold",
    },
    button: {
        paddingTop: 12,
        paddingLeft:5,
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 10,
    },
    buttonPressed: {
        backgroundColor: "#0056b3",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
    fileDiv: {
        color: "#FFFF",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },

});

export default JavobTopshiriq;
