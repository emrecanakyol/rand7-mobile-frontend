// Chat.tsx (CHAT_STACK ekranın)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert, TextInput, TouchableOpacity, Text } from 'react-native';
import { GiftedChat, IMessage, InputToolbar, Send, SendProps } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { nanoid } from 'nanoid/non-secure'; // yoksa uuid de olur
import { useAppSelector } from '../../../store/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CText from '../../../components/CText/CText';
import CImage from '../../../components/CImage';

type RootStackParamList = {
    Chat: { userId: string; user2Id: string };
};

const chatPath = (a: string, b: string) =>
    firestore().collection('users').doc(a).collection('chats').doc(b);

const msgsCol = (a: string, b: string) =>
    chatPath(a, b).collection('messages');

export default function Chat() {
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

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
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
                        {otherAvatar ? (
                            <CImage
                                imgSource={{ uri: otherAvatar }}
                                width={40}
                                height={40}
                                borderRadius={14}
                            />
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
                    <TouchableOpacity
                        onPress={() => {/* sheet açılabilir */ }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Ionicons name="ellipsis-vertical" size={20} color="#111" />
                    </TouchableOpacity>
                </View>
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
        </View>

    );
}
