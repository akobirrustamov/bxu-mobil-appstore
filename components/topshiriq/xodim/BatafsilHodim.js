import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Image,
    Alert,
    ActivityIndicator,
    FlatList,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import ApiCall, { BASE_URL } from "../../../config/ApiCall";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const BatafsilHodim = ({ route, navigation }) => {
    const { itemData: item } = route.params;
    const [statistic, setStatistic] = useState(null);
    const [commands, setCommands] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false); // State for dropdown open/close
    const [items, setItems] = useState([
        { label: "Yangi buyruq", value: 1 },
        { label: "Bajarilmoqda", value: 2 },
        { label: "Tasdiqlanishi kutilmoqda", value: 3 },
        { label: "Tugatilgan", value: 4 },
    ]);

    const getStaffCommands = async () => {
        const role = await AsyncStorage.getItem("attendance");

        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem("token");

            // Declare the response variable outside the ternary operator
            let response;

            // Use the ternary operator to determine which API call to make
            // console.log(role==true)

            response = role
                ? await ApiCall(`/api/v1/app/staff/rector/statistic/${item.id}/${token}`, "GET")
                : await ApiCall(`/api/v1/app/staff/statistic/${item.id}/${token}`, "GET");

            if (response.status === 200 && response.data) {
                setStatistic(response.data);
                setCommands(response.data?.commands || []);
            } else {
                Alert.alert("Error", "Failed to fetch profile data.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred while fetching statistics.");
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        getStaffCommands();


    }, []);

    const filteredCommands = commands.filter(command => command.status === selectedStatus);

    const renderCommandItem = ({ item }) => {
        const truncatedDescription =
            item.description.length > 50
                ? item.description.substring(0, 50) + "..."
                : item.description;

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
                <Text style={styles.commandDescription}>{truncatedDescription}</Text>

                <Text style={styles.commandInfo}>
                    <Text style={styles.label}>
                        <FontAwesome name={"clock-o"} style={styles.myCheck} /> Topshiriq berilgan sana:
                    </Text>{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-GB")} {" "}
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

                <Text style={styles.commandInfo}>
                    <Text style={styles.label}>
                        <FontAwesome name={"user-o"} style={styles.myCheck} /> Topshiriq bajaruvchi:
                    </Text>{" "}
                    {item?.staff?.name || "N/A"}
                </Text>
                <Text style={styles.commandInfo}>
                    <Text style={styles.label}>
                        <FontAwesome name={"user-o"} style={styles.myCheck} /> Topshiriq beruvchi:
                    </Text>{" "}
                    {item?.commandStaff?.name || "N/A"}
                </Text>
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
                <View style={styles.box}>
                    {item.file ? (
                        <Image
                            style={styles.tinyLogo}
                            source={{ uri: `${BASE_URL}/api/v1/file/getFile/${item.file.id}` }}
                        />
                    ) : (
                        <FontAwesome name="user-circle" size={60} style={styles.adminIcon} />
                    )}
                    <Text style={styles.nameStaff}>{item.name}</Text>
                </View>

                <View style={styles.box}>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Barcha</Text>
                            <Text style={styles.tableCell}>{statistic?.allCommandsCount || 0}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Yangi</Text>
                            <Text style={styles.tableCell}>{statistic?.newCommandsCount || 0}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Jarayonda</Text>
                            <Text style={styles.tableCell}>{statistic?.inProgressCommandsCount || 0}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Bajarilgan</Text>
                            <Text style={styles.tableCell}>{statistic?.completedCommandsCount || 0}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Kutilayotgan</Text>
                            <Text style={styles.tableCell}>{statistic?.pendingCommandsCount || 0}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.filters}>
                    <DropDownPicker
                        open={open}
                        value={selectedStatus}
                        items={items}
                        setOpen={setOpen}
                        setValue={setSelectedStatus}
                        setItems={setItems}
                        placeholder="Select status"
                        style={styles.picker}
                        dropDownContainerStyle={styles.dropdownContainer}
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
    },
    profileBg: {
        width: "100%",
        flex: 1,
        paddingTop: 0,
    },
    box: {
        paddingRight: 10,
        paddingLeft: 10,
        textAlign: "center",
        justifyContent: "center",
    },
    tinyLogo: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 2,
        margin: "auto",
        borderColor: "rgba(0, 0, 0, 0.7)",
    },
    nameStaff: {
        marginTop: 5,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    table: {
        borderWidth: 1,
        borderColor: "#ccc",
        marginTop: 20,
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    tableCell: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    filters: {
        margin: 10,
    },
    picker: {
        height: 50,
        width: "100%",
        backgroundColor: "#f2f2f2",
        borderRadius: 5,
    },
    dropdownContainer: {
        backgroundColor: "#f2f2f2",
        borderColor: "#ccc",
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
        paddingLeft: 5,
        marginRight: 10,
        fontWeight: "bold",
        color: "#333",
    },
});

export default BatafsilHodim;