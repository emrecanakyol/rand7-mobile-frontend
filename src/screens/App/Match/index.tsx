import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootState } from "../../../store/Store";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../utils/colors";
import Header from "./components/Header";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.42;

interface LikeUser {
    id: string;
    name: string;
    age: number;
    city: string;
    match: number;
    distance: string;
    image: string;
    online?: boolean;
};

const Likes: React.FC = () => {
    const navigation: any = useNavigation();
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);

    const likedUsers: LikeUser[] = [
        {
            id: "1",
            name: "James",
            age: 20,
            city: "HANOVER",
            match: 100,
            distance: "1.3 km away",
            image: "https://randomuser.me/api/portraits/men/1.jpg",
            online: true,
        },
        {
            id: "2",
            name: "Eddie",
            age: 23,
            city: "DORTMUND",
            match: 94,
            distance: "2 km away",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            online: true,
        },
        {
            id: "3",
            name: "Brandon",
            age: 20,
            city: "BERLIN",
            match: 89,
            distance: "2.5 km away",
            image: "https://randomuser.me/api/portraits/men/14.jpg",
        },
        {
            id: "4",
            name: "Alfredo",
            age: 20,
            city: "MUNICH",
            match: 80,
            distance: "2.5 km away",
            image: "https://randomuser.me/api/portraits/men/54.jpg",
            online: true,
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                <Header />
                {/* Stats */}
                <Text style={styles.sectionTitle1}>Beğeniler</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <TouchableOpacity activeOpacity={0.9}>
                            <View style={styles.avatarOuter}>
                                <Image
                                    source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
                                    style={styles.avatarImage}
                                    blurRadius={12}
                                />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.statText}>Likes</Text>
                    </View>
                </View>

                {/* Your Matches */}
                <Text style={styles.sectionTitle2}>Eşleşmeler</Text>

                <View style={styles.cardContainer}>
                    {likedUsers.map((user) => (
                        <View key={user.id} style={styles.card}>
                            <Image source={{ uri: user.image }} style={styles.image} />
                            <View style={styles.matchBadge}>
                                <Text style={styles.matchText}>{user.match}% Match</Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.distance}>{user.distance}</Text>
                                <View style={styles.row}>
                                    <Text style={styles.name}>
                                        {user.name}, {user.age}
                                    </Text>
                                    {user.online && <View style={styles.onlineDot} />}
                                </View>
                                <Text style={styles.city}>{user.city}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default Likes;


const getStyles = (colors: any, isTablet: boolean, height: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#231942",
    },
    statsContainer: {
        flexDirection: "row",
        marginTop: 20,
        marginLeft: 5,
    },
    statItem: {
        alignItems: "center",
        paddingLeft: 15,
    },
    avatarOuter: {
        width: 86,
        height: 86,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: colors.BLACK_COLOR,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    blurOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.35)", // daha koyu tint (önceki 0.25 idi)
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.2)",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    statText: {
        fontSize: 14,
        color: "#231942",
        fontWeight: "600",
        marginTop: 8,
    },
    sectionTitle1: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.TEXT_MAIN_COLOR,
        marginLeft: 20,
        marginTop: 5,
    },
    sectionTitle2: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.TEXT_MAIN_COLOR,
        marginLeft: 20,
        marginTop: 20,
    },
    scrollContainer: {
        paddingBottom: 90,
    },
    cardContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        marginTop: 20,
    },
    card: {
        width: CARD_WIDTH,
        height: 240,
        backgroundColor: "#fff",
        borderRadius: 20,
        marginBottom: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    image: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    matchBadge: {
        position: "absolute",
        top: 10,
        left: 0,
        backgroundColor: colors.RED_COLOR,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    matchText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 12,
    },
    infoContainer: {
        position: "absolute",
        bottom: 10,
        left: 10,
    },
    distance: {
        backgroundColor: "rgba(0,0,0,0.4)",
        color: "#fff",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        fontSize: 12,
        alignSelf: "flex-start",
    },
    name: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#00FF99",
        marginLeft: 6,
        marginTop: 2,
    },
    city: {
        color: "#ddd",
        fontSize: 13,
        letterSpacing: 1,
    },
});
