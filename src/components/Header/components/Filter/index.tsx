import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Dimensions,
    Platform,
} from "react-native";
import Slider from '@react-native-community/slider';
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import firestore from '@react-native-firebase/firestore'
import { useAppSelector } from "../../../../store/hooks";
import { useTheme } from "../../../../utils/colors";
import { AppDispatch } from "../../../../store/Store";
import { useDispatch } from "react-redux";
import { fetchUserData } from "../../../../store/services/userDataService";

interface FilterProps {
    onClose: () => void;
}

const Filter: React.FC<FilterProps> = ({ onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation: any = useNavigation();
    const { userData } = useAppSelector((state) => state.userData);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get("window");
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const { t } = useTranslation();
    const [isOnline, setIsOnline] = useState(true);
    const [distance, setDistance] = useState(userData.maxDistance);
    const [ageRange, setAgeRange] = useState(
        userData?.ageRange
            ? [userData.ageRange.min, userData.ageRange.max]
            : [18, 90]
    );
    const [showPreference, setShowPreference] = useState(userData.lookingFor);

    const handleApply = async () => {
        try {
            await firestore()
                .collection('users')
                .doc(userData.userId)
                .update({
                    maxDistance: distance,
                    lookingFor: showPreference,
                    ageRange: {
                        min: ageRange[0],
                        max: ageRange[1],
                    },
                });
            await dispatch(fetchUserData());
            onClose()
        } catch (error) {
            console.error("❌ Firestore güncelleme hatası:", error);
        }
    };

    return (
        <View style={styles.container}>

            {/* Location */}
            <View style={styles.row}>
                <Text style={styles.label}>Konum</Text>
                <TouchableOpacity onPress={() => navigation.navigate()}>
                    <Text style={styles.value}>
                        {`${userData.province}, ${userData.country}`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Distance */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Maksimum Mesafe</Text>
                    <Text style={styles.value}>{distance} km</Text>
                </View>
                <Slider
                    minimumValue={1}
                    maximumValue={150}
                    value={distance}
                    minimumTrackTintColor={colors.BLACK_COLOR}
                    maximumTrackTintColor="#E0E0E0"
                    thumbTintColor={colors.BLACK_COLOR}
                    onValueChange={(v) => setDistance(Math.round(v))}
                    style={{
                        width: "100%",
                        marginTop: 30,
                        transform: [{
                            scaleY: Platform.OS === "android" ? 1.2 : 1.1
                        }, {
                            scaleX: Platform.OS === "android" ? 1.06 : 1
                        }],
                    }}
                />
            </View>

            {/* Age */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Yaş</Text>
                    <Text style={styles.value}>
                        {ageRange[0]} – {ageRange[1]}
                    </Text>
                </View>
                <MultiSlider
                    values={ageRange}
                    min={18}
                    max={90}
                    step={1}
                    onValuesChange={(v) => setAgeRange(v)}
                    selectedStyle={{ backgroundColor: colors.BLACK_COLOR }}
                    unselectedStyle={{ backgroundColor: "#E0E0E0" }}
                    markerStyle={{
                        backgroundColor: colors.BLACK_COLOR,
                        height: Platform.OS === "android" ? 12 : 30,
                        width: Platform.OS === "android" ? 12 : 30
                    }}
                    containerStyle={{
                        marginTop: 20,
                        alignItems: "center",
                        transform: [{
                            scaleY: Platform.OS === "android" ? 1.2 : 1.1
                        }, {
                            scaleX: Platform.OS === "android" ? 1.15 : 1.1
                        }],
                    }}
                />
            </View>

            {/* Göster (Show Preference) */}
            <View style={styles.section}>
                <Text style={styles.label}>Göster</Text>
                <View style={styles.preferenceContainer}>
                    <TouchableOpacity
                        style={[
                            styles.checkbox,
                            showPreference === "female" && styles.checkedBox,
                        ]}
                        onPress={() => setShowPreference("female")}
                    >
                        <Text
                            style={[
                                styles.checkboxText,
                                showPreference === "female" && styles.checkedText,
                            ]}
                        >
                            Kadın
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.checkbox,
                            showPreference === "male" && styles.checkedBox,
                        ]}
                        onPress={() => setShowPreference("male")}
                    >
                        <Text
                            style={[
                                styles.checkboxText,
                                showPreference === "male" && styles.checkedText,
                            ]}
                        >
                            Erkek
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.checkbox,
                            showPreference === "both" && styles.checkedBox,
                        ]}
                        onPress={() => setShowPreference("both")}
                    >
                        <Text
                            style={[
                                styles.checkboxText,
                                showPreference === "both" && styles.checkedText,
                            ]}
                        >
                            Her ikisi
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Online now */}
            {/* <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Şu anda çevrimiçi olanlar</Text>
                    <Switch
                        trackColor={{ false: "#ccc", true: colors.BLACK_COLOR }}
                        thumbColor="#fff"
                        value={isOnline}
                        onValueChange={setIsOnline}
                    />
                </View>
            </View> */}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.resetBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.resetText}>Sıfırla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                    <Text style={styles.applyText}>Uygula</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Filter;

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            marginBottom: 50,
        },
        headerTitle: {
            fontSize: 22,
            fontWeight: "700",
            marginLeft: 10,
        },
        label: {
            fontSize: 16,
            fontWeight: "600",
            color: "#000",
        },
        value: {
            color: colors.TEXT_DESCRIPTION_COLOR,
            fontWeight: "500",
        },
        section: {
            marginTop: 20,
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
        },
        preferenceContainer: {
            flexDirection: "row",
            marginTop: 10,
        },
        checkbox: {
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 14,
            marginRight: 10,
        },
        checkedBox: {
            backgroundColor: colors.BLACK_COLOR,
            borderColor: colors.BLACK_COLOR,
        },
        checkboxText: {
            color: "#888",
            fontWeight: "500",
        },
        checkedText: {
            color: "#fff",
        },
        buttonContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "auto",
            marginBottom: 30,
        },
        resetBtn: {
            flex: 1,
            backgroundColor: "#F0F0F0",
            paddingVertical: 14,
            borderRadius: 20,
            marginRight: 10,
            alignItems: "center",
        },
        resetText: {
            color: "#777",
            fontWeight: "600",
        },
        applyBtn: {
            flex: 1,
            backgroundColor: "#3B0147",
            paddingVertical: 14,
            borderRadius: 20,
            alignItems: "center",
        },
        applyText: {
            color: "#fff",
            fontWeight: "700",
        },
    });
