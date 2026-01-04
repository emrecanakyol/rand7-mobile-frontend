import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Dimensions,
    Platform,
    ActivityIndicator,
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
import CModal from "../../../CModal";
import MapModal from "../MapModal";

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
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        location: string;
        latitude: number;
        longitude: number;
        province: string;
        country: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleApply = async () => {
        if (isLoading) return;
        try {
            setIsLoading(true);
            const updateData: any = {
                maxDistance: distance,
                lookingFor: showPreference,
                ageRange: {
                    min: ageRange[0],
                    max: ageRange[1],
                },
            };

            // ✅ Eğer MapModal’dan yeni konum seçilmişse, ekle
            if (selectedLocation) {
                updateData.location = selectedLocation.location;
                updateData.latitude = selectedLocation.latitude;
                updateData.longitude = selectedLocation.longitude;
                updateData.province = selectedLocation.province;
                updateData.country = selectedLocation.country;
            }

            await firestore()
                .collection('users')
                .doc(userData.userId)
                .update(updateData);

            await dispatch(fetchUserData());
            onClose();
        } catch (error) {
            console.error("❌ Firestore güncelleme hatası:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            {/* Location */}
            <View style={styles.row}>
                <Text style={styles.label}>{t('filter_location')}</Text>
                <TouchableOpacity onPress={() => setMapModalVisible(true)}>
                    <Text style={styles.value}>
                        {selectedLocation
                            ? `${selectedLocation.province}, ${selectedLocation.country}`
                            : `${userData.province}, ${userData.country}`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Distance */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>{t('filter_max_distance')}</Text>
                    <Text style={styles.value}>{t('filter_distance_km', { distance })}</Text>
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
                    <Text style={styles.label}>{t('filter_age_range')}</Text>
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
                <Text style={styles.label}>{t('filter_show_me')}</Text>
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
                            {t('filter_show_female')}
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
                            {t('filter_show_male')}
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
                            {t('filter_show_both')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Online now */}
            {/* <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>{t('filter_online_now')}</Text>
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
                <TouchableOpacity style={styles.resetBtn} onPress={onClose}>
                    <Text style={styles.resetText}>{t('filter_close')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.applyBtn,
                        isLoading && { opacity: 0.7 },
                    ]}
                    onPress={handleApply}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <ActivityIndicator color="#fff" size="small" />
                        </View>
                    ) : (
                        <Text style={styles.applyText}>{t('filter_apply')}</Text>
                    )}
                </TouchableOpacity>

            </View>
            {/* Modal */}
            <CModal
                visible={mapModalVisible}
                onClose={() => setMapModalVisible(false)}
                paddingTop={Platform.OS === "android" ? 25 : 70}
                closeButton={false}
            >
                <MapModal
                    onClose={() => setMapModalVisible(false)}
                    onLocationSelect={(loc) => setSelectedLocation(loc)} />
            </CModal>
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
            color: colors.TEXT_MAIN_COLOR,
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
            justifyContent: "space-between",
        },
        checkbox: {
            borderWidth: 1,
            borderColor: colors.GRAY_COLOR,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 14,
            marginRight: 10,
            width: 100,
            alignItems: "center",
        },
        checkedBox: {
            backgroundColor: colors.BLACK_COLOR,
            borderColor: colors.BLACK_COLOR,
        },
        checkboxText: {
            color: colors.DARK_GRAY_COLOR,
            fontWeight: "500",
            fontSize: 16,
        },
        checkedText: {
            color: colors.WHITE_COLOR,
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
            color: colors.DARK_GRAY,
            fontWeight: "600",
        },
        applyBtn: {
            flex: 1,
            backgroundColor: colors.BLACK_COLOR,
            paddingVertical: 14,
            borderRadius: 20,
            alignItems: "center",
        },
        applyText: {
            color: "#fff",
            fontWeight: "700",
        },
    });
