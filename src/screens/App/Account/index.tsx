import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { EDIT_PROFILE, HELP, MYPROFILE, ONEBOARDINGONE, SETTINGS } from '../../../navigators/Stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../utils/colors';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/Store';
import { useAppSelector } from '../../../store/hooks';
import { fetchUserData } from '../../../store/services/userDataService';
import CImage from '../../../components/CImage';
import { calculateAge } from '../../../components/CalculateAge';
import { signOut } from '../../../store/services/authServices';

const SettingsScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userData, loading } = useAppSelector((state) => state.userData);
    const navigation: any = useNavigation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);

    useEffect(() => {
        dispatch(fetchUserData());
    }, []);

    const out = async () => {
        await signOut(dispatch);
        await navigation.navigate(ONEBOARDINGONE);
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                {/* 👤 Profil Bölümü */}
                <View style={styles.profileSection}>
                    <TouchableOpacity onPress={() => navigation.navigate(MYPROFILE)}>
                        <View>
                            <CImage
                                imgSource={{ uri: userData?.photos?.[0] }}
                                disablePress={true}
                                width={100}
                                height={100}
                                borderRadius={100}
                                borderWidth={4}
                                borderColor={colors.BLACK_COLOR}
                                resizeMode="cover"
                            />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>{userData.firstName}, {calculateAge(userData.birthDate)}</Text>
                    <Text style={styles.userLocation}>{userData.province}, {userData.country}</Text>
                </View>

                {/* 📈 Profil Tamamlama Kartı */}
                <View style={styles.progressCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.progressSubText}>
                            Tam profil ile bir adım öne çıkın !
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate(EDIT_PROFILE)}>
                        <Text style={styles.editButtonText}>Profili Düzenle</Text>
                    </TouchableOpacity>
                </View>

                {/* 🧭 Menü Seçenekleri */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(HELP)}>
                        <Ionicons name="person-outline" size={22} color={colors.BLUE_COLOR} />
                        <Text style={styles.menuText}>Yardım / Destek</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={20}
                            color="#999"
                            style={{ marginLeft: 'auto' }}
                        />
                    </TouchableOpacity>
                    {/* 
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="language-outline" size={22} color={colors.BLUE_COLOR} />
                        <Text style={styles.menuText}>Language</Text>
                        <Text style={styles.menuSubText}>English</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={20}
                            color="#999"
                            style={{ marginLeft: 6 }}
                        />
                    </TouchableOpacity> */}

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(SETTINGS)}>
                        <Ionicons name="settings-outline" size={22} color={colors.BLUE_COLOR} />
                        <Text style={styles.menuText}>Settings</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={20}
                            color="#999"
                            style={{ marginLeft: 'auto' }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={out}>
                        <Ionicons name="close-outline" size={22} color={colors.BLUE_COLOR} />
                        <Text style={styles.menuText}>Çıkış yap</Text>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={20}
                            color="#999"
                            style={{ marginLeft: 'auto' }}
                        />
                    </TouchableOpacity>
                </View>

                {/* ⭐ Premium Kartı */}
                {/* <View style={styles.premiumCard}>
                    <View style={styles.starCircle}>
                        <Ionicons name="star" size={24} color="#fff" />
                    </View>
                    <Text style={styles.premiumTitle}>Get more matches</Text>
                    <Text style={styles.premiumSub}>
                        Be seen by more people in Encounters
                    </Text>
                    <TouchableOpacity>
                        <Text style={styles.premiumLink}>Upgrade to Premium</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
        </ScrollView>

    );
};

export default SettingsScreen;

const getStyles = (colors: any, isTablet: boolean, height: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
        paddingHorizontal: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 30,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1C',
        marginTop: 10,
    },
    userLocation: {
        color: '#9A9A9A',
        fontSize: 13,
        marginTop: 2,
        letterSpacing: 0.5,
    },
    progressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#F6E1FB',
        backgroundColor: colors.LIGHT_GRAY,
        borderRadius: 16,
        // padding: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 25,
    },
    progressSubText: {
        color: '#4A4A4A',
        fontSize: 13,
        marginTop: 4,
    },
    editButton: {
        backgroundColor: colors.BLACK_COLOR,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
    menuContainer: {
        marginTop: 30,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE_COLOR,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1C',
        marginLeft: 10,
    },
    menuSubText: {
        color: '#9A9A9A',
        fontSize: 13,
        marginLeft: 'auto',
    },
    premiumCard: {
        backgroundColor: '#F9F1FC',
        borderRadius: 18,
        alignItems: 'center',
        paddingVertical: 26,
        marginTop: 30,
    },
    starCircle: {
        backgroundColor: '#E56BFA',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    premiumTitle: {
        fontWeight: '700',
        fontSize: 16,
        color: '#2C004D',
    },
    premiumSub: {
        fontSize: 13,
        color: '#777',
        marginTop: 4,
    },
    premiumLink: {
        color: '#E56BFA',
        fontWeight: '700',
        marginTop: 8,
    },
});
