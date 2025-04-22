import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    StyleSheet,
    ImageBackground,
} from "react-native";
import ApiCallBuxpxti from "../../config/ApiCallBuxpxti";

const WeaklyGroup = ({ route }) => {
    const { groupId } = route.params;
    const [lessons, setLessons] = useState([]);
    const daysOfWeek = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

    // ScrollView uchun ref lar
    const horizontalScrollRef = useRef(null);
    const headerScrollRef = useRef(null);
    const bodyScrollRefs = useRef([]);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const { todayTimestamp, tomorrowTimestamp } = getWeekTimestamps();
            const response = await ApiCallBuxpxti(
                `/v1/data/schedule-list?lesson_date_from=${todayTimestamp}&lesson_date_to=${tomorrowTimestamp}&_group=${groupId}`,
                "GET"
            );
            setLessons(response.data.data.items);
        } catch (error) {
            console.error("Error fetching lessons:", error);
        }
    };

    const getWeekTimestamps = () => {
        const now = new Date();
        const dayOfWeek = now.getUTCDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const sundayOffset = 7 - dayOfWeek;

        const monday = new Date(now);
        monday.setUTCDate(now.getUTCDate() + mondayOffset);
        monday.setUTCHours(0, 0, 0, 0);

        const sunday = new Date(now);
        sunday.setUTCDate(now.getUTCDate() + sundayOffset);
        sunday.setUTCHours(23, 59, 59, 999);
        return {
            todayTimestamp: Math.floor(monday.getTime() / 1000),
            tomorrowTimestamp: Math.floor(sunday.getTime() / 1000),
        };
    };

    const groupLessonsByDayAndPair = () => {
        const grouped = {};
        lessons.forEach(lesson => {
            const date = new Date(lesson.lesson_date * 1000);
            const day = daysOfWeek[date.getUTCDay() - 1];
            const pair = lesson.lessonPair.name;

            if (!grouped[day]) {
                grouped[day] = {};
            }
            if (!grouped[day][pair]) {
                grouped[day][pair] = [];
            }
            grouped[day][pair].push(lesson);
        });
        return grouped;
    };

    const groupedLessons = groupLessonsByDayAndPair();
    // const uniquePairs = [...new Set(lessons.map(lesson => lesson.lessonPair.name))];
    const uniquePairs = [...new Set(lessons.map(lesson => lesson.lessonPair.name))]
        .map(Number) // String sonlarni Number ga o‘tkazish
        .sort((a, b) => a - b); // O‘sish tartibida tartiblash

    // **Barcha gorizontal scrollarni sinxronlashtirish**
    const syncScroll = (event) => {
        const scrollX = event.nativeEvent.contentOffset.x;
        if (headerScrollRef.current) {
            headerScrollRef.current.scrollTo({ x: scrollX, animated: false });
        }
        bodyScrollRefs.current.forEach(ref => {
            if (ref) {
                ref.scrollTo({ x: scrollX, animated: false });
            }
        });
    };

    const getWeekRange = () => {
        const now = new Date();
        const dayOfWeek = now.getUTCDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const sundayOffset = 7 - dayOfWeek;

        const monday = new Date(now);
        monday.setUTCDate(now.getUTCDate() + mondayOffset);

        const sunday = new Date(now);
        sunday.setUTCDate(now.getUTCDate() + sundayOffset);

        const formatDate = (date) => {
            const day = date.getUTCDate().toString().padStart(2, "0");
            const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
            const year = date.getUTCFullYear();
            return `${day}.${month}.${year}`;
        };

        return `${formatDate(monday)} - ${formatDate(sunday)}`;
    };






    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../../assets/bg21.jpg")}
                style={styles.myBg}
                resizeMode="repeat"
            >

                {lessons.length === 0 ? (
                    <View style={styles.noLessonsContainer}>
                        <Text style={styles.noLessonsText}>Bu haftalik dars jadvali mavjud emas</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.groupInfoContainer}>
                            <Text style={styles.groupInfoText}> Guruh: {lessons[0].group.name}</Text>
                            <Text style={styles.groupInfoText}>Hafta: {getWeekRange()}</Text>
                        </View>
                        {/* **Yuqori Qator (Header) - Juftliklar** */}
                        <ScrollView
                            ref={headerScrollRef}
                            horizontal
                            style={styles.headerRow}
                            scrollEnabled={false}
                        >
                            <View style={[styles.tableCell, styles.headerCell, styles.fixedWidth]}>
                                <Text style={styles.headerText}>Hafta kuni</Text>
                            </View>
                            {uniquePairs.map((pair, index) => (
                                <View key={index} style={[styles.tableCell, styles.headerCell, styles.fixedWidth]}>
                                    <Text style={styles.headerText}>{pair}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        {/* **Asosiy Kontent** */}
                        <ScrollView style={styles.verticalScrollView}>
                            {daysOfWeek.map((day, rowIndex) => (
                                <View key={rowIndex} style={styles.tableRow}>
                                    <View style={[styles.tableCell, styles.groupCell, styles.fixedWidth]}>
                                        <Text style={styles.groupText}>{day}</Text>
                                    </View>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        scrollEventThrottle={16}
                                        onScroll={syncScroll}
                                        ref={(el) => (bodyScrollRefs.current[rowIndex] = el)}
                                    >
                                        {uniquePairs.map((pair, colIndex) => {
                                            const lessonsForPair = groupedLessons[day]?.[pair] || [];
                                            return (
                                                <View key={colIndex} style={[styles.tableCell, styles.fixedWidth]}>
                                                    {lessonsForPair.map((lesson, idx) => (
                                                        <React.Fragment key={`${colIndex}-${idx}`}>
                                                            <Text style={styles.lessonText}>
                                                                {lesson.subject.name}
                                                            </Text>
                                                            <Text style={[styles.lessonText, styles.colorRoom]}>
                                                                {lesson.auditorium.name}
                                                            </Text>
                                                            <Text style={[styles.lessonText, styles.colorTeacher]}>
                                                                {lesson.employee.name}
                                                            </Text>
                                                        </React.Fragment>
                                                    ))}
                                                </View>
                                            );
                                        })}

                                    </ScrollView>
                                </View>
                            ))}
                        </ScrollView>
                    </>
                )}
            </ImageBackground>
        </View>
    );

};

export default WeaklyGroup;

const styles = StyleSheet.create({
    container: {
        padding:2,
        flex: 1,
    },
    myBg: {
        flex: 1,
        width: Dimensions.get("window").width,
    },
    headerRow: {
        flexDirection: "row",
        backgroundColor: "#fff",
        position: "absolute",
        top: 100,
        left: 0,
        zIndex: 1,
    },
    verticalScrollView: {
        flex: 1,
        marginTop: 40,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
    },
    tableCell: {
        padding: 10,
        justifyContent: "center",
        borderRightWidth: 1,
        borderRightColor: "#000000",
    },
    fixedWidth: {
        width: 130,
    },
    headerCell: {
        backgroundColor: "#007bff",
    },
    headerText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    groupCell: {
        backgroundColor: "#f1f1f1",
    },
    groupText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    lessonText: {
        fontSize: 14,
        color: "#333",
        textAlign: "center",
    },
    colorTeacher:{
        color: "green"
    },
    colorRoom:{
        color:"blue"
    },
    groupInfoContainer: {
        backgroundColor: "#fff",
        padding: 15,
        marginTop: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    groupInfoText: {
        fontSize: 16,
        color: "#333",
        marginBottom: 5,
        fontWeight: "bold",
    },
});
