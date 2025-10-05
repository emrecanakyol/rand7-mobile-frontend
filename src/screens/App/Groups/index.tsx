import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Image, Button, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ToastError, ToastSuccess } from '../../../utils/toast';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADD_PROFILE, GROUP_DETAIL, SUBSCRIPTONS } from '../../../navigators/Stack';
import GroupsHeader from './components/GroupsHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { getFcmToken, registerListenerWithFCM } from '../../../utils/fcmHelper';
import CText from '../../../components/CText/CText';
import CTextInput from '../../../components/CTextInput';
import EditGroupsModal from './components/EditGroupsModal';
import storage from '@react-native-firebase/storage';
import CImage from '../../../components/CImage';
import { useTranslation } from 'react-i18next';
import UserVisitsCounter from '../../../components/AdminPanelComponents/UserVisitCounter';
import CLoading from '../../../components/CLoading';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchPremiumDataList } from '../../../store/services/premiumDataService';

interface Group {
    groupId: string;
    groupName: string;
    createdAt: any;
    notificationCount?: number;
    parentGroupId?: string | null;
    isSubGroup?: boolean;
    photos?: string[];
}

const Groups = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const swipeListRef = useRef<SwipeListView<Group>>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState<string>('');
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState<{ id: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();
    const [userData, setUserData] = useState<any>();
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);

    // Ekran ilk açıldığında kullanıcı yeni kayıt olmuşsa profil oluştur ekranı geliyor.
    const fetchUserDatas = async () => {
        const userId = auth().currentUser?.uid;
        if (!userId) {
            console.log('User not logged in');
            return;
        }

        try {
            const userDoc = await firestore().collection('users').doc(userId).get();
            if (!userDoc.exists) {
                // Kullanıcı dokümanı yoksa profil oluştur ekranına git
                navigation.navigate(ADD_PROFILE);
                return;
            }

            //Tüm userData bilgilerini çek ve set et
            const fetchUserData = userDoc.data();
            setUserData(fetchUserData)

            // Doküman var ama profil tamamlanmamışsa profil oluştur ekranına git
            if (!fetchUserData?.firstName || !fetchUserData?.lastName) {
                navigation.navigate(ADD_PROFILE);
            }
        } catch (error) {
            console.log('Error checking user profile:', error);
        }
    };

    // Tüm groupları çek
    const fetchGroups = async () => {
        setLoading(true);
        setGroups([]); // Clear existing groups while loading

        try {
            const userId = auth().currentUser?.uid;
            // Kullanıcıya ait 'groups' koleksiyonunu al
            const query = firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .orderBy('createdAt', 'desc');

            const groupsCollection = await query.get();

            // Tüm grupları çek
            const allGroups: Group[] = await Promise.all(groupsCollection.docs.map(async (doc) => {
                const data = doc.data();
                const notificationCount = await fetchNotificationCount(doc.id);

                return {
                    groupId: doc.id,
                    groupName: data.groupName,
                    createdAt: data.createdAt,
                    notificationCount,
                    parentGroupId: data.parentGroupId || null,
                    photos: data.photos || [],
                };
            }));

            // Ana grupları ve alt grupları tek map ile sırala
            const orderedGroups: Group[] = [];
            allGroups
                .filter(g => !g.parentGroupId)
                .forEach(main => {
                    orderedGroups.push(main);
                    allGroups
                        .filter(sub => sub.parentGroupId === main.groupId)
                        .forEach(sub => orderedGroups.push({ ...sub, isSubGroup: true }));
                });

            setGroups(orderedGroups);

        } catch (err: any) {
            console.log('Veri çekme hatası: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    //Burada sadece gruplara ait bildirimlerin sayısı çekilmektedir.
    const fetchNotificationCount = async (groupId: string) => {
        try {
            const userId = auth().currentUser?.uid;
            if (!userId) return 0;

            const snapshot = await firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .doc(groupId)
                .collection('notifications')
                .get();

            return snapshot.size; // toplam bildirim sayısı
        } catch (error) {
            console.log('Notification count fetch error:', error);
            return 0;
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserDatas();
        }, [])
    );

    useEffect(() => {
        dispatch(fetchPremiumDataList()); // Uygulama açılır açılmaz premiumData bilgileri varsa çekiyoruz.
        fetchGroups();
        getFcmToken();
    }, []);

    useEffect(() => {
        const unsubscribe = registerListenerWithFCM(navigation);
        return unsubscribe;
    }, [navigation]);

    // Grouplarda arama yapıyor
    const filteredGroups = React.useMemo(() => {
        if (!search) return groups;
        const result: Group[] = [];
        const addedGroupIds = new Set<string>();
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            if (group.groupName.toLowerCase().includes(search.toLowerCase())) {
                // Eğer alt grup ise üst grubunu da ekle
                if (group.parentGroupId) {
                    // Önce üst grubu bul
                    const parentGroup = groups.find(g => g.groupId === group.parentGroupId);
                    if (parentGroup && !addedGroupIds.has(parentGroup.groupId)) {
                        result.push(parentGroup);
                        addedGroupIds.add(parentGroup.groupId);
                    }
                }
                if (!addedGroupIds.has(group.groupId)) {
                    result.push(group);
                    addedGroupIds.add(group.groupId);
                }
            }
        }
        return result;
    }, [groups, search]);

    // Group Detay sayfasına yönlendiriyor
    const handlePress = (group: Group) => {
        navigation.navigate(GROUP_DETAIL, { groupId: group.groupId, groupName: group.groupName });
    };

    // notifications koleksiyonundaki tüm dokümanları silen yardımcı fonksiyon
    const deleteNotificationsOfGroup = async (userId: string, groupId: string) => {
        const notificationsRef = firestore()
            .collection('users')
            .doc(userId)
            .collection('groups')
            .doc(groupId)
            .collection('notifications');

        let hasMore = true;
        while (hasMore) {
            // Her seferinde 500 doküman al
            const snapshot = await notificationsRef.limit(500).get();
            if (snapshot.empty) {
                hasMore = false;
                break;
            }

            const batch = firestore().batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Eğer 500'den az doküman varsa, bir sonraki döngüde çıkacak
            hasMore = snapshot.size === 500;
        }
    };

    // Yardımcı: Storage'dan fotoğrafı sil
    const deletePhotoFromStorage = async (photoUrl: string) => {
        try {
            // Sadece Firebase Storage URL'leri için uygula
            if (!photoUrl.includes('/o/')) return;
            // URL'den dosya yolunu çıkar
            const decodeUrl = decodeURIComponent(photoUrl);
            const pathMatch = decodeUrl.match(/\/o\/(.*?)\?/);
            if (pathMatch && pathMatch[1]) {
                const filePath = pathMatch[1];
                await storage().ref(filePath).delete();
            }
        } catch (err) {
            console.log('Fotoğraf silinemedi:', err);
        }
    };

    // Yardımcı: Grup ve alt grupların fotoğraflarını sil
    const deleteGroupPhotos = async (groupDoc: any) => {
        const data = groupDoc.data();
        if (data && data.photos && Array.isArray(data.photos)) {
            for (const photoUrl of data.photos) {
                await deletePhotoFromStorage(photoUrl);
            }
        }
    };

    // Groupları silebilmek için kullanılıyor
    const handleDeleteGroup = async (groupId: string) => {
        Alert.alert(
            t('delete_group_title'),
            t('delete_group_message'),
            [
                { text: t('cancel'), style: "cancel" },
                {
                    text: t('delete'),
                    onPress: async () => {
                        try {
                            setDeleting(true);
                            const userId = auth().currentUser?.uid;
                            if (!userId) {
                                ToastError(t('error'), t('user_not_logged_in'));
                                setDeleting(false);
                                return;
                            }

                            const groupRef = firestore()
                                .collection('users')
                                .doc(userId)
                                .collection('groups');

                            // Önce alt grupları bul
                            const subGroupsSnapshot = await groupRef.where('parentGroupId', '==', groupId).get();

                            // Alt grupların notifications'larını ve fotoğraflarını sil
                            for (const doc of subGroupsSnapshot.docs) {
                                await deleteNotificationsOfGroup(userId, doc.id);
                                await deleteGroupPhotos(doc);
                            }

                            // Ana grubun notifications'larını ve fotoğraflarını sil
                            await deleteNotificationsOfGroup(userId, groupId);
                            const mainGroupDoc = await groupRef.doc(groupId).get();
                            await deleteGroupPhotos(mainGroupDoc);

                            // Batch ile alt grupları ve ana grubu sil
                            const batch = firestore().batch();
                            subGroupsSnapshot.forEach(doc => {
                                batch.delete(doc.ref);
                            });
                            batch.delete(groupRef.doc(groupId));
                            await batch.commit();

                            setGroups(prev => prev.filter(group => group.groupId !== groupId && group.parentGroupId !== groupId));
                            ToastSuccess(t('success'), t('group_deleted_successfully'));
                        } catch (error) {
                            ToastError(t('error'), t('failed_to_delete_group'));
                        } finally {
                            setDeleting(false);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Edit yani pencil butonuna basıldığında ilk 2 gruop serbest ancak 3 ve sonrası diğer gruopları düzenleyebilmesi için premium olması gerekiyor
    const handleEditGroup = (groupId: string, groupName: string) => {
        const groupIndex = groups.findIndex(g => g.groupId === groupId);

        if (!premiumData?.isPremium && groupIndex >= 2) {
            if (swipeListRef.current) {
                swipeListRef.current.closeAllOpenRows();
            }
            navigation.navigate(SUBSCRIPTONS);
        } else {
            setEditingGroup({ id: groupId, name: groupName });
            setIsEditModalVisible(true);
        }
    };


    const handleGroupUpdated = () => {
        fetchGroups();
        // Close all open rows after update
        swipeListRef.current?.closeAllOpenRows();
    };

    const renderItem = ({ item }: { item: Group }) => {
        const groupIndex = groups.findIndex(g => g.groupId === item.groupId);
        const disabled = !premiumData?.isPremium && groupIndex >= 2;

        return (
            <TouchableWithoutFeedback
                // onPress={() => handlePress(item)}
                onPress={() => {
                    if (disabled) {
                        navigation.navigate(SUBSCRIPTONS);
                    } else {
                        handlePress(item);
                    }
                }}
            >
                <View style={[
                    styles.groupItem,
                    item.isSubGroup && { paddingLeft: responsive(40) }
                ]}>
                    <View style={styles.groupContainer}>
                        {item.isSubGroup && (
                            <View style={styles.subGroupLine} />
                        )}
                        {item.photos && item.photos.length > 0 && (
                            <View style={styles.groupPhotoWrapper}>
                                <CImage
                                    imgSource={{ uri: item.photos[item.photos.length - 1] }}
                                    width={isTablet ? responsive(35) : responsive(50)}
                                    height={isTablet ? responsive(35) : responsive(50)}
                                    borderRadius={responsive(7)}
                                    imageBorderRadius={responsive(7)}
                                />
                            </View>
                        )}
                        <View>
                            <CText style={styles.groupName}>
                                {item.groupName.length > 25 ? `${item.groupName.substring(0, 25)}...` : item.groupName}
                            </CText>
                            <CText style={{ color: colors.GRAY_COLOR, marginTop: 3 }}>
                                {(item.notificationCount ?? 0) > 0
                                    ? t('group_notification_count', { count: item.notificationCount })
                                    : t('no_notifications')
                                }
                            </CText>
                        </View>
                    </View>

                    <Ionicons
                        name="chevron-forward-outline"
                        size={16}
                        color={colors.TEXT_DESCRIPTION_COLOR}
                    />
                </View>
            </TouchableWithoutFeedback>
        )
    };

    return (
        <View style={styles.container}>
            {deleting && (
                <CLoading visible={deleting} />
            )}
            <SwipeListView
                ref={swipeListRef}
                data={filteredGroups}
                renderItem={renderItem}
                ListHeaderComponent={
                    <>
                        <GroupsHeader
                            title={t('groups')}
                            fetchGroups={fetchGroups}
                            swipeListRef={swipeListRef}
                            groupsData={groups}
                            userData={userData}
                            loading={loading} />
                        <View style={styles.searchContainer}>
                            <CTextInput
                                placeholder={t('search_groups')}
                                value={search}
                                onChangeText={setSearch}
                                maxLength={60}
                            />
                        </View>
                        <UserVisitsCounter />

                        {loading && (
                            <ActivityIndicator size="large" color={colors.DARK_GRAY} />
                        )}
                    </>
                }
                keyExtractor={(item) => item.groupId}
                style={styles.inContainer}
                renderHiddenItem={({ item }) => (
                    <View style={styles.hiddenButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.hiddenButton, styles.editButton]}
                            onPress={() => handleEditGroup(item.groupId, item.groupName)}
                        >
                            <Ionicons name="pencil" size={isTablet ? 36 : 24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.hiddenButton, styles.deleteButton]}
                            onPress={() => handleDeleteGroup(item.groupId)}
                        >
                            <Ionicons name="trash" size={isTablet ? 36 : 24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
                rightOpenValue={responsive(-150)}
                ListEmptyComponent={() =>
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <CText style={styles.emptyMessage}>{t('no_groups_found')}</CText>
                        </View>
                    )
                }
                ListFooterComponent={() => <View style={{ height: responsive(60) }} />}
            />
            <EditGroupsModal
                isVisible={isEditModalVisible}
                onGroupUpdated={handleGroupUpdated}
                editingGroup={editingGroup}
                onClose={() => {
                    setIsEditModalVisible(false);
                    if (swipeListRef.current) {
                        swipeListRef.current.closeAllOpenRows();
                    }
                }}
            />
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    inContainer: {
        paddingHorizontal: responsive(20),
    },
    groupItem: {
        borderTopWidth: 0.5,
        borderColor: colors.GRAY_COLOR,
        height: isTablet ? responsive(60) : responsive(90),
        paddingHorizontal: responsive(20),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    searchContainer: {
        marginVertical: responsive(15),
    },
    groupName: {
        color: colors.TEXT_MAIN_COLOR,
        fontWeight: "600",
        marginBottom: responsive(2)
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: responsive(50),
    },
    emptyMessage: {
        fontWeight: '500',
        color: colors.GRAY_COLOR,
    },
    hiddenButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: isTablet ? responsive(60) : responsive(90),
        width: '100%',
    },
    hiddenButton: {
        width: responsive(75),
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: colors.GREEN_COLOR,
    },
    deleteButton: {
        backgroundColor: colors.RED_COLOR,
    },
    groupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsive(10),
    },
    subGroupLine: {
        width: 1,
        height: responsive(50),
        backgroundColor: colors.GRAY_COLOR,
        marginRight: responsive(5),
    },
    groupPhotoWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Groups;
