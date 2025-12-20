import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Alert, TextInput, TouchableOpacity, Text, Platform } from 'react-native';
import { GiftedChat, IMessage, InputToolbar, Send, SendProps } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { nanoid } from 'nanoid/non-secure';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../../../../../store/hooks';
import CLoading from '../../../../../components/CLoading';
import CModal from '../../../../../components/CModal';
import CText from '../../../../../components/CText/CText';
import { CHAT } from '../../../../../navigators/Stack';
import { ToastError, ToastSuccess } from '../../../../../utils/toast';
import { useTranslation } from "react-i18next";
import CImage from '../../../../../components/CImage';

type RootStackParamList = {
    Anonim: {
        annonId: string;
        other2Id: string;
    };
};

const chatPath = (a: string, b: string) =>
    firestore().collection('users').doc(a).collection('anonim-chats').doc(b);

const msgsCol = (a: string, b: string) =>
    chatPath(a, b).collection('messages');

export default function AnonimChat() {
    const { t, i18n } = useTranslation();
    const route = useRoute<RouteProp<RootStackParamList, 'Anonim'>>();
    const { annonId, other2Id } = route.params ?? {};
    // tekrar tekrar yönlenmeyi önlemek için
    const didNavigateRef = useRef(false);

    const insets = useSafeAreaInsets();

    const navigation = useNavigation<any>();
    const [meUserId, setMeUserId] = useState<string>();
    const [otherUserId, setOtherUserId] = useState<string>();

    const meId = meUserId;
    const otherId = otherUserId;

    const { userData } = useAppSelector((state) => state.userData);
    const meName = userData?.firstName;

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [otherName, setOtherName] = useState<string>('');
    const [otherAvatar, setOtherAvatar] = useState<string | undefined>(undefined);
    const [matched, setMatched] = useState<boolean>(false);
    const [waitingLike, setWaitingLike] = useState<boolean>(false);
    const [showMenu, setShowMenu] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportText, setReportText] = useState('');
    const [sendingReport, setSendingReport] = useState(false);
    const [backDeleting, setBackDeleting] = useState(false);
    const [isBlockedByMe, setIsBlockedByMe] = useState(false);
    const [isBlockedByOther, setIsBlockedByOther] = useState(false);

    useEffect(() => {
        if (!meId || !otherId) return;

        const ref = firestore().collection('users').doc(meId);

        const unsub = ref.onSnapshot((doc) => {
            const d = doc.data() as any;

            const blockersArr = Array.isArray(d?.blockers)
                ? d.blockers
                : [];

            const blockedArr = Array.isArray(d?.blocked)
                ? d.blocked
                : [];

            setIsBlockedByMe(blockersArr.includes(otherId));
            setIsBlockedByOther(blockedArr.includes(otherId));
        });

        return () => unsub();
    }, [meId, otherId]);

    // --- EK: geri sayım ---
    const TOTAL_SEC = 7 * 60; // 7 dakika
    // const TOTAL_SEC = 60; // 7 dakika
    const [left, setLeft] = useState(TOTAL_SEC);
    const [timeoutModal, setTimeoutModal] = useState(false);
    const mm = String(Math.floor(left / 60)).padStart(2, '0');
    const ss = String(left % 60).padStart(2, '0');

    // annonId -> userId resolve
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                const users = firestore().collection('users');
                const [meSnap, otherSnap] = await Promise.all([
                    users.where('annonId', '==', annonId).limit(1).get(),
                    users.where('annonId', '==', other2Id).limit(1).get(),
                ]);
                const me = meSnap.docs[0]?.data()?.userId as string | undefined;
                const other = otherSnap.docs[0]?.data()?.userId as string | undefined;
                if (!cancelled) {
                    setMeUserId(me);
                    setOtherUserId(other);
                    if (!me) console.log('WARN: annonId için userId bulunamadı', annonId);
                    if (!other) console.log('WARN: other2Id için userId bulunamadı', other2Id);
                }
            } catch (e) {
                console.log('ANON RESOLVE ERROR:', e);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [annonId, other2Id]);

    useEffect(() => {
        if (!otherId) return;
        const ref = firestore().collection('users').doc(otherId);
        const unsub = ref.onSnapshot((doc) => {
            const d = doc.data() as any;
            const fn = d?.firstName?.trim?.() || '';
            const ln = d?.lastName?.trim?.() || '';
            // const pretty = (fn || ln) ? `${fn}${fn && ln ? ' ' : ''}${ln}` : (d?.userId || otherId);
            const pretty = fn
            setOtherName(pretty);

            const avatar = Array.isArray(d?.photos) && d.photos[0] ? d.photos[0] : undefined;
            setOtherAvatar(avatar);
        });
        return () => unsub();
    }, [otherId]);

    // -------- Realtime mesaj dinleyici
    useEffect(() => {
        if (!meId || !otherId) return;

        // 1) MESAJ dinleyici (bunu aynen koruyoruz)
        const unsubMsgs = msgsCol(meId, otherId)
            .orderBy('createdAt', 'desc')
            .limit(40)
            .onSnapshot(
                (snap) => {
                    const list: IMessage[] = [];
                    snap.forEach((doc) => {
                        const d = doc.data() as any;
                        list.push({
                            _id: d._id || doc.id,
                            text: d.text || '',
                            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
                            user: d.user,
                        });
                    });
                    setMessages(list);
                    setLoading(false);
                },
                (err) => {
                    console.log('chat listen error', err);
                    setLoading(false);
                }
            );

        // 2) UNREAD sıfırla (benim tarafımdaki anonim chat metadata)
        chatPath(meId, otherId).set({ unreadCount: 0 }, { merge: true });

        // 3) BENİM USER DOC LİSTENERIM
        const unsubMeUser = firestore()
            .collection('users')
            .doc(meId)
            .onSnapshot((docSnap) => {
                const data = docSnap.data() as any;
                const likeMatchesArr: string[] = Array.isArray(data?.likeMatches)
                    ? data.likeMatches
                    : [];

                const amIMatchedWithOther = likeMatchesArr.includes(otherId);

                setMatched(amIMatchedWithOther);
            });

        return () => {
            unsubMsgs();
            unsubMeUser();
        };
    }, [meId, otherId]);



    // -------- Mesaj gönder (fan-out: her iki kullanıcı path’ine de yaz)
    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        if (!meId || !otherId || newMessages.length === 0) return;

        const m = newMessages[0];
        const id = m._id?.toString() || nanoid();

        const batch = firestore().batch();
        const serverTime = firestore.FieldValue.serverTimestamp();

        const baseMsg = {
            _id: id,
            text: m.text,
            createdAt: serverTime,
            user: {
                _id: meId,
                name: meName,
            },
        };

        // my thread
        const myMsgRef = msgsCol(meId, otherId).doc(id);
        batch.set(myMsgRef, baseMsg);

        // other thread (ayna kayıt)
        const otherMsgRef = msgsCol(otherId, meId).doc(id);
        batch.set(otherMsgRef, {
            ...baseMsg,
            user: { _id: meId, name: meName },
        });

        // lastMessage metadata (benim taraf)
        batch.set(
            chatPath(meId, otherId),
            {
                lastMessage: m.text,
                lastMessageAt: serverTime,
                unreadCount: 0, // gönderirken bende unread artmaz
                otherUser: firestore.FieldValue.delete(), // istersen burada tutma
            },
            { merge: true }
        );

        // lastMessage metadata (karşı taraf)
        batch.set(
            chatPath(otherId, meId),
            {
                lastMessage: m.text,
                lastMessageAt: serverTime,
                unreadCount: firestore.FieldValue.increment(1),
                otherUser: firestore.FieldValue.delete(),
            },
            { merge: true }
        );

        try {
            await batch.commit();
        } catch (e) {
            console.log('send error', e);
            ToastError(
                t("common_error_title"),
                t("anon_chat_send_error")
            );
        }
    }, [meId, otherId, meName]);

    // -------- GiftedChat current user
    const user = useMemo(
        () => ({
            _id: meId ?? 'unknown-user',
            name: meName ?? 'Bilinmiyor',
        }),
        [meId, meName]
    );

    // anonim sohbeti ve mesajlarını iki tarafta da sil
    const wipeAnonChat = useCallback(async () => {
        if (!meId || !otherId) return;

        try {
            // 1) benim tarafımdaki mesajları çek
            const myMsgsSnap = await msgsCol(meId, otherId).get();
            // 2) karşı tarafın tarafındaki mesajları çek
            const otherMsgsSnap = await msgsCol(otherId, meId).get();

            // 3) batch başlat
            const batch = firestore().batch();

            // 4) benim tarafımdaki her mesajı sil
            myMsgsSnap.forEach(doc => {
                batch.delete(
                    msgsCol(meId, otherId).doc(doc.id)
                );
            });

            // 5) diğer tarafın aynalı mesajlarını sil
            otherMsgsSnap.forEach(doc => {
                batch.delete(
                    msgsCol(otherId, meId).doc(doc.id)
                );
            });

            // 6) sohbet metadata dokümanlarını da sil (anonim-chats/{otherId} ve anonim-chats/{meId})
            batch.delete(chatPath(meId, otherId));
            batch.delete(chatPath(otherId, meId));

            // 7) commit
            await batch.commit();

            console.log("Anonim chat silindi.");
        } catch (err) {
            console.log("wipeAnonChat error:", err);
        }
    }, [meId, otherId]);

    const handleBackPress = useCallback(() => {
        // userId resolve olmadan basılırsa
        if (!meId || !otherId) {
            navigation.goBack();
            return;
        }

        Alert.alert(
            t("common_warning_title"),
            t("anon_chat_leave_delete_confirm"), // i18n'e ekleyeceksin
            [
                { text: t("common_cancel"), style: "cancel" },
                {
                    text: t("common_delete"),
                    style: "destructive",
                    onPress: async () => {
                        if (backDeleting) return;

                        try {
                            setBackDeleting(true);
                            await wipeAnonChat();   // ✅ iki tarafı da siliyor
                        } catch (e) {
                            console.log("back wipe error:", e);
                        } finally {
                            setBackDeleting(false);
                            navigation.goBack();
                        }
                    },
                },
            ]
        );
    }, [meId, otherId, navigation, wipeAnonChat, t, backDeleting]);

    const handleLike = useCallback(async () => {
        if (!meId || !otherId) return;

        try {
            // UI: bekleme yazısını hemen göster
            setWaitingLike(true);

            const meRef = firestore().collection('users').doc(meId);
            const otherRef = firestore().collection('users').doc(otherId);

            // 1. önce her iki user doc'unu al
            const [meSnap, otherSnap] = await Promise.all([meRef.get(), otherRef.get()]);
            const meData = meSnap.data() as any || {};
            const otherData = otherSnap.data() as any || {};

            const otherLikedUsers: string[] = Array.isArray(otherData.likedUsers)
                ? otherData.likedUsers
                : [];

            // karşı taraf beni önceden beğenmiş mi?
            const isMutual = otherLikedUsers.includes(meId);

            const batch = firestore().batch();

            // --- AŞAMA 1: her zaman tek yönlü like'ı kaydet ---
            // benim dokümanım: likedUsers'e otherId ekle
            batch.set(
                meRef,
                {
                    likedUsers: firestore.FieldValue.arrayUnion(otherId),
                },
                { merge: true }
            );

            // onun dokümanı: likers'e meId ekle
            batch.set(
                otherRef,
                {
                    likers: firestore.FieldValue.arrayUnion(meId),
                },
                { merge: true }
            );

            // --- AŞAMA 2: eğer karşılıklıysa kalıcı match ve temizlik ---
            if (isMutual) {
                // 2.1 likeMatches'e ekle (kalıcı ilişki)
                batch.set(
                    meRef,
                    {
                        likeMatches: firestore.FieldValue.arrayUnion(otherId),
                    },
                    { merge: true }
                );
                batch.set(
                    otherRef,
                    {
                        likeMatches: firestore.FieldValue.arrayUnion(meId),
                    },
                    { merge: true }
                );

                // 2.2 geçici alanları temizle:
                // - benim likedUsers listemden otherId'yi kaldır
                // - benim likers listemden otherId'yi kaldır (diğer taraf beni daha önce beğenmişse bu alana girmiş olabilir)
                // - onun likedUsers listesinden meId'yi kaldır
                // - onun likers listesinden meId'yi kaldır
                batch.set(
                    meRef,
                    {
                        likedUsers: firestore.FieldValue.arrayRemove(otherId),
                        likers: firestore.FieldValue.arrayRemove(otherId),
                    },
                    { merge: true }
                );

                batch.set(
                    otherRef,
                    {
                        likedUsers: firestore.FieldValue.arrayRemove(meId),
                        likers: firestore.FieldValue.arrayRemove(meId),
                    },
                    { merge: true }
                );

                // sonra anonim sohbeti temizle
                await wipeAnonChat();
            }

            await batch.commit();

            // Not:
            // matched state'ini burada set etmiyoruz çünkü user listener'ında
            // likeMatches değişince otomatik setMatched(true) olacak.
            // O da CHAT'e yönlendirecek.

        } catch (e) {
            console.log('like error', e);
            ToastError('Hata', 'Beğeni kaydedilemedi.');
            setWaitingLike(false);
        }
    }, [meId, otherId]);


    const handleDisLike = useCallback(async () => {
        if (!meId || !otherId) return;

        try {
            // sonra anonim sohbeti temizle
            await wipeAnonChat();
            setWaitingLike(false);
            setTimeoutModal(false);
            navigation.goBack();
        } catch (e) {
            console.log('dislike error', e);
            ToastError('Hata', 'İşlem tamamlanamadı.');
        }
    }, [meId, otherId]);

    // --- EK: geri sayım (component içinde) ---
    useEffect(() => {
        const t = setInterval(() => {
            setLeft((s) => {
                if (s <= 1) {
                    clearInterval(t);
                    setTimeoutModal(true);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!matched) return;
        if (!meId || !otherId) return;
        if (didNavigateRef.current) return;

        didNavigateRef.current = true;   // sadece 1 kez çalışsın
        setTimeoutModal(false);          // modali kapat

        // CHAT ekranına geç (replace/navigate senin tercihine göre)
        navigation.replace(CHAT, {
            userId: meId,
            user2Id: otherId,
        });
    }, [matched, meId, otherId, otherName, otherAvatar, navigation]);

    const handleSendReport = useCallback(async () => {
        if (!meId || !otherId) return;
        if (!reportText.trim()) {
            ToastError(
                t("common_warning_title"),
                t("anon_chat_report_validation")
            );
            return;
        }

        try {
            setSendingReport(true);

            await firestore()
                .collection('users')
                .doc(meId)
                .collection("reports")
                .add({
                    reporterId: meId,
                    reportedId: otherId,
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
            ToastError(
                t("common_error_title"),
                t("anon_chat_report_error")
            );
        } finally {
            setSendingReport(false);
        }
    }, [meId, otherId, reportText]);

    const handleBlockUser = useCallback(() => {
        if (!meId || !otherId) return;

        Alert.alert(
            t("anon_chat_block_title"),
            t("anon_chat_block_message"),
            [
                { text: t("common_cancel"), style: "cancel" },
                {
                    text: t("anon_chat_block_confirm"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // meId kullanıcısının altındaki blocked koleksiyonuna yazıyoruz
                            await firestore()
                                .collection('users')
                                .doc(meId)
                                .update({
                                    blockers: firestore.FieldValue.arrayUnion(otherId),
                                });

                            await firestore()
                                .collection('users')
                                .doc(otherId)
                                .update({
                                    blocked: firestore.FieldValue.arrayUnion(meId),
                                });


                            ToastSuccess(
                                t("anon_chat_block_success_title"),
                                t("anon_chat_block_success_message")
                            );
                            // istersen burada sohbete geri dönüp ekranı kapatabiliriz:
                            navigation.goBack();
                        } catch (e) {
                            console.log("block error", e);
                            ToastError(
                                t("common_error_title"),
                                t("anon_chat_block_error_message")
                            );
                        } finally {
                            // dropdown kapansın
                            setShowMenu(false);
                        }
                    },
                },
            ]
        );
    }, [meId, otherId, other2Id, setShowMenu]);

    const handleUnblockUser = useCallback(() => {
        if (!meId || !otherId) return;

        Alert.alert(
            t("anon_chat_unblock_title"),
            t("anon_chat_unblock_message"),
            [
                { text: t("common_cancel"), style: "cancel" },
                {
                    text: t("anon_chat_unblock_confirm"),
                    style: "default",
                    onPress: async () => {
                        try {
                            await firestore()
                                .collection('users')
                                .doc(meId)
                                .update({
                                    blockers: firestore.FieldValue.arrayRemove(otherId),
                                });

                            await firestore()
                                .collection('users')
                                .doc(otherId)
                                .update({
                                    blocked: firestore.FieldValue.arrayRemove(meId),
                                });

                            ToastSuccess(
                                t("common_success_title"),
                                t("anon_chat_unblock_success_message")
                            );
                        } catch (e) {
                            console.log("unblock error", e);
                            ToastError(
                                t("common_error_title"),
                                t("anon_chat_unblock_error_message")
                            );
                        } finally {
                            setShowMenu(false);
                        }
                    },
                },
            ]
        );
    }, [meId, otherId, t]);

    const tabbarHeight = Platform.OS === "ios" ? 50 : 105
    const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 })
    const keyboardVerticalOffset = insets.bottom + tabbarHeight + keyboardTopToolbarHeight

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: '#FFF' }}>
            <View style={{
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#EFEFEF',
            }}>
                <View style={{
                    height: 52,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                }}>
                    {/* Back */}
                    <TouchableOpacity
                        onPress={handleBackPress}
                        disabled={backDeleting}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{
                            width: 40, height: 40, borderRadius: 20,
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="chevron-back" size={24} color="#111" />
                    </TouchableOpacity>

                    {/* Avatar + İsim (sol hizalı) */}
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text
                            numberOfLines={1}
                            style={{ fontSize: 16, fontWeight: '700', color: '#111', maxWidth: '80%' }}
                        >
                            {other2Id}
                        </Text>
                    </View>

                    {/* Sağdaki üç nokta istersen kalsın */}
                    <View style={{ position: 'relative' }}>
                        <TouchableOpacity
                            onPress={() => setShowMenu(v => !v)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="#111" />
                        </TouchableOpacity>

                        {showMenu && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 44,
                                    right: 0,
                                    minWidth: 200,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 12,
                                    paddingVertical: 8,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.15,
                                    shadowRadius: 12,
                                    shadowOffset: { width: 0, height: 6 },
                                    elevation: 8,
                                    borderWidth: 1,
                                    borderColor: '#EEE',
                                    zIndex: 1000,
                                }}
                            >
                                {/* Bu kullanıcıyı bildir */}
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => {
                                        setShowMenu(false);
                                        setReportModalVisible(true);
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 14,
                                        paddingVertical: 12,
                                        gap: 10,
                                    }}
                                >
                                    <Ionicons name="flag-outline" size={18} color="#E11D48" />
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: '#E11D48',
                                        }}
                                    >
                                        {t("anon_chat_report_title")}
                                    </Text>
                                </TouchableOpacity>

                                {/* divider */}
                                <View
                                    style={{
                                        height: 1,
                                        backgroundColor: '#EEE',
                                        marginHorizontal: 12,
                                        marginVertical: 4,
                                    }}
                                />

                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => {
                                        setShowMenu(false);

                                        if (isBlockedByMe) {
                                            handleUnblockUser();
                                        } else {
                                            handleBlockUser();
                                        }
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 14,
                                        paddingVertical: 12,
                                        gap: 10,
                                    }}
                                >
                                    <Ionicons
                                        name={isBlockedByMe ? "checkmark-circle-outline" : "close-circle-outline"}
                                        size={18}
                                        color="#111"
                                    />
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: '#111',
                                        }}
                                    >
                                        {isBlockedByMe ? t("anon_chat_unblock_title") : t("anon_chat_block_menu")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* ÜSTTE GERİ SAYIM BARI */}
            <View style={{ minHeight: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
                <View style={{ height: 4, flex: 1, backgroundColor: '#EEE', borderRadius: 2, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${(left / TOTAL_SEC) * 100}%`, backgroundColor: '#FF3B30' }} />
                </View>
                <CText style={{ fontSize: 12, color: '#000', marginLeft: 8 }}>{mm}:{ss}</CText>
            </View>

            <GiftedChat
                keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
                messages={messages}
                onSend={(msgs) => { onSend(msgs); setText(''); }}
                user={user}
                locale={i18n.language}
                textInputProps={{
                    editable: !(isBlockedByMe || isBlockedByOther),
                    placeholder: isBlockedByMe
                        ? t("anon_chat_blocked_input_you")
                        : isBlockedByOther
                            ? t("anon_chat_blocked_input_other")
                            : t("chat_type_message"),
                }}
                // textInputProps={{
                //     style: {
                //         color: "#000",
                //     }
                // }}
                colorScheme="light"

                // 🚀 Send: 40x40 daire, dikeyde ortalı
                renderSend={(props: SendProps<IMessage>) => {
                    const canSend = ((props.text ?? '').trim().length > 0);
                    return (
                        <Send
                            {...props}
                            containerStyle={{
                                marginLeft: 8,
                                marginRight: 4,
                                alignSelf: "flex-end",
                                marginBottom: 10,
                            }}
                        >
                            <View
                                style={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: 20,
                                    backgroundColor: canSend ? '#007AFF' : '#BDBDBD',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons
                                    name="send"
                                    size={18}
                                    color="#FFF"
                                    style={{ transform: [{ rotate: '-5deg' }] }}
                                />
                            </View>
                        </Send>
                    );
                }}

            />

            <CModal
                visible={timeoutModal}
                onClose={() => setTimeoutModal(false)}
                justifyContent="center"
                height="auto"
                width="auto"
                borderBottomLeftRadius={30}
                borderBottomRightRadius={30}
                closeButton={false}
                paddingTop={0}
            >
                <View
                    style={{
                        alignItems: 'center',
                        paddingVertical: 24,
                        paddingHorizontal: 20,
                        backgroundColor: '#FFF',
                        borderRadius: 24,
                        maxWidth: 330,
                        marginBottom: 50
                    }}
                >
                    {/* 07:00 */}
                    <Text
                        style={{
                            fontSize: 36,
                            fontWeight: '800',
                            color: '#111',
                            letterSpacing: 2,
                        }}
                    >
                        07:00
                    </Text>

                    {/* Soru */}
                    <Text
                        style={{
                            marginTop: 14,
                            fontSize: 16,
                            fontWeight: '700',
                            color: '#111',
                            textAlign: "center",
                        }}
                    >
                        {t("anon_chat_timer_title")}
                    </Text>
                    <Text
                        style={{
                            marginTop: 14,
                            fontSize: 14,
                            fontWeight: '400',
                            color: "#808080",
                            textAlign: "center",
                        }}
                    >
                        {t("anon_chat_timer_subtitle")}
                    </Text>

                    {/* Butonlar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28, marginTop: 26 }}>
                        {/* SOL: X (beyaz daire, siyah ikon) */}
                        <TouchableOpacity
                            onPress={handleDisLike}
                            activeOpacity={0.8}
                            style={{
                                width: 56, height: 56, borderRadius: 48,
                                backgroundColor: '#FFFFFF',
                                alignItems: 'center', justifyContent: 'center',
                                // hafif gölge
                                shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
                                elevation: 3,
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="close" size={30} color="#111" />
                        </TouchableOpacity>

                        {/* SAĞ: Kalp (mor daire, beyaz ikon) */}
                        <TouchableOpacity
                            onPress={handleLike}
                            activeOpacity={0.8}
                            style={{
                                width: 56, height: 56, borderRadius: 48,
                                backgroundColor: "#E82251", // mor
                                alignItems: 'center', justifyContent: 'center',
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="heart" size={30} color="#FFF" />
                        </TouchableOpacity>

                    </View>
                    {!matched && (
                        <Text style={{ marginTop: 28, fontSize: 12, color: '#666' }}>
                            {t("anon_chat_waiting_other_like")}
                        </Text>
                    )}
                    {matched && (
                        <Text style={{ marginTop: 18, fontSize: 12, color: '#0a0' }}>
                            {t("anon_chat_matched_message")}
                        </Text>
                    )}
                </View>
            </CModal>


            <CModal // kullanıcıyı bildirme 
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
                                fontSize: 14,
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
                                    fontSize: 15,
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
                                    fontSize: 15,
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

        </SafeAreaView>
    );
}
