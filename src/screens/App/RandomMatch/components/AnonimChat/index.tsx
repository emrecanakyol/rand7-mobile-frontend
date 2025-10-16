import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert, TextInput, TouchableOpacity, Text } from 'react-native';
import { GiftedChat, IMessage, InputToolbar, Send, SendProps } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { nanoid } from 'nanoid/non-secure';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../../../../../store/hooks';
import CLoading from '../../../../../components/CLoading';
import CModal from '../../../../../components/CModal';
import CText from '../../../../../components/CText/CText';
import { CHAT } from '../../../../../navigators/Stack';

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
    const [iLiked, setILiked] = useState<boolean>(false);
    const [matched, setMatched] = useState<boolean>(false);

    // --- EK: geri sayım ---
    const TOTAL_SEC = 10; // 7 dakika
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

        setLoading(true);

        // Mesaj listener
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

        // Chat doc listener (beğeni/eşleşme)
        const unsubChat = chatPath(meId, otherId).onSnapshot((doc) => {
            const d = doc.data() as any;
            const a = !!d?.iLiked;
            const b = !!d?.iLiked;
            setILiked(a);
            setMatched(!!d?.matched || (a && b));
        });

        // unread sıfırla
        chatPath(meId, otherId).set({ unreadCount: 0 }, { merge: true });

        return () => {
            unsubMsgs();
            unsubChat();
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
            Alert.alert('Hata', 'Mesaj gönderilemedi.');
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

    const handleLike = useCallback(async () => {
        if (!meId || !otherId || iLiked) return;

        const batch = firestore().batch();

        // benim doc: iLiked
        batch.set(chatPath(meId, otherId), { iLiked: true }, { merge: true });

        // karşı taraf zaten beğendiyse: match
        if (iLiked) {
            batch.set(chatPath(meId, otherId), { matched: true }, { merge: true });
            batch.set(chatPath(otherId, meId), { matched: true }, { merge: true });
        }

        try { await batch.commit(); } catch (e) {
            console.log('like error', e); Alert.alert('Hata', 'Beğeni kaydedilemedi.');
        }
    }, [meId, otherId, iLiked]);

    const handleDisLike = useCallback(async () => {
        if (!meId || !otherId || iLiked) return;

        const batch = firestore().batch();

        // benim doc: iLiked
        batch.set(chatPath(meId, otherId), { iLiked: false }, { merge: true });

        try { await batch.commit(); } catch (e) {
            console.log('like error', e); Alert.alert('Hata', 'Beğeni kaydedilemedi.');
        }
    }, [meId, otherId, iLiked]);


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


    return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
            {loading ? (
                <CLoading visible={true} />
            ) : (
                <>
                    <View style={{
                        backgroundColor: '#FFFFFF',
                        borderBottomWidth: 1,
                        borderBottomColor: '#EFEFEF',
                        paddingTop: insets.top,             // Safe area ekleyelim
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
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text
                                    numberOfLines={1}
                                    style={{ fontSize: 16, fontWeight: '700', color: '#111', maxWidth: '80%' }}
                                >
                                    {other2Id}
                                </Text>
                            </View>

                            {/* Sağdaki üç nokta istersen kalsın */}
                            <TouchableOpacity
                                onPress={() => {/* sheet açılabilir */ }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Ionicons name="ellipsis-vertical" size={20} color="#111" />
                            </TouchableOpacity>
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
                        messages={messages}
                        onSend={(msgs) => { onSend(msgs); setText(''); }}
                        user={user}
                        placeholder="Mesaj yaz..."
                        alwaysShowSend
                        showUserAvatar={false}
                        renderAvatarOnTop={false}
                        renderAvatar={() => null}
                        text={text}
                        onInputTextChanged={setText}
                        bottomOffset={insets.bottom}              // 👈 iOS safe-area

                        // 🔧 Toolbar: tek satır hizalaması + padding
                        renderInputToolbar={(props) => (
                            <InputToolbar
                                {...props}
                                containerStyle={{
                                    borderTopWidth: 0,
                                    paddingHorizontal: 8,
                                    paddingVertical: 6,
                                }}
                                primaryStyle={{
                                    alignItems: 'center', // 👈 send ile input aynı hizada
                                }}
                            />
                        )}

                        // ✏️ Composer: flex:1 + sabit yükseklik, send ile yan yana sorunsuz
                        renderComposer={() => (
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: "flex-end",
                                    backgroundColor: 'transparent',
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => { /* Buraya foto/video/emoji menüsü açabilirsin */ }}
                                    activeOpacity={0.7}
                                    style={{
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    <Ionicons name="add" size={28} color="#4B5563" />
                                </TouchableOpacity>

                                {/* 📝 Text Input */}
                                <TextInput
                                    value={text}
                                    onChangeText={setText}
                                    placeholder="Mesajınızı yazın"
                                    autoFocus={false}
                                    multiline
                                    style={{
                                        flex: 1,
                                        minHeight: 40,
                                        maxHeight: 200,
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 10,
                                        fontSize: 16,
                                        color: '#000',
                                        textAlignVertical: 'top',
                                    }}
                                />
                            </View>
                        )}
                        // 🚀 Send: 40x40 daire, dikeyde ortalı
                        renderSend={(props: SendProps<IMessage>) => {
                            const canSend = ((props.text ?? '').trim().length > 0);
                            return (
                                <Send
                                    {...props}
                                    disabled={!canSend}
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
                </>
            )}

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
                        Zaman doldu!
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
                        Gizemli hikâyeyi açmak için tek dokunuş yeter.
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
                    {iLiked && !matched && (
                        <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Karşı tarafın beğenmesini bekliyoruz…
                        </Text>
                    )}
                    {matched && (
                        <Text style={{ marginTop: 8, fontSize: 12, color: '#0a0' }}>
                            Eşleştiniz! Sohbetiniz kalıcı oldu.
                        </Text>
                    )}
                </View>
            </CModal>



        </View>

    );
}
