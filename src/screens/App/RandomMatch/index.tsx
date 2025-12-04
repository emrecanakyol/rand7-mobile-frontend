import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Header from '../../../components/Header';
import { useAppSelector } from '../../../store/hooks';
import Icon from 'react-native-vector-icons/Ionicons';
import MatchSearchingLoading from './components/MatchSearchingLoading';
import { ANONIM_CHAT } from '../../../navigators/Stack';

const RandomMatch = () => {
    const { userData } = useAppSelector((state) => state.userData);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const [matchLoading, setMatchLoading] = useState(false);

    // Rastgele saniye bekletmek için fonksiyon
    const getRandomDelay = () => {
        const delays = [5000, 10000, 15000, 20000]; // ms cinsinden
        const randomIndex = Math.floor(Math.random() * delays.length);
        return delays[randomIndex];
    };

    // Rastgele 2 annonId çek
    // const handlePress = async () => {
    //     setMatchLoading(true);
    //     try {
    //         const meAnnonId = userData?.annonId; // 👈 kendi annonId
    //         if (!meAnnonId) throw new Error('Me annonId yok');

    //         // Tüm kullanıcıları çek
    //         const usersSnapshot = await firestore().collection('users').get();
    //         const otherAnnonIds: string[] = [];

    //         usersSnapshot.forEach(doc => {
    //             const d = doc.data() as any;
    //             if (d?.annonId && d.annonId !== meAnnonId) {
    //                 otherAnnonIds.push(d.annonId);
    //             }
    //         });

    //         if (otherAnnonIds.length === 0) {
    //             console.log('Eşleşecek başka annonId yok.');
    //             return;
    //         }

    //         // Rastgele 1 kişi seç
    //         const picked = otherAnnonIds[Math.floor(Math.random() * otherAnnonIds.length)];

    //         // İsteğe bağlı bekletme
    //         await new Promise(r => setTimeout(r, getRandomDelay()));
    //         navigation.navigate(ANONIM_CHAT, {
    //             annonId: meAnnonId,
    //             other2Id: picked
    //         });
    //     } catch (e) {
    //         console.log('Annon match error:', e);
    //     } finally {
    //         setMatchLoading(false);
    //     }
    // };

    // Rastgele 2 annonId çek
    const handlePress = async () => {
        setMatchLoading(true);
        try {
            const meId = userData?.userId;
            const meAnnonId = userData?.annonId;
            if (!meId || !meAnnonId) throw new Error('annonId veya userId yok');

            // Benim daha önce match olduğum kullanıcılar
            const blockedIds = new Set([
                ...(userData?.likeMatches || []),
                ...(userData?.superLikeMatches || []),
                ...(userData?.blockers || []), // engellenen kullanıcıları da gösterme
                ...(userData?.blocked || []), // engellenen kullanıcıları da gösterme
            ]);

            // 5 dakikalık online içinde mi?
            const cutoffMs = Date.now() - 55 * 60 * 1000; // 5 dk önceki timestamp (ms)

            // Tüm kullanıcıları çek
            const usersSnapshot = await firestore().collection('users').get();

            // Uygun adayların annonId listesini çıkar
            const candidates = usersSnapshot.docs
                .map(d => d.data() as any)
                .filter(u => {
                    // aktif mi? (lastOnline varsa ve son 5 dk içinde mi)
                    const lastOnlineDate =
                        u?.lastOnline?.toDate
                            ? u.lastOnline.toDate()
                            : undefined;
                    // Aktif değilse geç
                    const isActiveRecently =
                        lastOnlineDate
                            ? lastOnlineDate.getTime() >= cutoffMs
                            : false; // lastOnline yoksa aktif sayma

                    return (
                        u?.userId &&                                   // geçerli kullanıcı mı
                        u?.annonId &&                                  // anonim id var mı
                        u.userId !== meId &&                           // ben değil
                        !blockedIds.has(u.userId) &&                   // ben zaten onunla match değil miyim
                        isActiveRecently                               // SON 5 DK içinde online mı
                        // !(u.likeMatches || []).includes(meId) &&    // Karşı tarafın datasında o zaten benimle match mi?
                        // !(u.superLikeMatches || []).includes(meId)  // Karşı tarafın datasında o zaten benimle match mi?
                    )
                })
                .map(u => u.annonId);

            if (!candidates.length) {
                console.log('Uygun anonim eşleşme yok.');
                return;
            }

            const picked = candidates[Math.floor(Math.random() * candidates.length)];

            // Yapay gecikme
            await new Promise(r => setTimeout(r, getRandomDelay()));

            navigation.navigate(ANONIM_CHAT, {
                annonId: meAnnonId,
                other2Id: picked,
            });
        } catch (e) {
            console.log('Annon match error:', e);
        } finally {
            setMatchLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header userData={userData} />

            {matchLoading ? (
                <View style={styles.loaderWrap}>
                    <MatchSearchingLoading />
                </View>
            ) : (
                <View style={styles.inContainer}>
                    <LottieView
                        source={require('../../../assets/lottie/chat-balloon.json')}
                        style={styles.matchLottie}
                        autoPlay
                        loop
                        speed={0.7}
                    />

                    <Text style={styles.title}>{t("random_match_title")}</Text>


                    <Text style={styles.subtitle}>
                        {t("random_match_subtitle")}
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handlePress}
                        accessibilityRole="button"
                        accessibilityLabel={t("random_match_cta_label")}
                        style={styles.ctaButton}
                    >
                        <Icon name="shuffle-outline" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        inContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: "center",
        },
        title: {
            fontSize: isTablet ? 42 : 32,
            fontWeight: '700',
            color: colors.TEXT_MAIN_COLOR,
            letterSpacing: 0.2,
            marginBottom: responsive(10),
            textAlign: 'center',
        },
        subtitle: {
            fontSize: isTablet ? 20 : 16,
            color: colors.TEXT_DESCRIPTION_COLOR,
            lineHeight: isTablet ? 28 : 24,
            textAlign: 'center',
            marginBottom: responsive(36),
        },
        ctaButton: {
            height: isTablet ? 78 : 64,
            minWidth: isTablet ? 260 : 220,
            paddingHorizontal: responsive(28),
            borderRadius: 999,
            backgroundColor: '#141414',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
        },
        loaderWrap: {
            marginTop: responsive(140),
            alignItems: 'center',
            gap: responsive(8),
        },
        matchLottie: {
            width: isTablet ? 220 : 160,
            height: isTablet ? 220 : 160,
        },
        lottie: {
            width: isTablet ? 220 : 160,
            height: isTablet ? 220 : 160,
        },
        loadingText: {
            marginTop: responsive(4),
            fontSize: isTablet ? 18 : 14,
            color: colors.TEXT_SECONDARY ?? '#4A4A4A',
        },
        modalBody: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: responsive(24),
            gap: responsive(16),
        },
        modalSubtitle: {
            fontSize: isTablet ? 20 : 16,
            textAlign: 'center',
            color: colors.TEXT_DESCRIPTION_COLOR,
            marginTop: responsive(6),
            marginBottom: responsive(12),
            lineHeight: isTablet ? 28 : 24,
        },
        modalButtons: {
            width: '100%',
            flexDirection: 'row',
            gap: responsive(10),
            marginTop: responsive(12),
        },
        modalBtn: {
            flex: 1,
            paddingVertical: responsive(14),
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E4E4E4',
        },
        modalBtnGhost: {
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        modalBtnPrimary: {
            backgroundColor: colors.BLUE_COLOR,
        },
        modalBtnText: {
            fontSize: 16,
            fontWeight: '700',
        },
    });

export default RandomMatch;