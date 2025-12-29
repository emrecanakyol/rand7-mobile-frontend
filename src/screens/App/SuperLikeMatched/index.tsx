import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { sendNotification } from '../../../constants/Notifications';

const SuperLikeMatched = () => {
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
                    t('newSuperLikeMatchNotificationTitle'),
                    t('newSuperLikeMatchNotificationDesc'),
                    {
                        type: 'superlike_matched',
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
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={22} color={colors.BLACK_COLOR} />
                </TouchableOpacity>
            </View>

            {/* Başlık */}
            <Text style={styles.title}>
                {t('superLikeMatched.awesome')}
            </Text>
            <Text style={styles.title}>
                {t('superLikeMatched.matched')}
            </Text>

            {/* Profil Görselleri */}
            <View style={styles.profileContainer}>
                {/* Sol fotoğraf */}
                <View style={[styles.imageWrapper, styles.leftBorder]}>
                    <Image
                        source={{
                            uri: user1Photo,
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
                            uri: user2Photo,
                        }}
                        style={styles.profileImage}
                    />
                </View>
            </View>

            {/* Butonlar */}
            <View style={styles.buttonsContainer}>
                {/* <TouchableOpacity style={styles.messageButton}>
                    <Text style={styles.messageButtonText}>{t('superLikeMatched.sendMessage')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.keepSwipingButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.keepSwipingText}>{t('superLikeMatched.keepExploring')}</Text>
                </TouchableOpacity> */}

                <TouchableOpacity style={styles.messageButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.messageButtonText}>{t('superLikeMatched.keepExploring')}</Text>
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
