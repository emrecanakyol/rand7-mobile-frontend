import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LikeMatched = () => {
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

            <Text style={styles.title}>
                {t('likeMatched.awesome')}
            </Text>
            <Text style={styles.title}>
                {t('likeMatched.matched')}
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

                {/* Orta %80 */}
                <View style={styles.percentageCircle}>
                    <Ionicons name="heart" size={28} color={colors.RED_COLOR} />

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
                    <Text style={styles.messageButtonText}>{t('likeMatched.sendMessage')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.keepSwipingButton}>
                    <Text style={styles.keepSwipingText}>{t('likeMatched.keepSwiping')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default LikeMatched;

const getStyles = (colors: any, isTablet: boolean, height: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDEBFD',
    },
    closeButtonContainer: {
        alignItems: "flex-end",
        marginBottom: 55,
    },
    closeButton: {
        backgroundColor: colors.LIGHT_GRAY,
        borderWidth: 0.5,
        borderColor: colors.GRAY_COLOR,
        borderRadius: 100,
        padding: 7,
        marginRight: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#3B0A45',
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
        borderColor: colors.RED_COLOR,
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
        backgroundColor: '#3B0A45',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    messageButton: {
        backgroundColor: '#3B0A45',
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
    },
    keepSwipingText: {
        color: colors.RED_COLOR,
        fontWeight: '600',
        fontSize: 16,
    },
});
