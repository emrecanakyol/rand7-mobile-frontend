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
    TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useAppSelector } from '../../../store/hooks';
import { CHAT, LIKE_MATCHED, SUPER_LIKE_MATCHED } from '../../../navigators/Stack';
import CLoading from '../../../components/CLoading';
import { getDistanceFromLatLonInKm } from '../../../components/KmLocation';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../../context/AlertContext';
import storage from '@react-native-firebase/storage';
import { sendNotification } from '../../../constants/Notifications';
import FastImage from 'react-native-fast-image';
import CModal from '../../../components/CModal';
import { ToastSuccess } from '../../../utils/toast';

const UserProfile = ({ route }: any) => {
    const { t } = useTranslation();
    const { user } = route.params || {};
    const { userData, loading } = useAppSelector((state) => state.userData);
    const { showAlert } = useAlert();

    const bottomSheetRef = useRef<BottomSheet>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isSuperLiked, setIsSuperLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [matchLoading, setMatchLoading] = useState(false);

    const navigation: any = useNavigation();
    const snapPoints = useMemo(() => ['35%', '90%'], []);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);
    const [hasAnyMatch, setHasAnyMatch] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportText, setReportText] = useState('');
    const [sendingReport, setSendingReport] = useState(false);
    const [isBlockedByMe, setIsBlockedByMe] = useState(false);
    const [isBlockedByOther, setIsBlockedByOther] = useState(false);
    const actionsDisabled = isBlockedByMe || isBlockedByOther;

    useEffect(() => {
        if (!userData?.userId || !user?.userId) return;

        const ref = firestore().collection('users').doc(userData.userId);

        const unsub = ref.onSnapshot((doc) => {
            const d = doc.data() as any;

            const blockersArr = Array.isArray(d?.blockers) ? d.blockers : [];
            const blockedArr = Array.isArray(d?.blocked) ? d.blocked : [];

            setIsBlockedByMe(blockersArr.includes(user.userId));
            setIsBlockedByOther(blockedArr.includes(user.userId));
        });

        return () => unsub();
    }, [userData?.userId, user?.userId]);

    const handleBlockUser = () => {
        if (!userData?.userId || !user?.userId) return;

        showAlert({
            title: t("anon_chat_block_title"),
            message: t("anon_chat_block_message"),
            layout: 'row',
            buttons: [
                {
                    text: t("common_cancel"),
                    type: 'cancel',
                },
                {
                    text: t("anon_chat_block_confirm"),
                    type: 'destructive',
                    onPress: async () => {
                        try {
                            await firestore()
                                .collection('users')
                                .doc(userData.userId)
                                .update({
                                    blockers: firestore.FieldValue.arrayUnion(user.userId),
                                });

                            await firestore()
                                .collection('users')
                                .doc(user.userId)
                                .update({
                                    blocked: firestore.FieldValue.arrayUnion(userData.userId),
                                });

                            navigation.goBack();
                        } catch (e) {
                            console.log("block error", e);
                        } finally {
                            setShowMenu(false);
                        }
                    },
                },
            ],
        });
    };

    const handleUnblockUser = () => {
        if (!userData?.userId || !user?.userId) return;

        showAlert({
            title: t("anon_chat_unblock_title"),
            message: t("anon_chat_unblock_message"),
            layout: 'row',
            buttons: [
                {
                    text: t("common_cancel"),
                    type: 'cancel',
                },
                {
                    text: t("anon_chat_unblock_confirm"),
                    type: 'default',
                    onPress: async () => {
                        try {
                            await firestore()
                                .collection('users')
                                .doc(userData.userId)
                                .update({
                                    blockers: firestore.FieldValue.arrayRemove(user.userId),
                                });

                            await firestore()
                                .collection('users')
                                .doc(user.userId)
                                .update({
                                    blocked: firestore.FieldValue.arrayRemove(userData.userId),
                                });
                        } catch (e) {
                            console.log("unblock error", e);
                        } finally {
                            setShowMenu(false);
                        }
                    },
                },
            ],
        });
    };

    const handleSendReport = async () => {
        if (!userData?.userId || !user?.userId) return;
        if (!reportText.trim()) return;

        try {
            setSendingReport(true);

            await firestore()
                .collection('users')
                .doc(userData.userId)
                .collection("reports")
                .add({
                    reporterId: userData.userId,
                    reportedId: user.userId,
                    message: reportText.trim(),
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });

            setReportText('');
            setReportModalVisible(false);
            ToastSuccess(
                t("common_thanks_title"),
                t("anon_chat_report_success")
            );
        } catch (e) {
            console.log('report error', e);
        } finally {
            setSendingReport(false);
        }
    };

    const handleOpenChat = () => {
        if (!userData?.userId || !user?.userId) return;

        navigation.navigate(CHAT, {
            userId: userData.userId,
            user2Id: user.userId,
        });
    };

    const handleRemoveMatch = () => {
        if (!userData?.userId || !user?.userId) return;

        showAlert({
            title: t('remove_match_title'),
            message: t('remove_match_message', { name: user?.firstName }),
            layout: 'row',
            buttons: [
                {
                    text: t('remove_match_cancel'),
                    type: 'cancel',
                },
                {
                    text: t('remove_match_confirm'),
                    type: 'destructive',
                    onPress: async () => {
                        try {
                            setMatchLoading(true);

                            const meRef = firestore().collection('users').doc(userData.userId);
                            const otherRef = firestore().collection('users').doc(user.userId);

                            const batch = firestore().batch();

                            batch.set(
                                meRef,
                                {
                                    likeMatches: firestore.FieldValue.arrayRemove(user.userId),
                                    superLikeMatches: firestore.FieldValue.arrayRemove(user.userId),
                                },
                                { merge: true }
                            );

                            batch.set(
                                otherRef,
                                {
                                    likeMatches: firestore.FieldValue.arrayRemove(userData.userId),
                                    superLikeMatches: firestore.FieldValue.arrayRemove(userData.userId),
                                },
                                { merge: true }
                            );

                            await batch.commit();
                            await deleteConversationBothSides(userData.userId, user.userId);

                            setHasAnyMatch(false);
                            setIsLiked(false);
                            setIsSuperLiked(false);
                        } catch (err) {
                            console.error(err);
                        } finally {
                            setMatchLoading(false);
                        }
                    },
                },
            ],
        });
    };

    const handleMomentumScrollEnd = (
        e: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / (height * 0.75));
        setActiveIndex(index);
    };

    // İlişki tipi -> i18n key
    const RELATIONSHIP_LABEL_KEYS: Record<string, string> = {
        long: 'relationship_long',
        short: 'relationship_short',
        friendship: 'relationship_friendship',
        chat: 'relationship_chat',
    };

    useEffect(() => {
        let unsubscribed = false;

        const checkStatus = async () => {
            setMatchLoading(true);
            try {
                if (!userData?.userId || !user?.userId) {
                    return;
                }

                const currentUserSnap = await firestore()
                    .collection('users')
                    .doc(userData.userId)
                    .get();

                const me = currentUserSnap.data() || {};

                // karşı tarafı da oku ve mevcut match var mı kontrol et
                const otherUserSnap = await firestore().collection('users').doc(user.userId).get();
                const other = otherUserSnap.data() || {};

                const anyMatch =
                    (me.likeMatches || []).includes(user.userId) ||
                    (me.superLikeMatches || []).includes(user.userId) ||
                    (other.likeMatches || []).includes(userData.userId) ||
                    (other.superLikeMatches || []).includes(userData.userId);

                const liked =
                    (me.likedUsers || []).includes(user.userId) ||
                    (me.likeMatches || []).includes(user.userId);

                const superLiked =
                    (me.superLikedUsers || []).includes(user.userId) ||
                    (me.superLikeMatches || []).includes(user.userId);

                const disliked =
                    Array.isArray(me.dislikedUsers) &&
                    me.dislikedUsers.includes(user.userId);

                if (!unsubscribed) {
                    setIsLiked(!!liked);
                    setIsSuperLiked(!!superLiked);
                    setIsDisliked(!!disliked);
                    setHasAnyMatch(!!anyMatch);
                }
            } catch {
                // sessiz geç
            } finally {
                setMatchLoading(false);
            }
        };

        checkStatus();
        return () => {
            unsubscribed = true;
        };
    }, [userData?.userId, user?.userId]);

    const handleLike = async (userId: string) => {
        if (!userData?.userId || !userData) {
            return;
        }

        setMatchLoading(true)
        try {
            const userRef = firestore().collection('users').doc(userId);
            const currentUserRef = firestore().collection('users').doc(userData.userId);

            const userSnap = await userRef.get();
            const likedUserData = userSnap.data();

            if (!likedUserData) {
                return;
            }

            // 🔻 ADD: Mevcut eşleşme var mı kontrol et (Firestore'dan)
            const meSnap = await currentUserRef.get();
            const meData = meSnap.data() || {};

            const alreadyLikeMatch =
                (meData.likeMatches || []).includes(userId) ||
                (likedUserData.likeMatches || []).includes(userData.userId);

            const alreadySuperLikeMatch =
                (meData.superLikeMatches || []).includes(userId) ||
                (likedUserData.superLikeMatches || []).includes(userData.userId);

            // varsa direkt ilgili ekrana git ve işlemi sonlandır
            if (alreadySuperLikeMatch) {
                navigation.navigate(SUPER_LIKE_MATCHED, { user1: userData, user2: likedUserData });
                return;
            }
            if (alreadyLikeMatch) {
                navigation.navigate(LIKE_MATCHED, { user1: userData, user2: likedUserData });
                return;
            }

            const theyLikedMe = likedUserData.likedUsers?.includes(userData.userId);
            const theySuperLikedMe = likedUserData.superLikedUsers?.includes(userData.userId);

            // 🔔 LIKE bildirimi (eşleşme yoksa)
            if (!theyLikedMe && !theySuperLikedMe) {
                const targetTokens: string[] = likedUserData?.fcmTokens || [];

                if (targetTokens.length > 0) {
                    await sendNotification(
                        targetTokens,
                        t('newLikeNotificationTitle'),
                        t('newLikeNotificationDesc'),
                        {
                            type: 'like',
                            fromUserId: userData.userId,
                        }
                    );
                }
            }

            await userRef.update({
                likers: firestore.FieldValue.arrayUnion(userData.userId),
                superLikers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            await currentUserRef.update({
                likedUsers: firestore.FieldValue.arrayUnion(userId),
                superLikedUsers: firestore.FieldValue.arrayRemove(userId),
            });

            setIsLiked(true);

            if (theyLikedMe && !theySuperLikedMe) {
                await currentUserRef.update({
                    likeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    likeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

                await Promise.all([
                    currentUserRef.update({
                        likers: firestore.FieldValue.arrayRemove(userId),
                        superLikers: firestore.FieldValue.arrayRemove(userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userId),
                    }),
                    userRef.update({
                        likers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikers: firestore.FieldValue.arrayRemove(userData.userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                    }),
                ]);

                navigation.navigate(LIKE_MATCHED, {
                    user1: userData,
                    user2: likedUserData,
                });
            } else if (theySuperLikedMe) {
                await currentUserRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

                await Promise.all([
                    currentUserRef.update({
                        likers: firestore.FieldValue.arrayRemove(userId),
                        superLikers: firestore.FieldValue.arrayRemove(userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userId),
                    }),
                    userRef.update({
                        likers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikers: firestore.FieldValue.arrayRemove(userData.userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                    }),
                ]);

                navigation.navigate(SUPER_LIKE_MATCHED, {
                    user1: userData,
                    user2: likedUserData,
                });
            }
        } catch (err) {
            console.error('❌ Like eklerken hata:', err);
        } finally {
            setMatchLoading(false)
        }
    };

    const handleSuperLike = async (userId: string) => {
        if (!userData?.userId || !userData) {
            return;
        }

        setMatchLoading(true)
        try {
            const userRef = firestore().collection('users').doc(userId);
            const currentUserRef = firestore().collection('users').doc(userData.userId);

            const userSnap = await userRef.get();
            const superLikedUserData = userSnap.data();

            if (!superLikedUserData) {
                return;
            }

            // 🔻 ADD: Mevcut eşleşme var mı kontrol et (Firestore'dan)
            const meSnap = await currentUserRef.get();
            const meData = meSnap.data() || {};

            const alreadySuperLikeMatch =
                (meData.superLikeMatches || []).includes(userId) ||
                (superLikedUserData.superLikeMatches || []).includes(userData.userId);

            const alreadyLikeMatch =
                (meData.likeMatches || []).includes(userId) ||
                (superLikedUserData.likeMatches || []).includes(userData.userId);

            // varsa direkt ilgili ekrana git ve işlemi sonlandır
            if (alreadySuperLikeMatch) {
                navigation.navigate(SUPER_LIKE_MATCHED, { user1: userData, user2: superLikedUserData });
                return;
            }
            if (alreadyLikeMatch) {
                navigation.navigate(LIKE_MATCHED, { user1: userData, user2: superLikedUserData });
                return;
            }

            const theyLikedMe =
                superLikedUserData.likedUsers?.includes(userData.userId) ||
                superLikedUserData.superLikedUsers?.includes(userData.userId);

            // 🔔 SUPER LIKE bildirimi (her zaman gider)
            const targetTokens: string[] = superLikedUserData?.fcmTokens || [];

            if (targetTokens.length > 0) {
                await sendNotification(
                    targetTokens,
                    t('newSuperLikeNotificationTitle'),
                    t('newSuperLikeNotificationDesc'),
                    {
                        type: 'superlike',
                        fromUserId: userData.userId,
                    }
                );
            }

            await userRef.update({
                superLikers: firestore.FieldValue.arrayUnion(userData.userId),
                likers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            await currentUserRef.update({
                superLikedUsers: firestore.FieldValue.arrayUnion(userId),
                likedUsers: firestore.FieldValue.arrayRemove(userId),
            });

            setIsSuperLiked(true);

            if (theyLikedMe) {
                await currentUserRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

                await Promise.all([
                    currentUserRef.update({
                        likers: firestore.FieldValue.arrayRemove(userId),
                        superLikers: firestore.FieldValue.arrayRemove(userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userId),
                    }),
                    userRef.update({
                        likers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikers: firestore.FieldValue.arrayRemove(userData.userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                    }),
                ]);

                navigation.navigate(SUPER_LIKE_MATCHED, {
                    user1: userData,
                    user2: superLikedUserData,
                });
            }
        } catch (err) {
            console.error('❌ SuperLike eklerken hata:', err);
        } finally {
            setMatchLoading(false)
        }
    };

    // Tek taraflı mesajları sil ve içindeki resimleri Storage'dan sil
    const deleteThreadMessages = async (ownerId: string, peerId: string) => {
        const messagesRef = firestore()
            .collection("users")
            .doc(ownerId)
            .collection("chats")
            .doc(peerId)
            .collection("messages");

        while (true) {
            const snap = await messagesRef
                .orderBy("createdAt", "desc")
                .limit(400)
                .get();

            if (snap.empty) break;

            const batch = firestore().batch();
            const imagesToDelete: string[] = [];

            snap.docs.forEach((d) => {
                const data = d.data() as any;
                if (data.image) imagesToDelete.push(data.image);
                batch.delete(d.ref);
            });

            await batch.commit();

            // Storage'daki resimleri sil
            await Promise.all(
                imagesToDelete.map(async (url) => {
                    try {
                        const ref = storage().refFromURL(url);
                        await ref.delete();
                    } catch (e) {
                        console.log("Storage delete error:", e);
                    }
                })
            );
        }
    };

    const deleteConversationBothSides = async (meId: string, otherId: string) => {
        // 1) Mesajları sil (benim taraf)
        await deleteThreadMessages(meId, otherId);

        // 2) Mesajları sil (karşı taraf)
        await deleteThreadMessages(otherId, meId);

        // 3) Chat dokümanlarını sil
        const batch = firestore().batch();

        const myChatDoc = firestore()
            .collection("users")
            .doc(meId)
            .collection("chats")
            .doc(otherId);

        const otherChatDoc = firestore()
            .collection("users")
            .doc(otherId)
            .collection("chats")
            .doc(meId);

        batch.delete(myChatDoc);
        batch.delete(otherChatDoc);

        await batch.commit();
    };

    const handleDislike = async (userId: string) => {
        if (!userData?.userId || !userData) {
            return;
        }
        setMatchLoading(true)
        try {
            const userRef = firestore().collection('users').doc(userId);
            const currentUserRef = firestore().collection('users').doc(userData.userId);

            await userRef.update({
                likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            await currentUserRef.update({
                likers: firestore.FieldValue.arrayRemove(userId),
                superLikers: firestore.FieldValue.arrayRemove(userId),
                dislikedUsers: firestore.FieldValue.arrayUnion(userId),
            });

            setIsDisliked(true);
        } catch (err) {
            console.error('❌ Dislike işleminde hata:', err);
        } finally {
            setMatchLoading(false)
        }
    };

    useEffect(() => {
        if (!userData?.userId || !user?.userId) return;
        if (userData.userId === user.userId) return; // kendine bildirim yok

        const sendVisitNotification = async () => {
            try {
                const visitorRef = firestore().collection('users').doc(userData.userId);
                const visitedRef = firestore().collection('users').doc(user.userId);

                // 🔹 Ziyaret edenin profiline mevcut ziyaretleri al
                const visitorSnap = await visitorRef.get();
                const visitorData = visitorSnap.data() || {};
                const profileVisited: { userId: string, visitedAt: any }[] = visitorData.profileVisited || [];

                // 🔹 Ziyaret edilenin profiline mevcut ziyaretçileri al
                const visitedSnap = await visitedRef.get();
                const visitedData = visitedSnap.data() || {};

                const now = new Date();
                const oneHourAgo = now.getTime() - 1000 * 60 * 60;

                // 🔹 Daha önce 1 saat içinde ziyaret edilmiş mi kontrol et
                const alreadyVisited =
                    profileVisited.find(v => v.userId === user.userId && new Date(v.visitedAt).getTime() > oneHourAgo);

                if (alreadyVisited) {
                    // 1 saatten az süre geçti, işlem yok
                    return;
                }

                // 🔹 Firestore güncelle
                await visitorRef.set(
                    {
                        profileVisited: firestore.FieldValue.arrayUnion({
                            userId: user.userId,
                            visitedAt: now.toISOString(),
                        }),
                    },
                    { merge: true }
                );

                await visitedRef.set(
                    {
                        profileVisiters: firestore.FieldValue.arrayUnion({
                            userId: userData.userId,
                            visitedAt: now.toISOString(),
                        }),
                    },
                    { merge: true }
                );

                // 🔹 Bildirim gönder
                const tokens: string[] = visitedData.fcmTokens || [];
                if (tokens.length > 0) {
                    await sendNotification(
                        tokens,
                        t('profile_visit_title'),
                        `${userData.firstName} ${t('profile_visit_desc')}`,
                        {
                            type: 'profile_visit',
                            senderId: userData.userId,
                        }
                    );
                }
            } catch (e) {
                console.log('❌ profile visit error:', e);
            }
        };

        sendVisitNotification();
    }, [userData?.userId, user?.userId]);



    return (
        <>
            {matchLoading || loading ? (
                <CLoading visible />
            ) : (
                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="close-outline" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* <View style={styles.distanceContainer}>
                        <Text style={styles.distanceText}>
                            {getDistanceFromLatLonInKm(
                                userData.latitude,
                                userData.longitude,
                                user.latitude,
                                user.longitude
                            ).toFixed(1)} km
                        </Text>
                    </View> */}

                    <TouchableOpacity
                        onPress={() => setShowMenu(v => !v)}
                        style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            zIndex: 20,
                            backgroundColor: '#fff',
                            borderRadius: 30,
                            padding: 5,
                            opacity: 0.8,
                        }}
                    >
                        <Ionicons name="ellipsis-vertical" size={22} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.imageContainer}>
                        <FlatList
                            data={user?.photos || []}
                            keyExtractor={(_, index) => index.toString()}
                            pagingEnabled
                            snapToInterval={height * 0.75}
                            decelerationRate="fast"
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={(user?.photos?.length ?? 0) > 1}
                            onMomentumScrollEnd={handleMomentumScrollEnd}
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        width,
                                        height: height * 0.75,
                                    }}
                                >
                                    <FastImage
                                        source={{ uri: item }}
                                        style={styles.profileImage}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                                        style={styles.gradientOverlay}
                                    />
                                </View>
                            )}
                        />

                        {(user?.photos?.length ?? 0) > 1 && (
                            <View style={styles.verticalDotContainer}>
                                {(user?.photos || []).map((_: any, idx: number) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.dot,
                                            {
                                                backgroundColor: idx === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        )}

                        <View style={styles.userInfoContainer}>
                            <Text style={styles.userName}>
                                {user?.firstName}, {user?.age}
                            </Text>
                            <Text style={styles.userLocation}>
                                {user?.province}, {user?.country}
                            </Text>

                            <View style={styles.actionButtons}>
                                {hasAnyMatch ? (
                                    <>
                                        {/* EŞLEŞMEYİ KALDIR */}
                                        <TouchableOpacity
                                            style={styles.unmatchButton}
                                            activeOpacity={0.8}
                                            onPress={handleRemoveMatch}
                                        >
                                            <Ionicons
                                                name="close"
                                                size={30}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>

                                        {/* MESAJ GÖNDER */}
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={handleOpenChat}
                                            disabled={actionsDisabled}
                                            style={[
                                                styles.messageButton,
                                                { opacity: actionsDisabled ? 0.4 : 1 },
                                            ]}
                                        >
                                            <Ionicons
                                                name="chatbubble-ellipses"
                                                size={30}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        {!isDisliked && (
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => { handleDislike(user.userId); }}
                                                disabled={actionsDisabled}
                                                style={[
                                                    styles.dislikeButton,
                                                    { opacity: actionsDisabled ? 0.4 : 1 },
                                                ]}
                                            >
                                                <Ionicons name="close" size={24} color="#000" />
                                            </TouchableOpacity>
                                        )}

                                        {!isSuperLiked && (
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => { handleSuperLike(user.userId); }}
                                                disabled={actionsDisabled}
                                                style={[
                                                    styles.starButton,
                                                    { opacity: actionsDisabled ? 0.4 : 1 },
                                                ]}
                                            >
                                                <Ionicons name="star" size={22} color="#fff" />
                                            </TouchableOpacity>
                                        )}

                                        {!isLiked && (
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => { handleLike(user.userId); }}
                                                disabled={actionsDisabled}
                                                style={[
                                                    styles.likeButton,
                                                    { opacity: actionsDisabled ? 0.4 : 1 },
                                                ]}
                                            >
                                                <Ionicons name="heart" size={24} color="#fff" />
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                    </View>

                    {showMenu && (
                        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                            {/* ARKA PLAN TIKLAMA ALANI */}
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.menuOverlay}
                                onPress={() => setShowMenu(false)}
                            />

                            {/* MENÜ */}
                            <View style={styles.menuContainer}>
                                {/* Rapor Et */}
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowMenu(false);
                                        setReportModalVisible(true);
                                    }}
                                    style={styles.menuItem}
                                >
                                    <Text style={styles.reportText}>
                                        {t("anon_chat_report_title")}
                                    </Text>
                                </TouchableOpacity>

                                {/* Engelle / Engeli Kaldır */}
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowMenu(false);
                                        isBlockedByMe ? handleUnblockUser() : handleBlockUser();
                                    }}
                                    style={styles.menuItem}
                                >
                                    <Text style={styles.menuText}>
                                        {isBlockedByMe
                                            ? t("anon_chat_unblock_title")
                                            : t("anon_chat_block_menu")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}


                    <BottomSheet
                        ref={bottomSheetRef}
                        index={0}
                        snapPoints={snapPoints}
                        backgroundStyle={styles.sheetBackground}
                        handleIndicatorStyle={{
                            backgroundColor: '#ccc',
                            width: 60,
                        }}
                    >
                        <BottomSheetScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.sheetContent}
                        >
                            <Text style={styles.sectionTitle}>
                                {t('profile_about')}
                            </Text>
                            <Text style={styles.aboutText}>
                                {user?.about}
                            </Text>

                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { marginTop: 20 },
                                ]}
                            >
                                {t('profile_hobbies')}
                            </Text>
                            <View style={styles.interestContainer}>
                                {(user?.hobbies || []).map((item: string, index: number) => (
                                    <View
                                        key={index}
                                        style={styles.hobbyChip}
                                    >
                                        <Text style={styles.hobbyText}>
                                            {t(`hobby_${item}`)}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { marginTop: 30 },
                                ]}
                            >
                                {t('profile_preference')}
                            </Text>
                            <Text style={styles.aboutText}>
                                {RELATIONSHIP_LABEL_KEYS[user?.relationshipType as string]
                                    ? t(RELATIONSHIP_LABEL_KEYS[user?.relationshipType as string])
                                    : t('not_specified')}
                            </Text>

                        </BottomSheetScrollView>
                    </BottomSheet>

                    <CModal
                        visible={reportModalVisible}
                        onClose={() => {
                            if (!sendingReport) {
                                setReportModalVisible(false);
                            }
                        }}
                    >
                        <View
                            style={{
                                width: '100%',
                                maxWidth: 400,
                            }}
                        >
                            {/* Başlık */}
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '700',
                                    color: '#111',
                                    textAlign: 'center',
                                }}
                            >
                                {t("anon_chat_report_title")}
                            </Text>

                            {/* Açıklama */}
                            <Text
                                style={{
                                    marginTop: 12,
                                    fontSize: 14,
                                    lineHeight: 20,
                                    color: '#444',
                                    textAlign: 'center',
                                }}
                            >
                                {t("anon_chat_report_description")}
                            </Text>

                            {/* Multiline input */}
                            <View
                                style={{
                                    marginTop: 16,
                                    borderWidth: 1,
                                    borderColor: '#ccc',
                                    borderRadius: 12,
                                    backgroundColor: '#FFF',
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                }}
                            >
                                <TextInput
                                    value={reportText}
                                    onChangeText={setReportText}
                                    placeholder={t("anon_chat_report_placeholder")}
                                    placeholderTextColor="#999"
                                    multiline
                                    editable={!sendingReport}
                                    style={{
                                        minHeight: 80,
                                        maxHeight: 140,
                                        fontSize: 16,
                                        fontWeight: '500',
                                        color: '#000',
                                        textAlignVertical: 'top',
                                    }}
                                />
                            </View>

                            {/* Butonlar */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginTop: 24,
                                }}
                            >
                                {/* İptal */}
                                <TouchableOpacity
                                    disabled={sendingReport}
                                    onPress={() => {
                                        if (!sendingReport) {
                                            setReportModalVisible(false);
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 44,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 8,
                                        backgroundColor: '#FFF',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: '600',
                                            color: '#111',
                                        }}
                                    >
                                        {t("common_cancel")}
                                    </Text>
                                </TouchableOpacity>

                                {/* Gönder */}
                                <TouchableOpacity
                                    disabled={sendingReport}
                                    onPress={handleSendReport}
                                    style={{
                                        flex: 1,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: sendingReport ? '#9CA3AF' : '#E11D48',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: '700',
                                            color: '#FFF',
                                        }}
                                    >
                                        {sendingReport ? t("common_sending") : t("common_send")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CModal>
                </View>
            )}
        </>
    );
};

