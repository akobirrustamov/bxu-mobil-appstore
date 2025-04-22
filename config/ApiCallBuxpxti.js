import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiCall from "./ApiCall";
import { Alert } from "react-native";

export const BASE_URL_BUXPXTI = "https://student.buxpxti.uz/rest";

const getMyCommands = async () => {
    try {
        const response = await ApiCall("/api/v1/app/admin/hemis/token/last", "GET");
        console.log(response)
        if (response.status === 200 && response?.data) {
            console.log(response)
            return response.data.name;
        } else {
            Alert.alert("Error", "Failed to fetch commands.");
            return null;
        }
    } catch (error) {
        Alert.alert("Error", "An unexpected error occurred.");
        return null;
    }
};

const ApiCallBuxpxti = async (endpoint, method = "GET", data = null, additionalHeaders = {}) => {
    try {
        const token = await getMyCommands(); // await ishlatish kerak
        const role = await AsyncStorage.getItem("role");

        const headers = {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
            Role: role || "",
            ...additionalHeaders,
        };

        const config = {
            url: `${BASE_URL_BUXPXTI}${endpoint}`,
            method,
            headers,
        };

        if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
            config.data = data;
        } else if (method.toUpperCase() === "GET" && data) {
            config.params = data;
        }

        const response = await axios(config);
        return response;
    } catch (error) {
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message || "An error occurred",
        };
    }
};

export default ApiCallBuxpxti;
