import React, {useCallback, useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    FlatList,
    TextInput,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Button, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../../../config/ApiCall";
import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import {useNavigation} from "@react-navigation/native";

const InProgress = () => {
    const [administrator, setAdministrator] = useState(null);
    const [commands, setCommands] = useState([]);
    const [filteredCommands, setFilteredCommands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchName, setSearchName] = useState("");

    useEffect(() => {
        getMe();
    }, []);

    const getMe = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const response = await ApiCall(`/api/v1/app/staff/me/${token}`, "GET");
            if (response.status === 200 && response.data) {
                setAdministrator(response.data);
                await getMyCommands(response.data.id);
            } else {
                Alert.alert("Error", "Failed to fetch profile data.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };



    const getMyCommands = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const response = await ApiCall(`/api/v1/app/staff/my-commands/${token}/3`, "GET");
            if (response.status === 200 && response.data) {
                setCommands(response.data);
                setFilteredCommands(response.data);
            } else {
                Alert.alert("Error", "Failed to fetch commands.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        filterCommands();

    }, [searchName, commands]);

    const filterCommands = () => {
        let filtered = commands;

        if (searchName.trim()) {
            filtered = filtered.filter((cmd) =>
                cmd.commandStaff?.name?.toLowerCase().includes(searchName.toLowerCase()) ||
                cmd.text?.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredCommands(filtered);
    };


    const navigation = useNavigation();
    const handleNavigateToDetail = useCallback((item) => {
        navigation.navigate("Batafsil topshiriq", { itemData: item }); // Pass full item data as props
    }, [navigation]);



    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = (id) => {
        if(expanded===id){
            setExpanded(0)
        }else{
            setExpanded(id);

        }

    }
    const renderCommandItem = ({ item, index }) => {
        const truncatedDescription= item.description.length > 50 ? item.description.substring(0, 50) + "..." : item.description;

        const now = new Date();
        const tileLimitDate = new Date(item.timeLimit);
        const timeDifferenceInMs = tileLimitDate - now;
        const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60);
        const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);
        const remainingHours = Math.floor(timeDifferenceInHours % 24);

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


        return (
            <View style={styles.commandCard} key={item.id}>
                <Text style={styles.commandTitle}>{item.text}</Text>
                <Text onPress={()=>toggleExpanded(item.id)} style={styles.commandDescription}><FontAwesome name={"archive"} style={styles.myCheck} /> {expanded===item.id ? item.description : truncatedDescription}
                </Text>
                <Text style={styles.commandInfo}>
                    <Text style={styles.label}>
                        <FontAwesome name={"clock-o"} style={styles.myCheck} /> Topshiriq berilgan sana:
                    </Text>{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-GB")},{" "}
                    {new Date(item.createdAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
                <Text style={styles.commandInfo}>
                    <Text style={styles.label}>
                        <FontAwesome name={"clock-o"} style={styles.myCheck} /> Bajarish muddati:
                    </Text>{" "}
                    {`${tileLimitDate.toLocaleDateString("en-GB")}, ${tileLimitDate.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}`}
                </Text>
                <Text style={styles.commandInfo}>
                    <Text style={styles.label}>
                        <FontAwesome name={"user-o"} style={styles.myCheck} /> Topshiriq beruvchi:
                    </Text>{" "}
                    {item?.commandStaff?.name || "N/A"}
                </Text>
                <View style={styles.checked}>
                    <View style={styles.timeIndicatorContainer}>
                        <View
                            style={[
                                styles.timeIndicatorCircle,
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
                    {/*<View style={styles.checkIcons}>*/}
                    {/*    <FontAwesome name={"check"} />{item.status === 2 && <FontAwesome name={"check"} style={styles.myCheck} />}*/}
                    {/*</View>*/}

                </View>

                <TouchableOpacity
                    onPress={() => handleNavigateToDetail(item)}

                >

                    <Text style={{ color: "#6200EE", marginTop:10}}>Batafsil..</Text>
                </TouchableOpacity>
            </View>
        );
    };




    return (
        <View style={styles.centered}>
            <ImageBackground
                source={require("../../../assets/newbg.jpg")}
                resizeMode="repeat"
                style={styles.profileBg}
            >
                <View style={styles.filters}>
                    <TextInput
                        style={styles.input}
                        placeholder="Qidiruv.."
                        placeholderTextColor="#000"

                        value={searchName}
                        onChangeText={setSearchName}
                    />
                </View>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#6200EE" />
                ) : (
                    <FlatList
                        data={filteredCommands}
                        renderItem={renderCommandItem}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.commandList}
                    />
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
    },
    filters: {
        width: "90%",
        marginVertical: 10,
        alignSelf: "center",
    },
    input: {
        padding: 5,
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 10,
    },

    datePicker: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
        marginBottom: 10,
        elevation: 5,
    },
    dateText: {
        color: "#333",
    },
    pickerContainer: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        marginBottom: 10,
        elevation: 5,
    },
    picker: {
        height: 50,
        width: "100%",
    },
    commandList: {
        padding: 16,
    },
    commandCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingLeft: 16,
        paddingTop: 10,
        paddingBottom: 10,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    commandTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    commandDescription: {

        fontSize: 14,
        color: "#555",
        marginBottom: 4,
    },
    commandInfo: {
        fontSize: 14,
        color: "#777",
        marginBottom: 4,
    },
    label: {

        marginRight:10,
        fontWeight: "bold",
        color: "#333",
    },
    timeIndicatorContainer: {
        flexDirection: "row",
        alignItems: "center",

    },
    timeIndicatorCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    timeIndicatorText: {
        fontSize: 14,
        color: "#777",
    },
    checkIcons: {
        margin:4,
        marginTop:10,
        paddingRight:10,
        flexDirection: "row",
        alignItems: "center",

    },
    myCheck: {
        marginLeft: 5,  // Proper spacing between icons

    },
    checked:{
        display: "flex",
        flexDirection: "row",  // Make children appear in a row
        alignItems: "center",
        justifyContent:"space-between"
    }
});

export default InProgress;
