
//------- Bu hem input ile aramalı hemde tam konum bul butonu vardır. haritada gösterir ------------

// import React, { useState } from "react";
// import { View, Text, PermissionsAndroid, Platform, StyleSheet, ScrollView, TouchableOpacity, FlatList } from "react-native";
// import Geolocation from "@react-native-community/geolocation";
// import MapView, { Marker } from "react-native-maps";
// import CButton from "../../../components/CButton";
// import { responsive } from "../../../utils/responsive";
// import { useTheme } from "../../../utils/colors";
// import CustomBackButton from "../../../components/CBackButton";
// import CLoading from "../../../components/CLoading";
// import CText from "../../../components/CText/CText";
// import { GOOGLE_API_KEY } from "../../../utils/constants/key";
// import { useNavigation } from "@react-navigation/native";
// import CTextInput from "../../../components/CTextInput";
// import Ionicons from "react-native-vector-icons/Ionicons";

// const AddProfile4 = ({ route }: any) => {
//   const navigation: any = useNavigation()
//   const { colors } = useTheme();
//   const styles = getStyles(colors);

//   const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [address, setAddress] = useState<string>("");
//   const [loading, setLoading] = useState(false);
//   const [province, setProvince] = useState<string>("");
//   const [country, setCountry] = useState<string>("");
//   const [manualLocation, setManualLocation] = useState<string>("");
//   const [locationResults, setLocationResults] = useState<any[]>([]);
//   const [searched, setSearched] = useState(false);

//   const requestLocationPermission = async () => {
//     if (Platform.OS === "android") {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: "Konum Erişimi İzni",
//           message: "Konumunuzu almak için izin gerekli.",
//           buttonPositive: "İzin Ver",
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   };

//   const getLocation = async () => {
//     const hasPermission = await requestLocationPermission();
//     if (!hasPermission) return;

//     setLoading(true);

//     Geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         setCoords({ latitude, longitude });

//         try {
//           const response = await fetch(
//             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=tr`
//           );
//           const data = await response.json();

//           if (data.status === "OK") {
//             const result = data.results[0];
//             const formattedAddress = result.formatted_address;
//             setAddress(formattedAddress);

//             const components = result.address_components;

//             let foundProvince = "";
//             let foundCountry = "";

//             components.forEach((component: any) => {
//               if (component.types.includes("administrative_area_level_1")) {
//                 foundProvince = component.long_name;
//               }
//               if (component.types.includes("country")) {
//                 foundCountry = component.long_name;
//               }
//             });

//             setProvince(foundProvince);
//             setCountry(foundCountry);

//           } else {
//             setAddress("Adres bilgisi alınamadı.");
//           }
//         } catch (err) {
//           setAddress("Adres bilgisi alınırken hata oluştu.");
//         }

//         await new Promise(resolve => setTimeout(resolve, 5000));
//         setLoading(false);
//       },
//       (error) => {
//         console.log("Location error:", error);
//         setLoading(false);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//     );
//   };

//   //input ile arama
//   const handleManualLocation = async () => {
//     if (!manualLocation.trim()) return;

//     setLoading(true);
//     setSearched(true);
//     setLocationResults([]);

//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${manualLocation}&key=${GOOGLE_API_KEY}&language=tr`
//       );
//       const data = await response.json();

//       if (data.status === "OK") {
//         setLocationResults(data.predictions);
//       } else {
//         setLocationResults([]);
//       }
//     } catch (err) {
//       console.log("Manual location search error:", err);
//       setLocationResults([]);
//     }

//     setLoading(false);
//   };

//   const handleSelectLocation = async (selectedLocation: any) => {
//     const { place_id } = selectedLocation;

//     try {
//       const placeDetailsResponse = await fetch(
//         `https://maps.googleapis.com/maps/api/place/details/json?placeid=${place_id}&key=${GOOGLE_API_KEY}`
//       );
//       const placeDetailsData = await placeDetailsResponse.json();

//       if (placeDetailsData.status === "OK") {
//         const { lat, lng } = placeDetailsData.result.geometry.location;
//         setCoords({
//           latitude: lat,
//           longitude: lng,
//         });

//         setAddress(placeDetailsData.result.formatted_address);

//         const components = placeDetailsData.result.address_components;

