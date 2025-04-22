import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    StyleSheet,
    ImageBackground,
} from "react-native";
import ApiCallBuxpxti from "../../config/ApiCallBuxpxti"; // Adjust the import path as necessary

const DarsJadvali = ({ navigation }) => {
    const [lessons, setLessons] = useState([]);
    const scrollX = useRef(0); // X koordinatasini saqlash
    const headerScrollRef = useRef(null);
    const bodyScrollRefs = useRef({});

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // "YYYY-MM-DD" formatida qaytarish
    };

    const fetchLessons = async () => {
        try {
            const todayDate = getTodayDate();
            const todayTimestamp = Math.floor(new Date(todayDate).getTime() / 1000);
            const tomorrowTimestamp = todayTimestamp + 86400;

            const response = await ApiCallBuxpxti(
                `/v1/data/schedule-list?lesson_date_from=${todayTimestamp}&lesson_date_to=${tomorrowTimestamp}&limit=200`,
                "GET"
            );

            setLessons(response.data.data.items);
        } catch (error) {
            console.error("Error fetching lessons:", error);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    // Guruhlash
    const groupLessons = lessons.reduce((acc, lesson) => {
        const groupName = lesson.group.name;
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(lesson);
        return acc;
    }, {});

    // Unique dars juftligi
    const lessonPairs = [...new Set(lessons.map((lesson) => lesson.lessonPair.name))].sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
    });

    // Sinxron scroll funksiyasi
    // const syncScroll = (event) => {
    //     const offsetX = event.nativeEvent.contentOffset.x;
    //     scrollX.current = offsetX; // Holatni saqlaymiz
    //
    //     // Barcha `ScrollView` larni sinxronlashtiramiz
    //     if (headerScrollRef.current) {
    //         headerScrollRef.current.scrollTo({ x: offsetX, animated: false });
    //     }
    //
    //     Object.values(bodyScrollRefs.current).forEach((ref) => {
    //         if (ref && ref.scrollTo) {
    //             ref.scrollTo({ x: offsetX, animated: false });
    //         }
    //     });
    // };

    const syncScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;

        if (scrollX.current !== offsetX) {
            scrollX.current = offsetX; // X holatni yangilash

            // Header'ni sinxronlashtirish
            if (headerScrollRef.current) {
                headerScrollRef.current.scrollTo({ x: offsetX, animated: false });
            }

            // Body scrollView'larini sinxronlashtirish
            Object.values(bodyScrollRefs.current).forEach((ref) => {
                if (ref && ref.scrollTo) {
                    ref.scrollTo({ x: offsetX, animated: false });
                }
            });
        }
    };


    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../../assets/bg21.jpg")}
                style={styles.myBg}
                resizeMode="repeat"
            >
                {/* Fixed Header */}
                <View style={styles.fixedHeader}>
                    <View style={[styles.tableCell, styles.headerCell, styles.fixedWidth]}>
                        <Text style={styles.headerText}>Guruh</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={syncScroll}
                        ref={headerScrollRef}
                    >
                        {lessonPairs.map((pair, index) => (
                            <View key={index} style={[styles.tableCell, styles.headerCell, styles.fixedWidth]}>
                                <Text style={styles.headerText}>{pair}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Scrollable Content */}
                <ScrollView style={styles.verticalScrollView}>
                    {Object.keys(groupLessons).map((groupName, rowIndex) => (
                        <View key={rowIndex} style={styles.tableRow}>
                            {/* Fixed First Column */}
                            <View style={[styles.tableCell, styles.groupCell, styles.fixedWidth]}>
                                <Text style={styles.groupText}>{groupName}</Text>
                            </View>

                            {/* Scrollable Columns */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                scrollEventThrottle={16}
                                onScroll={syncScroll}
                                ref={(el) => (bodyScrollRefs.current[rowIndex] = el)}
                            >
                                {lessonPairs.map((pair, colIndex) => {
                                    const lesson = groupLessons[groupName].find(
                                        (l) => l.lessonPair.name === pair
                                    );
                                    return (
                                        <View key={colIndex} style={[styles.tableCell, styles.fixedWidth]}>
                                            {lesson ? (
                                                <>
                                                    <Text style={styles.lessonText}>
                                                        {lesson.subject.name}
                                                    </Text>
                                                    <Text style={[styles.lessonText, styles.colorRoom]}>
                                                        {lesson.auditorium.name}
                                                    </Text>
                                                    <Text style={[styles.lessonText, styles.colorTeacher]}>
                                                        {lesson.employee.name}
                                                    </Text>
                                                </>
                                            ) : (
                                                <Text style={styles.lessonText}>-</Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    ))}
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

export default DarsJadvali;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    myBg: {
        flex: 1,
        width: Dimensions.get("window").width,
    },
    fixedHeader: {
        flexDirection: "row",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        backgroundColor: "#fff",
    },
    verticalScrollView: {
        flex: 1,
        marginTop: 20,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
    },
    tableCell: {
        padding: 2,
        justifyContent: "center",
        borderRightWidth: 2,
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
    }
});
