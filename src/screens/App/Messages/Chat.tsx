// Chat.tsx (CHAT_STACK ekranın)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert, TextInput, TouchableOpacity, Text, Platform, Keyboard } from 'react-native';
import { GiftedChat, IMessage, InputToolbar, Send, SendProps } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { nanoid } from 'nanoid/non-secure';
import { useAppSelector } from '../../../store/hooks';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CImage from '../../../components/CImage';
import CLoading from '../../../components/CLoading';
import { useTranslation } from 'react-i18next';
import { USER_PROFILE } from '../../../navigators/Stack';
import { ToastError, ToastSuccess } from '../../../utils/toast';
import CModal from '../../../components/CModal';
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
            ]
        );
    }, [meId, otherId, t, navigation]);

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
            Alert.alert(t('chat_error_title'), t('chat_error_message'));
        }
    }, [meId, otherId, meName]);

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
                                disabled={!otherUser}
                                onPress={() => {
                                    if (!otherUser) return;
                                    // 🔻 KENDİ ROUTE ADINA GÖRE DÜZENLE
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

                                {/* Engelle */}
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => {
                                        setShowMenu(false);
                                        handleBlockUser();
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 14,
                                        paddingVertical: 12,
                                        gap: 10,
                                    }}
                                >
                                    <Ionicons name="close-circle-outline" size={18} color="#111" />
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: '#111',
                                        }}
                                    >
                                        {t("anon_chat_block_menu")}
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
                onSend={(msgs) => { onSend(msgs); setText(''); }}
                user={user}
                locale={i18n.language}
                textInputProps={{
                    style: {
                        color: "#000"
                    }
                }}
                renderAvatar={() => null}

                // 🔧 Toolbar: tek satır hizalaması + padding
                renderInputToolbar={(props) => (
                    <InputToolbar
                        {...props}
                        containerStyle={{
                            borderTopWidth: 0,
                            paddingHorizontal: 8,
                            paddingVertical: 6,
                            backgroundColor: "#fff",
                        }}
                        primaryStyle={{
                            alignItems: 'center', // 👈 send ile input aynı hizada
                        }}
                    />
                )}

                // 🚀 Send: 40x40 daire, dikeyde ortalı
                renderSend={(props: SendProps<IMessage>) => {
                    const canSend = ((props.text ?? '').trim().length > 0);
                    return (
                        <Send
                            {...props}
                            containerStyle={{ marginLeft: 8, marginRight: 4, alignSelf: "flex-end", marginBottom: 10 }}
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