//         let foundProvince = "";
//         let foundCountry = "";

//         components.forEach((component: any) => {
//           if (component.types.includes("administrative_area_level_1")) {
//             foundProvince = component.long_name;
//           }
//           if (component.types.includes("country")) {
//             foundCountry = component.long_name;
//           }
//         });

//         setProvince(foundProvince);
//         setCountry(foundCountry);
//         setLocationResults([]);
//         setSearched(false);
//       } else {
//         console.log("Place details error:", placeDetailsData.status);
//       }
//     } catch (err) {
//       console.log("Place details API error:", err);
//     }
//   };



//   const next = () => {
//     if (!coords) return;
//     navigation.navigate("ADD_PROFILE_5", {
//       ...route.params,
//       location: address,
//       latitude: coords.latitude,
//       longitude: coords.longitude,
//       province,
//       country,
//     });
//   };

//   // console.log(coords?.latitude, coords?.longitude, province, country, address)

//   return (
//     <>
//       {loading ? (
//         <CLoading visible={loading} />
//       ) : (
//         <View style={styles.container}>
//           <View>
//             <CustomBackButton />

//             <CText style={styles.title}>Nerede yaşıyorsun?</CText>
//             <CText style={styles.description}>
//               Profilini oluşturmak için bulunduğun konumu paylaş. Bu bilgi eşleşmelerini daha doğru hale getirir.
//             </CText>

//             <View style={styles.inputContainer}>
//               <View style={{ flex: 1 }}>
//                 <CTextInput
//                   label="Konum (Ülke/Şehir)"
//                   value={manualLocation}
//                   onChangeText={setManualLocation}
//                   placeholder="Konum bilgisi"
//                   maxLength={100}
//                 />
//               </View>

//               <TouchableOpacity
//                 style={styles.locateButton}
//                 onPress={handleManualLocation}
//                 disabled={loading}
//               >
//                 <Ionicons name="search" size={24} color={colors.WHITE_COLOR} />
//               </TouchableOpacity>
//             </View>

//             {searched && !loading && locationResults.length === 0 && (
//               <CText style={styles.noResultsText}>Konum bulunamadı.</CText>
//             )}

//             {locationResults.length > 0 && (
//               <FlatList
//                 data={locationResults}
//                 keyExtractor={(item, index) => item.place_id + index}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.suggestionItem}
//                     onPress={() => handleSelectLocation(item)}
//                   >
//                     <CText style={styles.suggestionText}>{item.description}</CText>
//                   </TouchableOpacity>
//                 )}
//                 style={styles.suggestionList}
//                 scrollEnabled={false}
//               />
//             )}

//             {coords && (
//               <>
//                 <MapView
//                   style={styles.map}
//                   initialRegion={{
//                     latitude: coords.latitude,
//                     longitude: coords.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                   region={{
//                     latitude: coords.latitude,
//                     longitude: coords.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                 >
//                   <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} />
//                 </MapView>

//                 <View style={styles.addressContainer}>
//                   <CText style={styles.addressText}>{address}</CText>
//                 </View>

//               </>
//             )}

//             <CButton title="Konumumu Bul" onPress={getLocation} disabled={loading} />
//           </View>

//           <CButton
//             title="İleri"
//             onPress={next}
//             disabled={!coords}
//             style={styles.nextButton}
//           />
//         </View>
//       )}
//     </>
//   );
// };

// const getStyles = (colors: any) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: responsive(20),
//       backgroundColor: colors.BACKGROUND_COLOR,
//       justifyContent: "space-between",
//     },
//     title: {
//       fontSize: responsive(28),
//       fontWeight: "700",
//       color: colors.TEXT_MAIN_COLOR,
//       marginTop: responsive(50),
//       marginBottom: responsive(8),
//     },
//     description: {
//       fontSize: responsive(16),
//       color: colors.GRAY_COLOR,
//       marginBottom: responsive(25),
//     },
//     map: {
//       width: "100%",
//       height: responsive(250),
//       marginTop: responsive(20),
//     },
//     addressContainer: {
//       marginTop: responsive(15),
//       paddingHorizontal: responsive(10),
//     },
//     addressText: {
//       fontSize: responsive(14),
//       color: colors.TEXT_MAIN_COLOR,
//       textAlign: "center",
//     },
//     nextButton: {
//       width: responsive(100),
//       alignSelf: "flex-end",
//       marginBottom: responsive(20)
//     },

