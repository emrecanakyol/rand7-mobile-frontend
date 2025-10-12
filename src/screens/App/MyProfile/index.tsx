import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/Store';
import { useAppSelector } from '../../../store/hooks';
import { fetchUserData } from '../../../store/services/userDataService';
import { calculateAge } from '../../../components/CalculateAge';

const Profile = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userData, loading } = useAppSelector((state) => state.userData);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const navigation: any = useNavigation();
    const snapPoints = useMemo(() => ['35%', '90%'], []);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);

    useEffect(() => {
        dispatch(fetchUserData());
    }, []);

    // 🔧 Doğru index hesaplama
    const handleMomentumScrollEnd = (
        e: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / (height * 0.75)); // tam kart yüksekliği kadar hesapla
        setActiveIndex(index);
    };

    return (
        <View style={styles.container}>
            {/* ⚙️ Ayarlar Butonu */}
            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.goBack()}>
                <Ionicons name="close-outline" size={26} color="#fff" />
            </TouchableOpacity>

            {/* 📸 Dikey Kaydırılabilir Fotoğraflar */}
            <View style={styles.imageContainer}>
                <FlatList
                    data={userData.photos}
                    keyExtractor={(item, index) => index.toString()}
                    pagingEnabled
                    snapToInterval={height * 0.75}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    renderItem={({ item }) => (
                        <View style={{ width, height: height * 0.75 }}>
                            <Image
                                source={{ uri: item }}
                                style={styles.profileImage}
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                style={styles.gradientOverlay}
                            />
                        </View>
                    )}
                />

                {/* 🔘 Dikey Nokta Göstergesi */}
                <View style={styles.verticalDotContainer}>
                    {userData.photos.map((index: number) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor:
                                        index === activeIndex
                                            ? '#fff'
                                            : 'rgba(255,255,255,0.4)',
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* 👤 Kullanıcı Bilgisi */}
                <View style={styles.userInfoContainer}>
                    <Text style={styles.userName}>{userData.firstName}, {calculateAge(userData.birthDate)}</Text>
                    <Text style={styles.userLocation}>{userData.city}, {userData.country}</Text>
                </View>
            </View>

            {/* 🧾 Alt Panel */}
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={{ backgroundColor: '#ccc', width: 60 }}
            >
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.sheetContent}
                >
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>{userData.about}</Text>

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Interest</Text>
                    <View style={styles.interestContainer}>
                        {userData.hobbies?.map((item: string, index: number) => (
                            <View key={index} style={styles.hobbyChip}>
                                <Text style={styles.hobbyText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 30 }]}>More Info</Text>
                    <Text style={styles.aboutText}>
                        I enjoy photography, coffee, and spontaneous adventures 🌍. Let’s explore new places together!
                    </Text>
                </BottomSheetScrollView>
            </BottomSheet>
        </View >
    );
};

export default Profile;

const getStyles = (colors: any, isTablet: boolean, height: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        imageContainer: {
            height: '75%',
            position: 'absolute',
            width: '100%',
        },
        profileImage: {
            width: '100%',
            height: '100%',
        },
        gradientOverlay: {
            ...StyleSheet.absoluteFillObject,
        },
        verticalDotContainer: {
            position: 'absolute',
            right: 15,
            top: '40%',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        settingsButton: {
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: 'rgba(0,0,0,0.4)',
            borderRadius: 30,
            padding: 8,
            zIndex: 10,
        },
        userInfoContainer: {
            position: 'absolute',
            bottom: 120,
            alignSelf: 'center',
            alignItems: 'center',
        },
        userName: {
            color: colors.WHITE_COLOR,
            fontWeight: '700',
            fontSize: 22,
        },
        userLocation: {
            color: '#eee',
            fontSize: 14,
            marginTop: 2,
        },
        sheetBackground: {
            backgroundColor: colors.BACKGROUND_COLOR,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
        },
        sheetContent: {
            paddingHorizontal: 20,
            paddingBottom: 60,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: '#555',
            marginTop: 10,
        },
        aboutText: {
            fontSize: 14,
            color: '#666',
            marginTop: 5,
            lineHeight: 20,
        },
        interestContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap', // taşanları aşağıya at
            justifyContent: 'flex-start', // soldan hizala (space-between değil)
            alignItems: 'flex-start',
            marginTop: 10,
            gap: 8, // elemanlar arası boşluk
        },
        hobbyChip: {
            backgroundColor: colors.WHITE_COLOR,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
        },
        hobbyText: {
            color: '#333',
            fontSize: 14,
        },
    });
