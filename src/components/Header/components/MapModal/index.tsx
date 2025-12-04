
import React, { useState } from "react";
import { View, PermissionsAndroid, Platform, StyleSheet } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../../../../utils/colors";
import { responsive } from "../../../../utils/responsive";
import CButton from "../../../CButton";
import CText from "../../../CText/CText";
import { useTranslation } from "react-i18next";
import CLoading from "../../../CLoading";
import { GOOGLE_API_KEY } from "../../../../constants/key";
import { AppDispatch } from "../../../../store/Store";
import { useDispatch } from "react-redux";
import { fetchUserData } from "../../../../store/services/userDataService";

interface MapModalProps {
    onClose: () => void;
    onLocationSelect: (data: {
        location: string;
        latitude: number;
        longitude: number;
        province: string;
        country: string;
    }) => void;
}

const MapModal: React.FC<MapModalProps> = ({ onClose, onLocationSelect }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [province, setProvince] = useState<string>("");
    const [country, setCountry] = useState<string>("");

    const requestLocationPermission = async () => {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: t("map_location_permission_title"),
                    message: t("map_location_permission_message"),
                    buttonPositive: t("map_location_permission_allow"),
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const fetchAddress = async (latitude: number, longitude: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=tr`
            );
            const data = await response.json();

            if (data.status === "OK") {
                const result = data.results[0];
                const formattedAddress = result.formatted_address;
                setAddress(formattedAddress);

                const components = result.address_components;

                let foundProvince = "";
                let foundCountry = "";

                components.forEach((component: any) => {
                    if (component.types.includes("administrative_area_level_1")) {
                        foundProvince = component.long_name;
                    }
                    if (component.types.includes("country")) {
                        foundCountry = component.long_name;
                    }
                });

                setProvince(foundProvince);
                setCountry(foundCountry);
            } else {
                setAddress(t("map_address_not_found"));
            }
        } catch (err) {
            setAddress(t("map_address_error"));
        }
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye beklet
        setLoading(false);
    };

    const getLocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        setLoading(true);

        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ latitude, longitude });
                fetchAddress(latitude, longitude);
            },
            (error) => {
                console.log("Location error:", error);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleMarkerDragEnd = (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCoords({ latitude, longitude });
        fetchAddress(latitude, longitude);
    };

    // console.log(coords?.latitude, coords?.longitude, province, country, address)

    const handleApply = async () => {
        if (!coords) return;

        const { latitude, longitude } = coords;
        const location = address || `${province}, ${country}`;

        try {
            // Bir önceki Filter ekranına konum bilgilerini gönder
            onLocationSelect({ location, latitude, longitude, province, country });

            await dispatch(fetchUserData());
            onClose();
        } catch (error) {
            console.error("❌ Firestore güncelleme hatası:", error);
        }
    };


    return (
        <>
            {loading ? (
                <CLoading visible={loading} />
            ) : (
                <View style={styles.container}>
                    <View>
                        <CText style={styles.title}>{t("map_where_do_you_live")}</CText>
                        <CText style={styles.description}>
                            {t("map_location_change_info")}
                        </CText>

                        <CButton title={t("map_find_my_location")} onPress={getLocation} disabled={loading} />

                        {coords && (
                            <>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: coords.latitude,
                                        longitude: coords.longitude,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    }}
                                    region={{
                                        latitude: coords.latitude,
                                        longitude: coords.longitude,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    }}
                                >
                                    <Marker
                                        coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
                                        draggable
                                        onDragEnd={handleMarkerDragEnd}
                                    />
                                </MapView>

                                <View style={styles.addressContainer}>
                                    <CText style={styles.addressText}>{address}</CText>
                                </View>
                                <View style={styles.noteContainer}>
                                    <CText style={styles.noteText}>
                                        {t("map_drag_pin_info")}
                                    </CText>
                                </View>

                            </>
                        )}
                    </View>

                    <View style={styles.buttonContainer}>
                        <CButton
                            title={t("common_back")}
                            onPress={onClose}
                            backgroundColor={colors.LIGHT_GRAY}
                            textColor={colors.DARK_GRAY}
                        />
                        <CButton
                            title={t("save")}
                            onPress={handleApply}
                            disabled={!coords}
                        />
                    </View>
                </View>
            )}
        </>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
            justifyContent: "space-between",
        },
        title: {
            fontSize: 28,
            fontWeight: "700",
            color: colors.TEXT_MAIN_COLOR,
            marginBottom: responsive(8),
        },
        description: {
            fontSize: responsive(16),
            color: colors.GRAY_COLOR,
            marginBottom: responsive(25),
        },
        map: {
            width: "100%",
            height: Platform.OS === "android" ? 250 : 300,
            marginTop: responsive(10),
        },
        addressContainer: {
            marginTop: responsive(15),
            paddingHorizontal: responsive(10),
        },
        addressText: {
            fontSize: responsive(14),
            color: colors.TEXT_MAIN_COLOR,
            textAlign: "center",
        },
        noteContainer: {
            marginTop: responsive(10),
            paddingHorizontal: responsive(10),
        },
        noteText: {
            fontSize: responsive(13),
            color: colors.GRAY_COLOR,
            textAlign: "center",
        },
        buttonContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 30,
        },
    });

export default MapModal;
