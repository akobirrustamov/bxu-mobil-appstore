import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert, ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "../config/ApiCall";
import DropDownPicker from "react-native-dropdown-picker";

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dropdown state handlers
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: "Talaba", value: "Talaba" },
        { label: "Professor o'qtuvchi", value: "Professor o'qtuvchi" },
    ]);

    const rolls = [
        { name: "Talaba", path: "/student" },
        { name: "Professor o'qtuvchi", path: "/staff" },
    ];

    const handleLogin = async () => {
        if (!email || !password || !selectedRole) {
            Alert.alert("Xatolik", "Iltimos ma'lumotlarni to'liq kiriting!");
            return;
        }
        setLoading(true);
        try {
            const selectedRollPath = rolls.find((role) => role.name === selectedRole)?.path;
            if (!selectedRollPath) {
                Alert.alert("Xatolik", "Noto'g'ri rol tanlandi.");
                setLoading(false);
                return;
            }

            const obj = { login: email, password };
            const response = await ApiCall(`/api/v1/app${selectedRollPath}/login`, "POST", obj);

            if (response.status === 200 && response.data) {
                const { token, role } = response.data;

                await AsyncStorage.setItem("token", token);
                await AsyncStorage.setItem("role", role);

                navigation.replace(role === "ROLE_STAFF" ? "StaffProfile" : "Profile");
                Alert.alert("Success", "Login muvaffaqiyatli!");
            } else {
                Alert.alert("Xatolik", response?.message || "Login yoki parol noto'g'ri.");
            }
        } catch (error) {
            Alert.alert("Xatolik", error.message || "Xatolik yuz berdi.");
        } finally {
            setLoading(false);
        }
    };

    return (

        <View style={styles.container}>
            <Text style={styles.title}>Tizimga kirish</Text>

            <DropDownPicker
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
            />

            <TextInput
                style={styles.input}
                placeholder="Login"
                value={email}
                onChangeText={setEmail}
                keyboardType="phone-pad"
                placeholderTextColor="#000"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Parol"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#000"
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Iltimos kuting..." : "Kirish"}
                </Text>
            </TouchableOpacity>
        </View>

    );
};

const styles = StyleSheet.create({
    centered: {
        flexGrow: 1,
        alignItems: "center",
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 40,
        color: "#333",
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    dropdown: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#007BFF",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Login;
