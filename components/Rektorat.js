import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    FlatList,
    ImageBackground,
    TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../config/ApiCall"; // Your API utility
import {useFocusEffect, useNavigation} from "@react-navigation/native";

const Rektorat = () => {
    const [nomenklaturaData, setNomenklaturaData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [rector, setRector] = useState(false);

    useEffect(() => {
        const fetchNomenklatura = async () => {

        };
        fetchNomenklatura();
    }, [navigation]);
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                const attendanceValue = await AsyncStorage.getItem("attendance");
                setRector(attendanceValue === "true"); // Convert string to boolean
                if(attendanceValue === "true"){
                    try {
                        setLoading(true);
                        const response = await ApiCall(`/api/v1/app/nomenklatura`, "GET");
                        if (response.status === 200 && response.data) {
                            console.log(response.data)
                            setNomenklaturaData(response.data)
                        } else {
                            Alert.alert("Error", "Failed to fetch files.");
                        }
                    } catch (error) {
                        console.error("Fetch Error:", error);
                    } finally {
                        setLoading(false);
                    }

                }else {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        const role = await AsyncStorage.getItem("role");

                        if (!token || role !== "ROLE_STAFF") {
                            Alert.alert("Access Denied", "You are not authorized.");
                            navigation.navigate("Home");
                            return;
                        }
                        const response = await ApiCall(`/api/v1/app/nomenklatura/me/${token}`, "GET");
                        if (response.status === 200 && response.data) {
                            setNomenklaturaData(response.data);
                        } else {
                            Alert.alert("Error", "Failed to fetch Nomenklatura.");
                            navigation.navigate("Home");
                        }
                    } catch (error) {
                        Alert.alert("Error", "An unexpected error occurred.");
                        navigation.navigate("Home");
                    } finally {
                        setLoading(false);
                    }
                }
            };
            fetchData();
        }, []) // Runs on every screen focus
    );

    const handleNavigateToDetail = useCallback((item, number) => {
        const updatedItem = { ...item, folder: number }; // Add folder number to item data
        navigation.navigate("Nomenklatura bo'limi", { itemData: updatedItem });
    }, [navigation]);
    const renderNomenklaturaItem = ({ item }) => {
        // Generate an array from 1 to numberPackages
        const subFolders = Array.from({ length: item.numberPackages }, (_, index) => ({
            id: index + 1, // Unique ID for each subfolder
            title: `${item.code}-0${index + 1}`, // Subfolder title
            folder: index + 1, // Folder number to pass
        }));

        return (
            <View style={styles.itemContainer}>
                <Text style={styles.itemText}>{item.code} - {item.name}</Text>
                <Text style={styles.itemDate}>
                    Yaratilgan vaqti: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.itemDate}>
                    Masul: {item.user.name}
                </Text>
                <View style={styles.subFoldersContainer}>
                    {subFolders.map((subFolder) => renderSubFolderCard(subFolder, item))}
                </View>
            </View>
        );
    };

    const renderSubFolderCard = (subFolder, item) => (
        <TouchableOpacity
            key={subFolder.id} // Use unique ID as key
            style={styles.subFolderCard}
            onPress={() => handleNavigateToDetail(item, subFolder.folder)}
        >
            <Text style={styles.subFolderTitle}>{subFolder.title}</Text>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../assets/newbg.jpg")}
                resizeMode={"repeat"}
                style={styles.profileBg}
            >
                <View style={styles.box}>
                    <Text style={styles.title}>Nomenklatura bo'limi</Text>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : (
                        <FlatList
                            data={nomenklaturaData}
                            renderItem={renderNomenklaturaItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContainer}
                        />
                    )}
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        width: "90%",
        marginTop: 20,
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    profileBg: {
        flex: 1,
        alignItems: "center",
        width: "100%",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    loadingText: {
        fontSize: 16,
        textAlign: "center",
        color: "gray",
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    itemText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    itemDate: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
    },
    subFoldersContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
    },
    subFolderCard: {
        backgroundColor: "#e0f7fa",
        padding: 10,
        margin: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#00796b",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 100, // Ensures consistent card size
    },
    subFolderTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#004d40",
        textAlign: "center",
    },
});

export default Rektorat;
