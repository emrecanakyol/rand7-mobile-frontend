import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { sendNotification } from '../../../constants/Notifications';
import { MATCH } from '../../../navigators/BottomTabs';
import FastImage from 'react-native-fast-image';

const LikeMatched = () => {
    const navigation: any = useNavigation();
    const route = useRoute<any>();
    const { user1, user2 } = route.params || {};
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);
    const notificationSentRef = useRef(false);

    const user1Photo =
        user1?.photos?.find((p: string) => typeof p === 'string' && p.startsWith('http')) ||
        user1?.photos?.[0] ||
        'https://images.pexels.com/photos/2589650/pexels-photo-2589650.jpeg';

    const user2Photo =
        user2?.photos?.find((p: string) => typeof p === 'string' && p.startsWith('http')) ||
        user2?.photos?.[0] ||
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg';

    useEffect(() => {
        if (notificationSentRef.current) return;

        const sendMatchNotifications = async () => {
            try {
                const user1Tokens: string[] = user1?.fcmTokens || [];
                const user2Tokens: string[] = user2?.fcmTokens || [];

                // Aynı token 2 kere gitmesin
                const allTokens = Array.from(
                    new Set([...user1Tokens, ...user2Tokens])
                );

                if (!allTokens.length) return;

                await sendNotification(
                    allTokens,
                    t('newLikeMatchNotificationTitle'),
                    t('newLikeMatchNotificationDesc'),
                    {
                        type: 'like_matched',
                        user1Id: user1?.id ?? '',
                        user2Id: user2?.id ?? '',
                    }
                );

                notificationSentRef.current = true;
            } catch (err) {
                console.log('Match notification error:', err);
            }
        };

        sendMatchNotifications();
    }, []);

    return (
        <View style={styles.container}>
            {/* Geri Butonu */}
            <View style={styles.closeButtonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.pop(2)}>
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
                    <FastImage
                        source={{
                            uri: user1Photo,
                            priority: FastImage.priority.high,
                        }}
                        style={styles.profileImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />

                </View>

                {/* Orta %80 */}
                <View style={styles.percentageCircle}>
                    <Ionicons name="heart" size={28} color={colors.RED_COLOR} />

                </View>

                {/* Sağ fotoğraf */}
                <View style={[styles.imageWrapper, styles.rightBorder]}>
                    <FastImage
                        source={{
                            uri: user2Photo,
                            priority: FastImage.priority.high,
                        }}
                        style={styles.profileImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />

                </View>
            </View>

            {/* Butonlar */}
            <View style={styles.buttonsContainer}>
                {/* <TouchableOpacity style={styles.messageButton}>
                    <Text style={styles.messageButtonText}>{t('likeMatched.sendMessage')}</Text>
                </TouchableOpacity> */}

                {/* <TouchableOpacity style={styles.keepSwipingButton}>
                    <Text style={styles.keepSwipingText}>{t('likeMatched.keepSwiping')}</Text>
                </TouchableOpacity> */}

                <TouchableOpacity style={styles.messageButton} onPress={() => navigation.pop(2)}>
                    <Text style={styles.messageButtonText}>{t('likeMatched.keepSwiping')}</Text>
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