export default UserProfile;

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
        menuOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'transparent',
            zIndex: 90,
        },

        menuContainer: {
            position: 'absolute',
            top: 60,
            right: 20,
            backgroundColor: '#FFF',
            borderRadius: 12,
            paddingVertical: 8,
            elevation: 8,
            zIndex: 100,
        },

        menuItem: {
            padding: 14,
        },

        menuText: {
            fontWeight: '600',
            color: '#111',
        },

        reportText: {
            color: '#E11D48',
            fontWeight: '600',
        },
        messageButton: {
            backgroundColor: '#4ade80', // yeşil ton, istersen colors.GREEN_COLOR benzeri
            width: 50,
            height: 50,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        unmatchButton: {
            backgroundColor: '#ef4444', // kırmızı ton
            width: 50,
            height: 50,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
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
            padding: 4,
            zIndex: 10,
        },
        distanceContainer: {
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            zIndex: 10,
        },
        distanceText: {
            fontSize: 12,
            fontWeight: '500',
            color: '#333',
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
        actionButtons: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 16,
            width: 220,
        },
        dislikeButton: {
            backgroundColor: '#fff',
            width: 50,
            height: 50,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        starButton: {
            backgroundColor: colors.BLUE_COLOR,
            width: 50,
            height: 50,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        likeButton: {
            backgroundColor: colors.RED_COLOR,
            width: 50,
            height: 50,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
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
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginTop: 10,
            gap: 8,
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
