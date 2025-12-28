import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator, TextInput, TouchableOpacity, Text, Platform } from 'react-native';
import { Bubble, GiftedChat, IMessage, Send, SendProps } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { nanoid } from 'nanoid/non-secure';
import { useAppSelector } from '../../../store/hooks';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CImage from '../../../components/CImage';
import { useTranslation } from 'react-i18next';
import { USER_PROFILE } from '../../../navigators/Stack';
import { ToastError, ToastSuccess } from '../../../utils/toast';
import CModal from '../../../components/CModal';
import { useAlert } from '../../../context/AlertContext';
import { useTheme } from '../../../utils/colors';
import storage from '@react-native-firebase/storage';
import CPhotosAdd from '../../../components/CPhotosAdd';
import { responsive } from '../../../utils/responsive';

type RootStackParamList = {
    Chat: {
        userId: string;
        user2Id: string;
    };
};

const chatPath = (a: string, b: string) =>
    firestore().collection('users').doc(a).collection('chats').doc(b);

const msgsCol = (a: string, b: string) =>
    chatPath(a, b).collection('messages');

export default function Chat() {
    const { t, i18n } = useTranslation();
    const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
    const { userId, user2Id } = route.params ?? {};
    const { showAlert } = useAlert();
    const { colors } = useTheme();

    const insets = useSafeAreaInsets();

    const navigation = useNavigation<any>();

    const meId = userId;
    const otherId = user2Id;

    const { userData } = useAppSelector((state) => state.userData);
    const meName = userData?.firstName;
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [otherName, setOtherName] = useState<string>('');
    const [otherAvatar, setOtherAvatar] = useState<string | undefined>(undefined);
    const [otherUser, setOtherUser] = useState<any | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportText, setReportText] = useState('');
    const [sendingReport, setSendingReport] = useState(false);
    const [isBlockedByMe, setIsBlockedByMe] = useState(false);
    const [isBlockedByOther, setIsBlockedByOther] = useState(false);
    const [photoAddVisible, setPhotoAddVisible] = useState(false);
    const [photos, setPhotos] = useState<string[]>(['']); // Tek fotoğraf için array
    const [sending, setSending] = useState(false);

    const uploadImage = async (uri: string, roomId: string) => {
        const fileName = `${nanoid()}.jpg`;
        const path = `users/chat_images/${roomId}/${fileName}`;
        const reference = storage().ref(path);
        await reference.putFile(uri); // React Native uri
        const url = await reference.getDownloadURL();
        return url;
    };

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
    }, [meId, otherId, reportText, t]);

    const handleBlockUser = useCallback(() => {
        if (!meId || !otherId) return;

        showAlert({
            title: t("anon_chat_block_title"),
            message: t("anon_chat_block_message"),
            layout: 'row', // iptal + onay yan yana
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

                            navigation.goBack();
                        } catch (e) {
                            console.log("block error", e);
                            ToastError(
                                t("common_error_title"),
                                t("anon_chat_block_error_message")
                            );
                        } finally {
                            setShowMenu(false);
                        }
                    },
                },
            ],
        });
    }, [meId, otherId, t, navigation]);

    const handleUnblockUser = useCallback(() => {
        if (!meId || !otherId) return;

        showAlert({
            title: t("anon_chat_unblock_title"),
            message: t("anon_chat_unblock_message"),
            layout: 'row', // İptal + Onay yan yana
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
            ],
        });
    }, [meId, otherId, t]);

    useEffect(() => {
        if (!otherId) return;
        const ref = firestore().collection('users').doc(otherId);
        const unsub = ref.onSnapshot((doc) => {
            const d = doc.data() as any;
            const fn = d?.firstName?.trim?.() || '';
            const ln = d?.lastName?.trim?.() || '';
            const pretty = fn;
            setOtherName(pretty);

            const avatar =
                Array.isArray(d?.photos) && d.photos[0]
                    ? d.photos[0]
                    : undefined;
            setOtherAvatar(avatar);

            // 🔹 PROFIL EKRANI İÇİN TÜM USER DATASINI TUT
            if (d) {
                setOtherUser({
                    ...d,
                    userId: otherId, // UserProfile içinde user.userId olarak kullanıyorsun
                });
            }
        });
        return () => unsub();
    }, [otherId]);

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

        setLoading(true);
        const unsubscribe = msgsCol(meId, otherId)
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
                            user: d.user, // {_id, name?, avatar?}
                            image: d.image,
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

        // ✅ SOHBET AÇILIR AÇILMAZ unreadCount = 0
        chatPath(meId, otherId).set(
            {
                unreadCount: 0,
            },
            { merge: true }
        );

        return () => unsubscribe();
    }, [meId, otherId]);

    // -------- Mesaj gönder (fan-out: her iki kullanıcı path’ine de yaz)
    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        if (!meId || !otherId || newMessages.length === 0) return;

        const m = newMessages[0];
        const id = m._id?.toString() || nanoid();

        const batch = firestore().batch();
        const serverTime = firestore.FieldValue.serverTimestamp();

        const baseMsg: any = {
            _id: id,
            text: m.text || '',
            createdAt: serverTime,
            user: {
                _id: meId,
                name: meName,
            },
        };

        // Eğer m.image varsa ekle
        if (m.image) {
            baseMsg.image = m.image;
        }

        // my thread
        const myMsgRef = msgsCol(meId, otherId).doc(id);
        batch.set(myMsgRef, baseMsg);

        // other thread
        const otherMsgRef = msgsCol(otherId, meId).doc(id);
        batch.set(otherMsgRef, {
            ...baseMsg,
            user: { _id: meId, name: meName },
        });

        // lastMessage metadata
        batch.set(chatPath(meId, otherId), {
            lastMessage: m.text,
            lastMessageAt: serverTime,
            unreadCount: 0,
        }, { merge: true });

        batch.set(chatPath(otherId, meId), {
            lastMessage: m.text,
            lastMessageAt: serverTime,
            unreadCount: firestore.FieldValue.increment(1),
        }, { merge: true });

        try {
            await batch.commit();
        } catch (e) {
            console.log('send error', e);
            ToastError(t('chat_error_title'), t('chat_error_message'));
        }
    }, [meId, otherId, meName]);

    // onSend fonksiyonunu güncelle
    const handleSend = async (msgs: IMessage[] = []) => {
        if (!meId || !otherId) return;

        const textMsg = msgs[0]?.text?.trim() || '';
        const localImage = photos[0];

        if (!textMsg && !localImage) return;

        setSending(true); // ⬅️ Gönderme başladı

        const roomId = [meId, otherId].sort().join('_');
        let imageUrl: string | undefined;

        if (localImage) {
            try {
                imageUrl = await uploadImage(localImage, roomId);
            } catch (e) {
                console.log('Image upload error', e);
                setSending(false);
                return;
            }
        }

        const msg: IMessage = {
            _id: nanoid(),
            text: textMsg,
            createdAt: new Date(),
            user: { _id: meId, name: meName },
            image: imageUrl,
        };

        try {
            await onSend([msg]); // fan-out gönder
        } catch (e) {
            console.log('Send error', e);
        } finally {
            setSending(false); // ⬅️ Gönderme bitti
            setText('');
            setPhotos(['']);
            setPhotoAddVisible(false);
        }
    };

    // -------- GiftedChat current user
    const user = useMemo(
        () => ({
            _id: meId,
            name: meName,
        }),
        [meId, meName]
    );

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    const tabbarHeight = Platform.OS === "ios" ? 30 : 85
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
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{
                            width: 40, height: 40, borderRadius: 20,
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="chevron-back" size={24} color="#111" />
                    </TouchableOpacity>

                    {/* Avatar + İsim (sol hizalı) */}
                    <View
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                    >
                        {otherAvatar ? (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={!otherUser || isBlockedByOther}
                                onPress={() => {
                                    if (!otherUser) return;
                                    if (isBlockedByOther) return;

                                    navigation.navigate(USER_PROFILE, {
                                        user: otherUser,
                                    });
                                }}
                            >
                                <CImage
                                    imgSource={{ uri: otherAvatar }}
                                    width={45}
                                    height={45}
                                    imageBorderRadius={3}
                                    disablePress={true}
                                />
                            </TouchableOpacity>
                        ) : (
                            <View
                                style={{
                                    width: 32, height: 32, borderRadius: 16, marginRight: 10,
                                    backgroundColor: '#F1F1F1', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Ionicons name="person" size={18} color="#9AA0A6" />
                            </View>
                        )}

                        <Text
                            numberOfLines={1}
                            style={{ fontSize: 16, fontWeight: '700', color: '#111', maxWidth: '80%' }}
                        >
                            {otherName}
                        </Text>
                    </View>

                    {/* Sağdaki üç nokta istersen kalsın */}
                    {/* Sağdaki üç nokta + menü */}
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
                                            fontSize: 16,
                                            fontWeight: '600',
                                            color: '#E11D48',
                                        }}
                                    >
                                        {t("anon_chat_report_title")}
                                    </Text>
                                </TouchableOpacity>

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
                                            fontSize: 16,
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

            <GiftedChat
                keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
                messages={messages}
                // onSend={(msgs) => { onSend(msgs); setText(''); }}
                onSend={(msgs) => handleSend(msgs)}
                user={user}
                locale={i18n.language}
                textInputProps={{
                    maxLength: 2000,
                    editable: !(isBlockedByMe || isBlockedByOther),
                    placeholder: isBlockedByMe
                        ? t("anon_chat_blocked_input_you")
                        : isBlockedByOther
                            ? t("anon_chat_blocked_input_other")
                            : t("chat_type_message"),
                    style: {
                        color: colors.BLACK_COLOR,
                        fontSize: 16,
                        fontWeight: '500',
                    },
                }}
                colorScheme="light"

                renderBubble={(props) => {
                    return (
                        <Bubble
                            {...props}
                            wrapperStyle={{
                                right: { // Sağdaki, yani senin mesajların
                                    backgroundColor: colors.GREEN_COLOR,
                                },
                                left: { // Sol taraftaki mesajlar (karşı taraf)
                                    backgroundColor: colors.LIGHT_GRAY,
                                },
                            }}
                            textStyle={{
                                right: {
                                    // yeşil arkaplan için beyaz yazı
                                    color: '#fff',
                                    fontSize: 16,
                                    fontWeight: '500',
                                },
                                left: {
                                    // sol taraf için siyah yazı
                                    color: '#000',
                                    fontSize: 16,
                                    fontWeight: '500',
                                },
                            }}
                        />
                    );
                }}

                renderMessageImage={(props) => {
                    return (
                        <View
                            style={{
                                margin: 4,
                            }}>
                            <CImage
                                imgSource={{ uri: props.currentMessage.image }}
                                width={250}
                                height={350}
                                resizeMode="cover"
                                borderRadius={14}
                                imageBorderRadius={14}
                            />
                        </View>
                    );
                }}

                // + butonu
                renderActions={() => (
                    <TouchableOpacity
                        onPress={() => setPhotoAddVisible(prev => !prev)}
                        style={{
                            width: 35,
                            height: 35,
                            marginLeft: 8,
                            marginRight: 3,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Ionicons name="add" size={24} color="#000" />
                    </TouchableOpacity>
                )}

                // inputun üstünde ve sola hizalı fotoğraf ekleme alanı
                renderAccessory={() =>
                    photoAddVisible ? (
                        <View style={{
                            position: "absolute",
                            left: 10,
                            bottom: responsive(50),
                            borderColor: colors.GRAY_COLOR,
                            borderWidth: 0.5,
                            borderRadius: 14,
                        }}>
                            <CPhotosAdd
                                index={0}
                                photos={photos}
                                setPhotos={(updatedPhotos) => setPhotos(updatedPhotos)}
                                width={100}
                                height={100}
                                borderRadius={12}
                                imageBorderRadius={12}
                                resizeMode="cover"
                            />
                        </View>
                    ) : null
                }

                // 🚀 Send: 40x40 daire, dikeyde ortalı
                renderSend={(props: SendProps<IMessage>) => {
                    const hasText = (props.text ?? '').trim().length > 0;
                    const hasPhoto = photos[0] && photos[0] !== '';
                    const canSend = hasText || hasPhoto;

                    return (
                        <TouchableOpacity
                            disabled={!canSend || sending} // Gönderirken disable
                            onPress={() => {
                                if (canSend && !sending) props.onSend && props.onSend({ text: props.text || '' }, true);
                            }}
                        >
                            <View
                                style={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: 35,
                                    marginLeft: 3,
                                    marginRight: 8,
                                    backgroundColor: (canSend && !sending) ? "#21C063" : '#BDBDBD',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {sending ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Ionicons
                                        name="send"
                                        size={18}
                                        color="#FFF"
                                        style={{ transform: [{ rotate: '-5deg' }] }}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                }}


                renderAvatar={() => {
                    return (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={!otherUser || isBlockedByOther}
                            onPress={() => {
                                if (!otherUser) return;
                                if (isBlockedByOther) return;

                                navigation.navigate(USER_PROFILE, { user: otherUser });
                            }}
                            style={{
                                marginRight: 8,
                                opacity: isBlockedByOther ? 0.5 : 1,
                            }}
                        >
                            <CImage
                                imgSource={{ uri: otherAvatar }}
                                width={32}
                                height={32}
                                imageBorderRadius={16}
                                disablePress={true}
                            />
                        </TouchableOpacity>
                    );
                }}
            />

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

        </SafeAreaView>

    );
}