//     inputContainer: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       gap: 10,
//       marginBottom: responsive(10),
//     },
//     locateButton: {
//       borderRadius: 14,
//       marginTop: 34,
//       padding: 11,
//       justifyContent: "center",
//       alignItems: "center",
//       backgroundColor: colors.BLACK_COLOR,
//     },
//     suggestionList: {
//       marginBottom: responsive(20),
//       borderWidth: 0.5,
//       borderColor: colors.GRAY_COLOR,
//       borderRadius: 14,
//       backgroundColor: colors.EXTRA_LIGHT_GRAY,
//     },
//     suggestionItem: {
//       height: 50,
//       padding: responsive(10),
//       justifyContent: "center"
//     },
//     suggestionText: {
//       fontSize: responsive(14),
//       color: colors.TEXT_MAIN_COLOR,
//     },
//     noResultsText: {
//       fontSize: responsive(14),
//       color: colors.GRAY_COLOR,
//       padding: responsive(10),
//     },

//   });

// export default AddProfile4;


//---------------- Sadece Konumumu Bul butonu ile konum buluyor ve haritada gösteriyor. Ayrıca kullanıcı isterse imlece tıklayarak konumu düzenleyebiliyor. ----------------------

import React, { useState } from "react";
import { View, PermissionsAndroid, Platform, StyleSheet } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker } from "react-native-maps";
import CButton from "../../../components/CButton";
import { responsive } from "../../../utils/responsive";
import { useTheme } from "../../../utils/colors";
import CustomBackButton from "../../../components/CBackButton";
import CLoading from "../../../components/CLoading";
import CText from "../../../components/CText/CText";
import { GOOGLE_API_KEY } from "../../../utils/constants/key";
import { ADD_PROFILE_5 } from "../../../navigators/Stack";

const AddProfile4 = ({ navigation, route }: any) => {
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
                    title: "Konum Erişimi İzni",
                    message: "Konumunuzu almak için izin gerekli.",
                    buttonPositive: "İzin Ver",
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
                setAddress("Adres bilgisi alınamadı.");
            }
        } catch (err) {
            setAddress("Adres bilgisi alınırken hata oluştu.");
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniye beklet
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

    const next = () => {
        if (!coords) return;
        navigation.navigate(ADD_PROFILE_5, {
            ...route.params,
            location: address,
            latitude: coords.latitude,
            longitude: coords.longitude,
            province,
            country,
        });
    };

    // console.log(coords?.latitude, coords?.longitude, province, country, address)

    return (
        <>
            {loading ? (
                <CLoading visible={loading} />
            ) : (
                <View style={styles.container}>
                    <View>
                        <CustomBackButton />

                        <CText style={styles.title}>Nerede yaşıyorsun?</CText>
                        <CText style={styles.description}>
                            Profilini oluşturmak için bulunduğun konumu paylaş. Bu bilgi eşleşmelerini daha doğru hale getirir.
                        </CText>

                        <CButton title="Konumumu Bul" onPress={getLocation} disabled={loading} />

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
                                        İstersen harita üzerindeki imleci sürükleyerek konumunu manuel olarak da belirleyebilirsin.
                                    </CText>
                                </View>

                            </>
                        )}
                    </View>

                    <CButton
                        title="İleri"
                        onPress={next}
                        disabled={!coords}
                        style={styles.nextButton}
                    />
                </View>
            )}
        </>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: responsive(20),
            backgroundColor: colors.BACKGROUND_COLOR,
            justifyContent: "space-between",
        },
        title: {
            fontSize: responsive(28),
            fontWeight: "700",
            color: colors.TEXT_MAIN_COLOR,
            marginTop: responsive(50),
            marginBottom: responsive(8),
        },
        description: {
            fontSize: responsive(16),
            color: colors.GRAY_COLOR,
            marginBottom: responsive(25),
        },
        map: {
            width: "100%",
            height: responsive(350),
            marginTop: responsive(20),
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
        nextButton: {
            width: responsive(100),
            alignSelf: "flex-end",
            marginBottom: responsive(23),
        },
    });

export default AddProfile4;
