
import React, { useState } from "react";
import { View, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, FlatList, ScrollView } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../../../../utils/colors";
import { responsive } from "../../../../utils/responsive";
import CButton from "../../../CButton";
import CText from "../../../CText/CText";
import { useTranslation } from "react-i18next";
import CLoading from "../../../CLoading";
import { GOOGLE_API_KEY } from "../../../../constants/Keys";
import CTextInput from "../../../CTextInput";
import Ionicons from "react-native-vector-icons/Ionicons";
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
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [province, setProvince] = useState<string>("");
    const [country, setCountry] = useState<string>("");
    const [manualLocation, setManualLocation] = useState<string>("");
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);

    const requestLocationPermission = async () => {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: t("location_permission_title"),
                    message: t("location_permission_message"),
                    buttonPositive: t("location_permission_allow"),
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const getLocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        setLoading(true);

        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ latitude, longitude });

                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=tr`
                    );
                    const data: any = await response.json();

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
                        setAddress(t("address_not_found"));
                    }
                } catch (err) {
                    setAddress(t("address_fetch_error"));
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
                setLoading(false);
            },
            (error) => {
                console.log("Location error:", error);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    //input ile arama
    const handleManualLocation = async () => {
        if (!manualLocation.trim()) return;

        setLoading(true);
        setSearched(true);
        setLocationResults([]);

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${manualLocation}&key=${GOOGLE_API_KEY}&language=tr`
            );
            const data: any = await response.json();

            if (data.status === "OK") {
                setLocationResults(data.predictions);
            } else {
                setLocationResults([]);
            }
        } catch (err) {
            console.log("Manual location search error:", err);
            setLocationResults([]);
        }

        setLoading(false);
    };

    const handleSelectLocation = async (selectedLocation: any) => {
        const { place_id } = selectedLocation;

        try {
            const placeDetailsResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?placeid=${place_id}&key=${GOOGLE_API_KEY}`
            );
            const placeDetailsData: any = await placeDetailsResponse.json();

            if (placeDetailsData.status === "OK") {
                const { lat, lng } = placeDetailsData.result.geometry.location;
                setCoords({
                    latitude: lat,
                    longitude: lng,
                });

                setAddress(placeDetailsData.result.formatted_address);

                const components = placeDetailsData.result.address_components;

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
                setLocationResults([]);
                setSearched(false);
            } else {
                console.log("Place details error:", placeDetailsData.status);
            }
        } catch (err) {
            console.log("Place details API error:", err);
        }
    };

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


    const fetchAddress = async (latitude: number, longitude: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=tr`
            );
            const data: any = await response.json();

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

    const handleMarkerDragEnd = (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCoords({ latitude, longitude });
        fetchAddress(latitude, longitude);
    };

    return (
        <>
            {loading ? (
                <CLoading visible={loading} />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <View>
                            <CText style={styles.title}>{t("map_where_do_you_live")}</CText>
                            <CText style={styles.description}>
                                {t("map_location_change_info")}
                            </CText>

                            <View style={styles.inputContainer}>
                                <View style={{ flex: 1 }}>
                                    <CTextInput
                                        label={t("location_title")}
                                        value={manualLocation}
                                        onChangeText={setManualLocation}
                                        placeholder={t("location_info")}
                                        maxLength={100}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.locateButton}
                                    onPress={handleManualLocation}
                                    disabled={loading}
                                >
                                    <Ionicons name="search" size={24} color={colors.WHITE_COLOR} />
                                </TouchableOpacity>
                            </View>

                            {searched && !loading && locationResults.length === 0 && (
                                <CText style={styles.noResultsText}>{t("location_not_found")}</CText>
                            )}

                            {locationResults.length > 0 && (
                                <FlatList
                                    data={locationResults}
                                    keyExtractor={(item, index) => item.place_id + index}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectLocation(item)}
                                        >
                                            <CText style={styles.suggestionText}>{item.description}</CText>
                                        </TouchableOpacity>
                                    )}
                                    style={styles.suggestionList}
                                    scrollEnabled={false}
                                />
                            )}

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

                                    {/* <CButton title={t("map_find_my_location")} onPress={getLocation} disabled={loading} /> */}

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
                </ScrollView>
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
        inputContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: responsive(10),
        },
        locateButton: {
            borderRadius: 14,
            marginTop: 34,
            padding: 11,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.BLACK_COLOR,
        },
        suggestionList: {
            marginBottom: responsive(20),
            borderWidth: 0.5,
            borderColor: colors.GRAY_COLOR,
            borderRadius: 14,
            backgroundColor: colors.EXTRA_LIGHT_GRAY,
        },
        suggestionItem: {
            height: 50,
            padding: responsive(10),
            justifyContent: "center"
        },
        suggestionText: {
            fontSize: responsive(14),
            color: colors.TEXT_MAIN_COLOR,
        },
        noResultsText: {
            fontSize: responsive(14),
            color: colors.GRAY_COLOR,
            padding: responsive(10),
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
