import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Header from '../../../components/Header';
import { useAppSelector } from '../../../store/hooks';
import Icon from 'react-native-vector-icons/Ionicons';
import MatchSearchingLoading from './components/MatchSearchingLoading';
import { ADD_PROFILE, ANONIM_CHAT } from '../../../navigators/Stack';
import { fetchUserData } from '../../../store/services/userDataService';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/Store';
import { getDistanceFromLatLonInKm } from '../../../components/KmLocation';
import { calculateAge } from '../../../components/CalculateAge';
import { getFcmToken, registerListenerWithFCM } from '../../../utils/fcmHelper';

const RandomMatch = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userData, loading } = useAppSelector((state) => state.userData);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const [matchLoading, setMatchLoading] = useState(false);

    // Veriler eksikse yine profil oluştur ekranına yönlendir
    // const checkUserProfile = async () => {
    //     if (loading) {
    //         return; // Veriler hâlâ yükleniyor, bekle
    //     } else if (!userData.firstName || !userData.lastName || !userData.photos?.length) {
    //         navigation.navigate(ADD_PROFILE);
    //         return;
    //     }
    // };
    const checkUserProfile = async () => {
        if (loading) {
            return;
        }

        const meId = userData?.userId;
        if (!meId) {
            return;
        }

        const snap = await firestore().collection('users').doc(meId).get();
        const me = snap.data() as any;

        const hasProfile =
            !!me?.firstName &&
            !!me?.lastName &&
            Array.isArray(me?.photos) &&
            me.photos.length > 0;

        if (!hasProfile) {
            navigation.reset({
                index: 0,
                routes: [{ name: ADD_PROFILE }],
            });
        }
    };

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchUserData());
        }, [dispatch])
    );

    useEffect(() => {
        if (!loading && userData) {
            checkUserProfile();
            getFcmToken();
        }
    }, [loading, userData]);

    useEffect(() => {
        const unsubscribe = registerListenerWithFCM(navigation);
        return unsubscribe;
    }, [navigation]);

    // Rastgele saniye bekletmek için fonksiyon
    const getRandomDelay = () => {
        const delays = [5000, 10000, 15000, 20000]; // ms cinsinden
        const randomIndex = Math.floor(Math.random() * delays.length);
        return delays[randomIndex];
    };

    const handlePress = async () => {
        setMatchLoading(true);
        let meIdForFinally: string | undefined;

        try {
            const meId = userData?.userId;
            meIdForFinally = meId;

            if (!meId) {
                throw new Error('userId yok');
            }

            // ✅ Me’yi taze çek (Filter değerleri en güncel olsun)
            const meSnap = await firestore().collection('users').doc(meId).get();
            const me = (meSnap.data() || {}) as any;

            const meAnnonId = me?.annonId;
            if (!meAnnonId) {
                throw new Error('annonId yok');
            }

            // ✅ engel + match listeleri
            const blockedIds = new Set<string>([
                ...(me?.likeMatches || []),
                ...(me?.superLikeMatches || []),
                ...(me?.blockers || []),
                ...(me?.blocked || []),
            ]);

            // ✅ Filter kriterleri (Discover ile aynı mantık)
            const maxDistance = typeof me?.maxDistance === 'number' ? me.maxDistance : 150;

            const minAge =
                typeof me?.ageRange?.min === 'number'
                    ? me.ageRange.min
                    : 18;

            const maxAge =
                typeof me?.ageRange?.max === 'number'
                    ? me.ageRange.max
                    : 90;

            const lookingFor = (me?.lookingFor || 'both')?.toLowerCase();
            const myLat = me?.latitude;
            const myLng = me?.longitude;

            // konum yoksa filtre uygulamak sağlıklı değil
            if (typeof myLat !== 'number' || typeof myLng !== 'number') {
                throw new Error('Konum (latitude/longitude) yok');
            }

            // 1️⃣ kendimi arıyor moduna al
            await firestore()
                .collection('users')
                .doc(meId)
                .set(
                    {
                        isRandomSearching: true,
                        randomSearchingAt: firestore.FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );

            // animasyon için random delay
            // await new Promise(r => setTimeout(r, getRandomDelay()));

            // 2️⃣ tüm kullanıcıları çek
            const usersSnapshot = await firestore().collection('users').get();

            // 3️⃣ uygun adayları filtrele
            const candidates = usersSnapshot.docs
                .map(d => d.data() as any)
                .filter(u => {
                    if (!u?.userId || !u?.annonId) return false;

                    // ben değil
                    if (u.userId === meId) return false;

                    // block/match listesinde olmasın
                    if (blockedIds.has(u.userId)) return false;

                    // sadece random searching olanlar
                    if (!u.isRandomSearching) return false;

                    // ✅ karşı tarafın da beni blocklamış olma ihtimali
                    const otherBlocked = Array.isArray(u?.blocked) ? u.blocked : [];
                    const otherBlockers = Array.isArray(u?.blockers) ? u.blockers : [];

                    // u beni blocked listesine eklediyse veya blockers listesine eklediyse => elenir
                    if (otherBlocked.includes(meId) || otherBlockers.includes(meId)) return false;

                    // ✅ filtre: distance
                    if (typeof u?.latitude !== 'number' || typeof u?.longitude !== 'number') return false;

                    const distance = getDistanceFromLatLonInKm(
                        myLat,
                        myLng,
                        u.latitude,
                        u.longitude
                    );

                    if (distance > maxDistance) return false;

                    // ✅ filtre: age
                    const age = calculateAge(u.birthDate);
                    if (!Number.isFinite(age)) return false;

                    if (age < minAge || age > maxAge) return false;

                    // ✅ filtre: gender (lookingFor)
                    const otherGender = (u?.gender || '')?.toLowerCase();

                    const matchesGender =
                        lookingFor === 'both' ||
                        !lookingFor ||
                        lookingFor === otherGender;

                    if (!matchesGender) return false;

                    return true;
                })
                .map(u => u.annonId);

            if (!candidates.length) {
                console.log('Filtreye uygun random match arayan kullanıcı yok.');
                return;
            }

            // Rastgele 1 aday seç
            const picked = candidates[Math.floor(Math.random() * candidates.length)];

            navigation.navigate(ANONIM_CHAT, {
                annonId: meAnnonId,
                other2Id: picked,
            });
        } catch (e) {
            console.log('Annon match error:', e);
        } finally {
            // kendimi searching modundan çıkar
            try {
                if (meIdForFinally) {
                    await firestore()
                        .collection('users')
                        .doc(meIdForFinally)
                        .set(
                            { isRandomSearching: false },
                            { merge: true }
                        );
                }
            } catch (innerErr) {
                console.log('Random search flag reset error:', innerErr);
            }

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