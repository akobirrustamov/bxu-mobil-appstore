import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
export let BASE_URL
// BASE_URL = "http://localhost:8080";
BASE_URL = "https://buxpxti.uz";
// BArSE_URL = "http://83.147.246.81:8090";
const ApiCall = async (endpoint, method = "GET", data = null, additionalHeaders = {}) => {
    try {
        const token = await AsyncStorage.getItem("token");
        const role = await AsyncStorage.getItem("role");

        const headers = {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
            Role: role || "",
            ...additionalHeaders,
        };
        const config = {
            url: `${BASE_URL}${endpoint}`,
            method,
            headers,
        };
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
            config.data = data;
        } else if (method.toUpperCase() === "GET" && data) {
            config.params = data; // For GET requests, use `params` instead of `data`
        }
        const response = await axios(config);


        return response;
    } catch (error) {
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message || "Xatolik yuz berdi",
        };
    }
};

export default ApiCall;
