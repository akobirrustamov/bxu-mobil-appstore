import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import ApiCallBuxpxti from "../../config/ApiCallBuxpxti"; // API chaqirish funksiyasi

const Groups = ({ navigation }) => {
    const [groups, setGroups] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");

    const fetchGroups = async () => {
        try {
            let allGroups = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await ApiCallBuxpxti(`/v1/data/group-list?page=${page}`, "GET");

                if (response.data && response.data.success) {
                    const { items, pagination } = response.data.data;
                    allGroups = [...allGroups, ...items];

                    if (page < pagination.pageCount) {
                        page += 1;
                    } else {
                        hasMore = false;
                    }
                } else {
                    console.error("Failed to fetch groups on page", page, ":", response.message);
                    hasMore = false;
                }
            }

            setGroups(allGroups);

            // Unikal bo‘limlarni olish
            const uniqueDepartments = Array.from(new Set(allGroups.map((group) => group.department.name)));
            setDepartments(uniqueDepartments);

            // Mahalliy xotiradan tanlangan bo‘limni yuklash
            const storedDepartment = await AsyncStorage.getItem("selectedDepartment");
            if (storedDepartment && uniqueDepartments.includes(storedDepartment)) {
                setSelectedDepartment(storedDepartment);
            } else if (uniqueDepartments.length > 0) {
                setSelectedDepartment(uniqueDepartments[0]); // Default birinchi bo‘lim
                await AsyncStorage.setItem("selectedDepartment", uniqueDepartments[0]);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchGroups();
        }, [])
    );

    // Bo‘lim tanlanganda saqlash
    const handleDepartmentSelect = async (department) => {
        setSelectedDepartment(department);
        await AsyncStorage.setItem("selectedDepartment", department);
    };

    // Tanlangan bo‘lim asosida filtrlangan guruhlar
    const filteredGroups = groups.filter((group) => group.department.name === selectedDepartment);

    return (
        <View style={styles.container}>
            <ImageBackground source={require("../../assets/bg21.jpg")} style={styles.myBg} resizeMode="repeat">
                {/* Department Filter */}
                <ScrollView horizontal style={styles.departmentContainer}>
                    {departments.map((department, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.departmentCard, selectedDepartment === department && styles.selectedDepartmentCard]}
                            onPress={() => handleDepartmentSelect(department)}
                        >
                            <Text style={[styles.departmentText, selectedDepartment === department && styles.selectedDepartmentText]}>
                                {department}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Groups List */}
                <ScrollView style={styles.cardsContainer}>
                    <View style={styles.cardsWrapper}>
                        {filteredGroups.map((group) => (
                            <TouchableOpacity
                                key={group.id}
                                style={styles.groupCard}
                                onPress={() => navigation.navigate("Talabalar", { groupId: group.id })}
                            >
                                <Text style={styles.groupName}>{group.name}</Text>
                                <Text style={styles.groupSpecialty}>{group.specialty.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

export default Groups;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    myBg: {
        flex: 1,
        width: Dimensions.get("window").width,
    },
    departmentContainer: {
        flexDirection: "row",
        padding: 10,
    },
    departmentCard: {
        backgroundColor: "#ddd",
        borderRadius: 20,
        height: 40,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    selectedDepartmentCard: {
        backgroundColor: "#007bff",
    },
    departmentText: {
        fontSize: 14,
        color: "#333",
    },
    selectedDepartmentText: {
        color: "#fff",
        fontWeight: "bold",
    },
    cardsContainer: {
        paddingVertical: 20,
    },
    cardsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap", // Allows wrapping of cards
        justifyContent: "center", // Centers the cards
    },
    groupCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        width: 150,
        padding: 15,
        margin: 10, // Adds space between cards
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        alignItems: "center", // Center content inside the card
    },
    groupName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    groupSpecialty: {
        fontSize: 14,
        color: "#555",
    },
});
