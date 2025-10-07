import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { EDIT_PROFILE } from '../../../navigators/Stack';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
    const { width } = Dimensions.get('window');
    const navigation: any = useNavigation();

    return (
        <View style={styles.container}>
            {/* 🔙 Geri Butonu */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>

            {/* 👤 Profil Bölümü */}
            <View style={styles.profileSection}>
                <Image
                    source={{
                        uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
                    }}
                    style={styles.profileImage}
                />
                <Text style={styles.userName}>Nadia Lipshutz, 20</Text>
                <Text style={styles.userLocation}>FLORIDA, US</Text>
            </View>

            {/* 📈 Profil Tamamlama Kartı */}
            <View style={styles.progressCard}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.progressText}>70%</Text>
                    <Text style={styles.progressSubText}>
                        Complete your profile to stand out
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate(EDIT_PROFILE)}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* 🧭 Menü Seçenekleri */}
            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="person-outline" size={22} color="#E56BFA" />
                    <Text style={styles.menuText}>My Account</Text>
                    <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color="#999"
                        style={{ marginLeft: 'auto' }}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="language-outline" size={22} color="#E56BFA" />
                    <Text style={styles.menuText}>Language</Text>
                    <Text style={styles.menuSubText}>English</Text>
                    <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color="#999"
                        style={{ marginLeft: 6 }}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="settings-outline" size={22} color="#E56BFA" />
                    <Text style={styles.menuText}>Settings</Text>
                    <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color="#999"
                        style={{ marginLeft: 'auto' }}
                    />
                </TouchableOpacity>
            </View>

            {/* ⭐ Premium Kartı */}
            <View style={styles.premiumCard}>
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
            </View>
        </View>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 30,
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 20,
        zIndex: 10,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#E56BFA',
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
        backgroundColor: '#F6E1FB',
        borderRadius: 16,
        padding: 16,
        marginTop: 25,
    },
    progressText: {
        color: '#A02BE5',
        fontSize: 16,
        fontWeight: '700',
    },
    progressSubText: {
        color: '#4A4A4A',
        fontSize: 13,
        marginTop: 4,
    },
    editButton: {
        backgroundColor: '#2C004D',
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
        backgroundColor: '#FAFAFA',
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
