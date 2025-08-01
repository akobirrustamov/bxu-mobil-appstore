import React, {useEffect, useState} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
} from "react-native";
import {FontAwesome} from "@expo/vector-icons";

// Screens
import NotificationHistory from "./components/notifications/NotificationHistory";
import HomeScreen from "./components/HomeScreen";
import DetailScreen from "./components/DetailScreen";
import Rektorat from "./components/Rektorat";
import Student from "./components/Student";
import Taklif from "./components/Taklif";
import Teacher from "./components/Teacher";
import Abiturient from "./components/Abiturient";
import Nomenklatura from "./components/nomenklatura/Nomenklatura";
import Login from "./components/Login";
import Profile from "./components/Profile";
import TestInputs from "./components/nomenklatura/TestInputs";
import StaffProfile from "./components/StaffProfile";
import Topshiriq from "./components/topshiriq/Topshiriq";
import Topshiriqlar from "./components/topshiriq/topshiriq/Topshiriqlar";
import Buyruqlar from "./components/topshiriq/buyruq/Buyruqlar";
import Xodimlar from "./components/topshiriq/xodim/Xodimlar";
import NewCommand from "./components/topshiriq/buyruq/NewCommand";
import InProgress from "./components/topshiriq/buyruq/InProgress";
import Pending from "./components/topshiriq/buyruq/Pending";
import Completed from "./components/topshiriq/buyruq/Completed";
import TNewCommand from "./components/topshiriq/topshiriq/NewCommand";
import TInProgress from "./components/topshiriq/topshiriq/InProgress";
import TPending from "./components/topshiriq/topshiriq/Pending";
import TCompleted from "./components/topshiriq/topshiriq/Completed";
import JavobTopshiriq from "./components/topshiriq/topshiriq/JavobTopshiriq";
import BatafsilBuyruq from "./components/topshiriq/buyruq/BatfsilBuyruq";
import BatafsilHodim from "./components/topshiriq/xodim/BatafsilHodim";
import Groups from "./components/group/Groups";
import DetailGroup from "./components/group/DetailGroup";
import DarsJadvali from "./components/dars_jadvali/DarsJadvali";
import DarsJadvalModal from "./components/dars_jadvali/DarsJadvalModal";
import GroupDarsJadval from "./components/dars_jadvali/GroupDarsJadval";
import WeaklyGroup from "./components/dars_jadvali/WeaklyGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

export default function App() {
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
        // Fake data, replace with your API logic
        const fetchNotifications = async () => {
            const notifications = [
                {id: 1, read: false},
                {id: 2, read: true},
                {id: 3, read: false},
                {id: 4, read: true},
                {id: 5, read: false},
                {id: 6, read: false},
                {id: 7, read: true},
                {id: 8, read: false},
                {id: 9, read: false},
                {id: 10, read: true},
            ];
            const unread = notifications.filter((n) => !n.read).length;
            setUnreadCount(unread);
        };

        fetchNotifications();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                        headerStyle: {backgroundColor: "white"},
                    }}
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={({navigation}) => ({
                            title: "Bosh sahifa",
                            headerTitleAlign: "center",
                            headerLeft: () => (
                                <TouchableOpacity
                                    style={styles.iconContainer}
                                    onPress={async () => {
                                        try {
                                            const storedRole = await AsyncStorage.getItem("role");

                                            if (storedRole === "ROLE_STUDENT") {
                                                navigation.navigate("Profile");
                                            } else if (storedRole === "ROLE_STAFF") {
                                                navigation.navigate("StaffProfile");
                                            } else if (!storedRole) {
                                                // Если роль отсутствует, пользователь не авторизован
                                                navigation.navigate("Login");
                                            } else {
                                                alert("Noma'lum rol: " + storedRole);
                                            }
                                        } catch (error) {
                                            console.error("Roli olishda xatolik:", error);
                                            alert("Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.");
                                        }
                                    }}
                                >
                                    <FontAwesome name="user" size={24} color="#000"/>
                                </TouchableOpacity>


                            ),
                            headerRight: () => (
                                <TouchableOpacity
                                    style={styles.iconContainer}
                                    onPress={() => navigation.navigate("NotificationHistory")}
                                >
                                    <FontAwesome name="bell" size={24} color="#000"/>
                                    {unreadCount > 0 && (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{unreadCount}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ),
                        })}
                    />
                    <Stack.Screen name="NotificationHistory" component={NotificationHistory}/>
                    <Stack.Screen name="Detail" component={DetailScreen}/>
                    <Stack.Screen name="Nomenklatura" component={Rektorat}/>
                    <Stack.Screen name="TestInputs" component={TestInputs}/>
                    <Stack.Screen name="Student" component={Student}/>
                    <Stack.Screen name="Taklif" component={Taklif}/>
                    <Stack.Screen name="Abiturient" component={Abiturient}/>
                    <Stack.Screen name="Teacher" component={Teacher}/>
                    <Stack.Screen name="Login" component={Login}/>
                    <Stack.Screen name="Profile" component={Profile}/>
                    <Stack.Screen name="Topshiriq" component={Topshiriq}/>
                    <Stack.Screen name="Topshiriqlar" component={Topshiriqlar}/>
                    <Stack.Screen name="Yangi buyruq" component={NewCommand}/>
                    <Stack.Screen name="Jarayondagi buyruqlar" component={InProgress}/>
                    <Stack.Screen name="Kutilayotgan buyruqlar" component={Pending}/>
                    <Stack.Screen name="Tugallangan buyruqlar" component={Completed}/>
                    <Stack.Screen name="Batafsil buyruq" component={BatafsilBuyruq}/>
                    <Stack.Screen name="Yangi topshiriqlar" component={TNewCommand}/>
                    <Stack.Screen name="Jarayondagi topshiriqlar" component={TInProgress}/>
                    <Stack.Screen name="Kutilayotgan topshiriqlar" component={TPending}/>
                    <Stack.Screen name="Tugallangan topshiriqlar" component={TCompleted}/>
                    <Stack.Screen name="Batafsil topshiriq" component={JavobTopshiriq}/>
                    <Stack.Screen name="Buyruqlar" component={Buyruqlar}/>
                    <Stack.Screen name="Xodimlar" component={Xodimlar}/>
                    <Stack.Screen name="Batafsil xodim" component={BatafsilHodim}/>
                    <Stack.Screen name="StaffProfile" component={StaffProfile}/>
                    <Stack.Screen name="Nomenklatura bo'limi" component={Nomenklatura}/>
                    <Stack.Screen name="Guruhlar" component={Groups}/>
                    <Stack.Screen name="Talabalar" component={DetailGroup}/>
                    <Stack.Screen name="KunlikJadval" component={DarsJadvali}/>
                    <Stack.Screen name="GuruhJadval" component={GroupDarsJadval}/>
                    <Stack.Screen name="Jadval" component={DarsJadvalModal}/>
                    <Stack.Screen name="HaftalikJadval" component={WeaklyGroup}/>
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "red",
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
});

