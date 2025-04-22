import React, {useCallback, useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Alert,
    ActivityIndicator,
    TextInput,
    Button,
    ScrollView,
    TouchableOpacity, Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../../../config/ApiCall";

import { FontAwesome } from "@expo/vector-icons";



const Xodimlar = () => {
    const navigation = useNavigation();

    const [administrator, setAdministrator] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [listStaff, setListStaff] = useState([]);
    const [expandedRank, setExpandedRank] = useState(null);


    const toggleExpandRank = (rankId) => {
        setExpandedRank(expandedRank === rankId ? null : rankId);
    };


    useEffect(() => {
        fetchProfileData();
    }, [navigation]);
    const fetchProfileData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const role = await AsyncStorage.getItem("role");

            if (!token || !role) {
                navigation.replace("Login");
                return;
            }

            if (role === "ROLE_STAFF") {
                const response = await ApiCall(`/api/v1/app/staff/me/${token}`, "GET");
                if (response.status === 200 && response.data) {
                    setAdministrator(response.data);
                } else {
                    Alert.alert("Error", "Failed to fetch profile data.");
                    navigation.replace("Login");
                }

                const com = await ApiCall(`/api/v1/app/staff/commander/${token}`, "GET");
                if (com.status === 200 && com.data) {
                    if (com.data.length > 0) {
                        const resListStaff = await ApiCall(`/api/v1/app/commander/list-staff/${com.data[0]?.rank?.id}`, "GET");
                        setListStaff(resListStaff.data);
                    }
                } else {
                    Alert.alert("Error", "Failed to fetch commander data.");
                }
            } else {
                navigation.replace("Login");
            }
        } catch (error) {
            Alert.alert("Error", error.message || "An error occurred.");
            navigation.replace("Login");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigateToDetail = useCallback((item) => {
        navigation.navigate("Batafsil xodim", { itemData: item }); // Pass full item data as props
    }, [navigation]);


    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }




    return (
        <ScrollView contentContainerStyle={styles.centered}>
            <ImageBackground source={require("../../../assets/newbg.jpg")} resizeMode="repeat" style={styles.profileBg}>
                <Text style={styles.xodim}> <FontAwesome style={{width:18}} name="users" size={20}/> Xodimlarni tanlang</Text>
                {listStaff.map((item) => (
                    <View key={item.rank.id} style={styles.rankContainer}>
                        <TouchableOpacity onPress={() => toggleExpandRank(item.rank.id)} style={styles.rankHeader}>
                            <View style={[ item.staff.length === 0 && styles.disabledRank]}>
                                <View style={styles.rankHeader}>
                                    <FontAwesome style={styles.icons} name={"users"}/>

                                    <Text style={[ item.staff.length === 0 ? styles.disabledRank:styles.rankTitle]}>- {item.rank.name}</Text>
                                </View>
                            </View>


                        </TouchableOpacity>

                        {expandedRank === item.rank.id && (
                            <View style={styles.staffList}>
                                {item.staff.length > 0 ? (
                                    item.staff.map((staffMember, index) => (
                                        <TouchableOpacity key={index} style={styles.staffItem}   onPress={() => handleNavigateToDetail(staffMember)}>
                                            <FontAwesome style={styles.iconUser} name={"user"}/>

                                            <Text style={styles.staffName}>{staffMember.name}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text>No staff assigned</Text>
                                )}
                            </View>

                        )}
                    </View>
                ))}



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
        height: "110%",
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
        padding:5,
        flexDirection: "row",
        justifyContent: "flex-start", // Aligns items to the left
        alignItems: "center", // Ensures checkbox and text are vertically aligned
    },
    rankTitle: {
        width:"90%",
        fontSize: 16,
        fontWeight: "bold",
    },


    staffItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom:5

    },
    staffName: {
        fontSize: 14,
    },
    disabledRank: {
        width:"90%",
        color: "gray",
        textDecorationLine: "line-through",
    },
    submitButton: {
        backgroundColor: "green",
        height:50,
        borderRadius: 5,
        marginTop: 20,
        width: "90%",
        alignItems: "center",
    },
    submitButtonText: {
        marginTop:10,
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
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
    time:{
        margin:10,
        fontSize: 16,
        textAlign:"center",
    },
    ramka:{
        borderColor: "#ccc",
        width:"90%",
        borderWidth:1,
        borderRadius:4,
        padding:5,
        marginBottom:10
    },
    xodim:{
        marginBottom:5,
        marginTop:10,
        fontSize: 20,
    },
    icons:{
        width:30,
        margin:2
    },
    iconUser:{
        width:30,
        marginLeft:30,
        marginRight:0,
    },

});

export default Xodimlar;
