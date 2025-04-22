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
import StarRating from 'react-native-star-rating-widget';

const BatafsilBuyruq = ({ route, navigation }) => {
    const { itemData: item } = route.params; // Correctly map itemData to item
    const [accept, setAccept] = useState(0)
    const now = new Date();
    const timeLimitDate = new Date(item?.timeLimit);
    const timeDifferenceInMs = timeLimitDate - now;
    const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60);
    const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);
    const remainingHours = Math.floor(timeDifferenceInHours % 24);
    const [history, setHistory] = useState([])
    const [rating, setRating] = useState([])
    const [fileUri, setFileUri] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [responseText,setResponseText] = useState("")
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
    useEffect(() => {
        getHistory(item?.id)
    }, [item]);
    const getHistory = async (id) => {
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
        setIsLoading(true)
        try {
            if (!fileUri || !fileName) {
                return;
            }
            const formData = new FormData();
            formData.append("photo", {
                uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
                name: fileName,
                type: "application/pdf",
            });
            formData.append("prefix", `/command/${item.commandStaff.name}`);
            const response = await ApiCall(`/api/v1/file/upload`, "POST", formData, {
                "Content-Type": "multipart/form-data",
            });
            if (response.status === 200 && response.data) {
                return response.data
                Alert.alert("Success", "File uploaded successfully.");
            } else {
                Alert.alert("Error", "Failed to upload file.");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred during file upload.");
        }
        setIsLoading(false)
    };

    const rejectCommand = async () => {
        setIsLoading(true)
        try {
            const obj = {
                responseText,
                fileId: fileUri ? null : await handleFileUpload()
            };

            const response = await ApiCall(`/api/v1/app/staff/reject/${item?.id}`, "POST", obj);
            if (response.status === 200 && response.data) {
                Alert.alert("Success", "Topshiriq muvaffaqiyatli qaytarildi.");

                navigation.goBack();
            } else {
                Alert.alert("Error", "Failed to fetch profile data.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
        }
        setIsLoading(false)
    };

    const acceptCommand = async () => {
        setIsLoading(true);
        console.log("hihihihihihihihi")
        try {
            const response = await ApiCall(`/api/v1/app/staff/completed/${item?.id}/${5}`, "POST");
            if (response.status === 200 && response.data) {
                Alert.alert("Success", "Topshiriq muvaffaqiyatli qabul qilindi.");
                navigation.goBack();
            } else {
                Alert.alert("Error", "Failed to complete command.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
        }
        setIsLoading(false);
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

                    <View style={styles.box} key={item?.id}>
                        <Text style={styles.commandTitle}>{item?.text}</Text>
                        <Text  style={styles.commandDescription}>
                           <Text style={styles.label}>
                               <FontAwesome name={"archive"} style={styles.myCheck} /> Buyruq mazmunio:
                        </Text>{" "}
                            {item?.description }
                        </Text>
                        <Text style={styles.commandInfo}>
                            <Text style={styles.label}>
                                <FontAwesome name={"clock-o"} style={styles.myCheck} /> Topshiriq berilgan sana:
                            </Text>{" "}
                            {new Date(item?.createdAt).toLocaleDateString("en-GB")},{" "}
                            {new Date(item?.createdAt).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                        <Text style={styles.commandInfo}>
                            <Text style={styles.label}>
                                <FontAwesome name={"clock-o"} style={styles.myCheck} /> Bajarish muddati:
                            </Text>{" "}
                            {`${timeLimitDate.toLocaleDateString("en-GB")}, ${timeLimitDate.toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}`}
                        </Text>
                        {item?.responseTime&&
                            <Text style={styles.commandInfo}>
                                <Text style={styles.label}>
                                    <FontAwesome name={"clock-o"} style={styles.myCheck} /> Yuklangan muddati:
                                </Text>{" "}
                                {`${timeLimitDate.toLocaleDateString("en-GB")}, ${timeLimitDate.toLocaleTimeString("en-GB", {
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
                        <Text style={styles.commandInfo}>
                            <Text style={styles.label}>
                                <FontAwesome name={"user-o"} style={styles.myCheck} /> Topshiriq bajaruvchi:
                            </Text>{" "}
                            {item?.staff?.name || "N/A"}
                        </Text>

                        {item?.file && (
                            <View  style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                <Text onPress={()=>downloadFile(item?.file)}  style={styles.commandInfo}>
                                    <Text style={styles.label}>
                                        <FontAwesome name={"file-o"} style={styles.myCheck} /> Topshiriq fayli:
                                    </Text>{" "}
                                    {item?.file?.name?.split("_").slice(1).join("_") || "N/A"}
                                </Text>
                                <FontAwesome onPress={()=>downloadFile(item?.file)} name={"download"} style={[styles.myCheck, { marginLeft: 10 }]} />
                            </View>
                        )}
                        {item?.responseFile && (
                            <View  style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                <Text onPress={()=>downloadFile(item?.responseFile)} style={styles.commandInfo}>
                                    <Text style={styles.label}>
                                        <FontAwesome name={"file-o"} style={styles.myCheck} /> Javob fayli:
                                    </Text>{" "}
                                    {item?.responseFile?.name?.split("_").slice(1).join("_") || "N/A"}
                                </Text>
                                <FontAwesome onPress={()=>downloadFile(item?.responseFile)} name={"download"} style={[styles.myCheck, { marginLeft: 10 }]} />
                            </View>
                        )}
                        <Text style={styles.commandInfo}>
                            <Text style={styles.label}>
                                <FontAwesome name={"star"} style={styles.myCheck} /> Topshiriq bali:
                            </Text>{" "}
                            {item?.ball || "N/A"}
                        </Text>
                        {item?.responseText &&
                            <Text >
                                <Text style={styles.label}>
                                    <FontAwesome name={"archive"} style={styles.myCheck} /> Javob mazmuni:
                                </Text>{" "}
                                {item?.responseText}
                            </Text>
                        }
                        <View style={styles.checked}>

                        </View>

                    </View>



                    {(item?.status===2 || item?.status===1) &&
                        <View style={styles.box}>
                            <View style={styles.timeIndicatorContainer}>
                                <View
                                    style={[
                                        styles.timeIndicatorCircleTime,
                                        { backgroundColor: circleColor },
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.timeIndicatorText,
                                        { color: timeDifferenceInHours < 0 ? "red" : "black" },
                                    ]}
                                >
                                    {timeText}
                                </Text>
                            </View>
                        </View>
                    }

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
                        <Text style={styles.noHistory}>Topshiriq hali qabul qilinmagan!</Text>
                    )}


                    {item?.status === 3 && (
                        <View >
                            <View style={styles.accept}>
                                <Button title="Qabul qilish" onPress={acceptCommand} />
                                <Button title="Rad etish" onPress={() => setAccept(2)} />
                            </View>

                            {/*{accept === 1 && (*/}
                            {/*    <View>*/}
                            {/*        <Text>Topshiriq bajarilishini baholang</Text>*/}
                            {/*        <StarRating*/}
                            {/*            enableHalfStar={false}*/}
                            {/*            rating={rating}*/}
                            {/*            onChange={setRating}*/}
                            {/*        />*/}
                            {/*        <Button onPress={acceptCommand} title="Topshiriqni qabul qilish" />*/}
                            {/*    </View>*/}
                            {/*)}*/}

                            {accept === 2 && (
                                <View style={styles.box}>
                                    <Text style={styles.commandTitle}>Topshiriqni rad etish sababini kiriting</Text>
                                    <TextInput
                                        value={responseText}
                                        onChangeText={setResponseText}
                                        placeholder="Sabab matni"
                                        placeholderTextColor="#000"

                                        style={styles.input}
                                    />
                                    <TouchableOpacity style={styles.button} onPress={handleDocumentPick}>
                                        {fileName ? (
                                            <View style={styles.fileDiv}>
                                                <FontAwesome
                                                    style={{width:18}}
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
                                    <Button onPress={rejectCommand} title="Sababni yuborish" />
                                </View>
                            )}
                        </View>
                    )}


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
    paddingForEnd:{
        marginBottom:40,
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
    timeIndicatorCircleTime:{
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    timeIndicatorText: {
        fontSize: 14,
    },
    input:{
        padding: 5,
        width: "90%",
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
    noHistory:{
        padding:10,
        color:"red"
    },
    accept:{
        padding:10,
        paddingTop:10,
        justifyContent: "space-between",
        marginTop: 20,
        flexDirection: "row",
    },
    button: {
        paddingTop: 12,
        paddingLeft:5,
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
        width:"100%"
    },

});

export default BatafsilBuyruq;
