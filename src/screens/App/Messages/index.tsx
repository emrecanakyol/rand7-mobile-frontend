import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '../../../utils/colors';
import { useAppSelector } from '../../../store/hooks';
import { CHAT } from '../../../navigators/Stack';

type RowItem = {
    id: string;
    userId: string;
    username: string;
    avatar?: string;
    preview?: string;
    online?: boolean;
    lastMessageAt?: Date;
    unreadCount?: number;
};

export default function Messages() {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { userData } = useAppSelector((s) => s.userData);
    const meId = userData?.userId;

    const [query, setQuery] = useState('');
    const [rows, setRows] = useState<RowItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔥 Sadece mesajı olan kullanıcıları getir: users/{meId}/chats
    useEffect(() => {
        if (!meId) return;
        setLoading(true);

        const unsub = firestore()
            .collection('users')
            .doc(meId)
            .collection('chats')
            .orderBy('lastMessageAt', 'desc') // en son konuşulanlar üstte
            .limit(50)
            .onSnapshot(
                async (snap) => {
                    try {
                        // Karşı kullanıcı profillerini paralel çek
                        const items = await Promise.all(
                            snap.docs.map(async (d) => {
                                const otherId = d.id;
                                const meta = d.data() as any;

                                const userDoc = await firestore().collection('users').doc(otherId).get();
                                const u = (userDoc.data() || {}) as any;

                                const first = (u.firstName || '').trim();
                                const last = (u.lastName || '').trim();
                                const username = (first || last)
                                    ? `${first}${first && last ? ' ' : ''}${last}`
                                    : (u.userId || otherId);

                                const avatar =
                                    Array.isArray(u.photos) && u.photos[0] ? u.photos[0] : undefined;

                                return {
                                    id: otherId,
                                    userId: otherId,
                                    username,
                                    avatar,
                                    preview: meta.lastMessage || 'Sohbete başlayın…', // ✅ about yerine son mesaj
                                    lastMessageAt: meta.lastMessageAt?.toDate
                                        ? meta.lastMessageAt.toDate()
                                        : undefined,
                                    unreadCount: meta.unreadCount || 0,
                                } as RowItem;
                            })
                        );

                        setRows(items);
                    } catch (e) {
                        console.log('Chats list hydrate error:', e);
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    console.log('Chats list listen error:', err);
                    setLoading(false);
                }
            );

        return () => unsub();
    }, [meId]);

    // 🔎 Arama: username / lastMessage / userId
    const data = useMemo(() => {
        if (!query.trim()) return rows;
        const q = query.toLowerCase();
        return rows.filter(
            (i) =>
                i.username.toLowerCase().includes(q) ||
                (i.preview || '').toLowerCase().includes(q) ||
                i.userId.toLowerCase().includes(q)
        );
    }, [rows, query]);

    const renderItem = ({ item }: { item: RowItem }) => (
        <Row
            item={item}
            colors={colors}
            onPress={() =>
                navigation.navigate(CHAT, {
                    userId: meId,
                    user2Id: item.userId
                })
            }
        />
    );

    return (
        <View style={styles.root}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
                <Ionicons name="search" size={18} color="#888" style={{ marginRight: 6 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Kullanıcı ara..."
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search"
                />
            </View>

            {loading ? (
                <View style={styles.loadingWrap}><ActivityIndicator color="#888" /></View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={styles.sep} />}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Ionicons name="chatbubbles-outline" size={28} color="#999" />
                            <Text style={styles.emptyText}>Henüz mesajlaştığın kullanıcı yok</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

function Row({
    item,
    onPress,
    colors,
}: {
    item: RowItem;
    onPress: () => void;
    colors: any;
}) {
    return (
        <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
            {/* Avatar */}
            <LinearGradient
                colors={['#8B5CF6', '#22D3EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
            >
                <View style={styles.avatarWrap}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F1F1' }]}>
                            <Ionicons name="person" size={22} color="#9AA0A6" />
                        </View>
                    )}
                    {item.online && <View style={styles.onlineDot} />}
                </View>
            </LinearGradient>

            {/* Texts */}
            <View style={styles.textCol}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.username}</Text>
                </View>
                <Text numberOfLines={2} style={[styles.preview, { color: colors.TEXT_DESCRIPTION_COLOR }]}>
                    {item.preview}
                </Text>
            </View>

            {/* 🔔 UNREAD BADGE */}
            {(item.unreadCount ?? 0) > 0 && (
                <View
                    style={{
                        minWidth: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: '#007AFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 6,
                        marginLeft: 8,
                    }}
                >
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>
                        {item.unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const AVATAR = 54;
const RING = 58;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },

    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111',
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },

    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 36,
    },

    emptyText: {
        marginTop: 8,
        fontSize: 14,
        color: '#999',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
    },

    sep: {
        height: 1,
        backgroundColor: '#F1F1F1',
        marginLeft: 90,
    },

    avatarRing: {
        width: RING,
        height: RING,
        borderRadius: RING / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarWrap: {
        width: RING - 6,
        height: RING - 6,
        borderRadius: (RING - 6) / 2,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
    },

    onlineDot: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: '#FFF',
    },

    textCol: {
        flex: 1,
        marginLeft: 12,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },

    name: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },

    preview: {
        fontSize: 14,
        lineHeight: 20,
    },
});
