import React, { useRef, useMemo, useState } from 'react';
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
import { SETTINGS } from '../../../navigators/Stack';

const Account = () => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const navigation: any = useNavigation();
    const snapPoints = useMemo(() => ['35%', '90%'], []);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);

    const photos = [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    ];

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
            {/* 📸 Dikey Kaydırılabilir Fotoğraflar */}
            <View style={styles.imageContainer}>
                <FlatList
                    data={photos}
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

                {/* ⚙️ Ayarlar Butonu */}
                <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate(SETTINGS)}>
                    <Ionicons name="settings-outline" size={26} color="#fff" />
                </TouchableOpacity>

                {/* 🔘 Dikey Nokta Göstergesi */}
                <View style={styles.verticalDotContainer}>
                    {photos.map((_, index) => (
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
                    <Text style={styles.userName}>Alfredo Calzoni, 20</Text>
                    <Text style={styles.userLocation}>Hamburg, Germany</Text>
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
                    <Text style={styles.aboutText}>
                        A good listener. I love having a good talk to know each other’s side 😍.
                    </Text>

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Interest</Text>
                    <View style={styles.interestContainer}>
                        <View style={styles.interestTag}>
                            <Text style={styles.interestText}>🌿 Nature</Text>
                        </View>
                        <View style={styles.interestTag}>
                            <Text style={styles.interestText}>🏝️ Travel</Text>
                        </View>
                        <View style={styles.interestTag}>
                            <Text style={styles.interestText}>✍️ Writing</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 30 }]}>More Info</Text>
                    <Text style={styles.aboutText}>
                        I enjoy photography, coffee, and spontaneous adventures 🌍. Let’s explore new places together!
                    </Text>
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    );
};

export default Account;

const getStyles = (colors: any, isTablet: boolean, height: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#000',
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
            right: 20,
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
            color: '#fff',
            fontWeight: '700',
            fontSize: 22,
        },
        userLocation: {
            color: '#eee',
            fontSize: 14,
            marginTop: 2,
        },
        sheetBackground: {
            backgroundColor: '#fff',
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
            flexWrap: 'wrap',
            marginTop: 10,
            gap: 10,
        },
        interestTag: {
            backgroundColor: '#F2F2F2',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
        },
        interestText: {
            fontSize: 14,
            color: '#444',
        },
    });
