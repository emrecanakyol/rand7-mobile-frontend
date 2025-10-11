import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SuperLikeMatched = () => {
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);

    return (
        <View style={styles.container}>
            {/* Geri Butonu */}
            <View style={styles.closeButtonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={22} color={colors.BLACK_COLOR} />
                </TouchableOpacity>
            </View>

            {/* Başlık */}
            <Text style={styles.title}>
                Mükemmel !
            </Text>
            <Text style={styles.title}>
                Karşılıklı süper bir eşleşme 💫
            </Text>

            {/* Profil Görselleri */}
            <View style={styles.profileContainer}>
                {/* Sol fotoğraf */}
                <View style={[styles.imageWrapper, styles.leftBorder]}>
                    <Image
                        source={{
                            uri: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400',
                        }}
                        style={styles.profileImage}
                    />
                </View>

                {/* Orta ikona */}
                <View style={styles.percentageCircle}>
                    <Ionicons name="star" size={30} color="#00BFFF" />
                </View>

                {/* Sağ fotoğraf */}
                <View style={[styles.imageWrapper, styles.rightBorder]}>
                    <Image
                        source={{
                            uri: 'https://images.unsplash.com/photo-1502767089025-6572583495b0?w=400',
                        }}
                        style={styles.profileImage}
                    />
                </View>
            </View>

            {/* Butonlar */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.messageButton}>
                    <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.keepSwipingButton}>
                    <Text style={styles.keepSwipingText}>Keşfetmeye devam et</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SuperLikeMatched;

const getStyles = (colors: any, isTablet: boolean, height: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD', // Mavi arka plan
    },
    closeButtonContainer: {
        alignItems: "flex-end",
        marginBottom: 55,
    },
    closeButton: {
        backgroundColor: '#F1F8FF',
        borderWidth: 0.5,
        borderColor: '#90CAF9',
        borderRadius: 100,
        padding: 7,
        marginRight: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0D47A1',
        textAlign: 'center',
        marginTop: 5,
    },
    profileContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 60,
    },
    imageWrapper: {
        width: 140,
        height: 140,
        borderRadius: 100,
        overflow: 'hidden',
    },
    leftBorder: {
        borderWidth: 5,
        borderColor: colors.BLUE_COLOR, // Mavi kenar
    },
    rightBorder: {
        borderWidth: 5,
        borderColor: '#FFFFFF',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
    },
    percentageCircle: {
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -30 }],
        backgroundColor: '#0D47A1',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        shadowColor: colors.BLUE_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    messageButton: {
        backgroundColor: colors.BLUE_COLOR,
        width: '80%',
        paddingVertical: 18,
        borderRadius: 40,
        alignItems: 'center',
        marginBottom: 20,
    },
    messageButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    keepSwipingButton: {
        backgroundColor: '#fff',
        width: '80%',
        paddingVertical: 18,
        borderRadius: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.BLUE_COLOR,
    },
    keepSwipingText: {
        color: colors.BLUE_COLOR,
        fontWeight: '600',
        fontSize: 16,
    },
});
