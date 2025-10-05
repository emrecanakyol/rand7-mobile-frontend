import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, TextInput, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { ToastError, ToastSuccess } from '../../../utils/toast';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DateFormatter from '../../../components/DateFormatter';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SwipeListView } from 'react-native-swipe-list-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GroupDetailHeader from './components/GroupDetailHeader';
import CText from '../../../components/CText/CText';
import CTextInput from '../../../components/CTextInput';
import EditGroupDetail from './components/EditGroupDetail';
import storage from '@react-native-firebase/storage';
import CImage from '../../../components/CImage';
import { useTranslation } from 'react-i18next';
import i18n from '../../../utils/i18n';
import { SUBSCRIPTONS } from '../../../navigators/Stack';
import CLoading from '../../../components/CLoading';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

interface RouteParams {
    groupId: string;
    groupName: string;
}

interface Notification {
    notificationsId: string;
    notificationName: string;
    createdAt: any;
    dayBefore: string;
    selectedDate: Date;
    status: boolean;
    repeat?: string;
    photo?: string;
}

type GroupDetailRouteProp = RouteProp<{ GroupDetail: RouteParams }, 'GroupDetail'>;

// Get repeat label
const getRepeatLabel = (repeat?: string, t?: any) => {
    switch (repeat) {
        case 'no': return t ? t('repeat_no') : 'Repeat No';
        case 'hourly': return t ? t('every_hour') : 'Every Hour';
        case 'every3hourly': return t ? t('every_3_hours') : 'Every 3 Hour';
        case 'every6hourly': return t ? t('every_6_hours') : 'Every 6 Hour';
        case 'daily': return t ? t('every_day') : 'Every Day';
        case 'weekly': return t ? t('every_week') : 'Every Week';
        case 'monthly': return t ? t('every_month') : 'Every Month';
        case 'yearly': return t ? t('every_year') : 'Every Year';
        case 'close': return t ? t('close') : 'Close';
        default: return repeat || '';
    }
};

// Get dayBefore label
const getDayBeforeLabel = (dayBefore?: string, t?: any) => {
    if (dayBefore === undefined || dayBefore === null) return '';
    if (dayBefore === '0') return t ? t('same_day') : 'Same Day';
    if (!isNaN(Number(dayBefore))) return t ? t('x_days_ago', { count: dayBefore }) : `${dayBefore} days ago`;
    return dayBefore;
};

const GroupDetail = () => {
    const route = useRoute<GroupDetailRouteProp>();
    const navigation: any = useNavigation();
    const { groupId, groupName } = route.params;
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const swipeListRef = useRef<SwipeListView<Notification>>(null);
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);

    // Bildirimleri çekme fonksiyonu
    const fetchNotifications = async () => {
        setLoading(true);

        try {
            const userId = auth().currentUser?.uid;
            const query = firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .doc(groupId)
                .collection('notifications')
                .orderBy('createdAt', 'desc');

            const groupsSnapshot = await query.get();

            const groupsList: Notification[] = groupsSnapshot.docs.map(doc => ({
                notificationsId: doc.id,
                notificationName: doc.data().notificationName,
                createdAt: doc.data().createdAt,
                dayBefore: doc.data().dayBefore,
                selectedDate: doc.data().selectedDate.toDate(),
                status: doc.data().status,
                repeat: doc.data().repeat,
                photo: doc.data().photo || undefined,
            }));

            setNotifications(groupsList);

        } catch (error) {
            ToastError('Error', 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredGroups = notifications.filter(group =>
        group.notificationName.toLowerCase().includes(search.toLowerCase())
    );

    // Yardımcı: Storage'dan fotoğrafı sil
    const deletePhotoFromStorage = async (photoUrl: string) => {
        try {
            if (!photoUrl || !photoUrl.includes('/o/')) return;
            const decodeUrl = decodeURIComponent(photoUrl);
            const pathMatch = decodeUrl.match(/\/o\/(.*?)\?/);
            if (pathMatch && pathMatch[1]) {
                const filePath = pathMatch[1];
                await storage().ref(filePath).delete();
            }
        } catch (err) {
            console.log('Bildirim fotoğrafı silinemedi:', err);
        }
    };

    const handleDeleteNotifications = async (notificationId: string) => {
        Alert.alert(
            t('delete_notification_title'),
            t('delete_notification_message'),
            [
                { text: t('cancel'), style: 'cancel' },
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

                            // Önce fotoğrafı sil
                            const notifDoc = await firestore()
                                .collection('users')
                                .doc(userId)
                                .collection('groups')
                                .doc(groupId)
                                .collection('notifications')
                                .doc(notificationId)
                                .get();
                            const notifData = notifDoc.data();
                            if (notifData && notifData.photo) {
                                await deletePhotoFromStorage(notifData.photo);
                            }

                            await firestore()
                                .collection('users')
                                .doc(userId)
                                .collection('groups')
                                .doc(groupId)
                                .collection('notifications')
                                .doc(notificationId)
                                .delete();

                            setNotifications(prev => prev.filter(notification => notification.notificationsId !== notificationId));
                            ToastSuccess(t('success'), t('notification_deleted_successfully'));
                        } catch (error) {
                            ToastError(t('error'), t('failed_to_delete_notification'));
                        } finally {
                            setDeleting(false);
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    // Edit yani pencil butonuna basıldığında ilk 2 bildirim serbest ancak 3 ve sonrası diğer bildirimleri düzenleyebilmesi için premium olması gerekiyor
    const handleEditNotification = (notification: Notification) => {
        const notificationIndex = notifications.findIndex(n => n.notificationsId === notification.notificationsId);

        if (!premiumData?.isPremium && notificationIndex >= 2) {
            if (swipeListRef.current) {
                swipeListRef.current.closeAllOpenRows();
            }
            navigation.navigate(SUBSCRIPTONS);
        } else {
            setSelectedNotification(notification);
            setIsEditModalVisible(true);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const today = new Date();
        const selectedDate = item.selectedDate;
        const isPastDate = selectedDate < today;
        const statusColor = isPastDate
            ? colors.DARK_GRAY
            : item.status == true
                ? colors.GREEN_COLOR
                : colors.RED_COLOR;

        return (
            <View style={[styles.notificationsItem, {
                borderTopColor: statusColor,
                height: item.photo ? (item.notificationName.length > 50 ? responsive(170) : responsive(150)) : responsive(125),
            }]}>
                <View style={styles.notificationRow}>
                    {item.photo && (
                        <View style={styles.notificationPhotoWrapper}>
                            <CImage
                                imgSource={{ uri: item.photo }}
                                width={isTablet ? responsive(75) : responsive(85)}
                                height={isTablet ? responsive(75) : responsive(85)}
                                borderRadius={responsive(7)}
                                imageBorderRadius={responsive(7)}
                            />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <CText style={[styles.status, { color: statusColor }]}>{isPastDate ? t('completed') : item.status == true ? t('active') : t('close')}</CText>
                        <CText style={styles.notificationsName}>{item.notificationName}</CText>
                        <View style={styles.metaContainer}>
                            {item.repeat && (
                                <CText style={styles.notificationMeta}>
                                    {getRepeatLabel(item.repeat, t)} /
                                </CText>
                            )}
                            {item.dayBefore !== undefined && item.dayBefore !== null && (
                                <CText style={styles.notificationMeta}>
                                    {getDayBeforeLabel(item.dayBefore, t)}
                                </CText>
                            )}
                        </View>
                        <View style={styles.selectedDateContainer}>
                            <FontAwesome name="bell" size={isTablet ? 22 : 12} color={statusColor} />
                            <DateFormatter
                                timestamp={item.selectedDate}
                                color={statusColor}
                                locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
                                textStyle={{
                                    textDecorationLine: item.status == false ? 'line-through' : 'none',
                                }}
                            />
                        </View>
                    </View>
                </View>
            </View>
        )
    };

    return (
        <View style={styles.container}>
            {deleting && (
                <CLoading visible={deleting} title={t('deleting')} />
            )}
            <SwipeListView
                ref={swipeListRef}
                data={filteredGroups}
                renderItem={renderItem}
                keyExtractor={(item) => item.notificationsId}
                ListHeaderComponent={
                    <>
                        <GroupDetailHeader
                            title={t('reminder')}
                            groupId={groupId}
                            fetchNotifications={() => fetchNotifications()}
                            swipeListRef={swipeListRef}
                            notificationsData={notifications}
                            loading={loading} />
                        <View style={styles.searchContainer}>
                            <CTextInput
                                placeholder={t('search_reminders')}
                                value={search}
                                onChangeText={setSearch}
                                maxLength={120}
                            />
                        </View>
                        <CText style={styles.title}>{groupName}</CText>
                        {loading && (
                            <ActivityIndicator size="large" color={colors.DARK_GRAY} />
                        )}
                    </>
                }
                style={styles.inContainer}
                renderHiddenItem={({ item }) => (
                    <View style={styles.hiddenButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.hiddenButton, styles.editButton]}
                            onPress={() => handleEditNotification(item)}
                        >
                            <Ionicons name="pencil" size={isTablet ? 36 : 24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.hiddenButton, styles.deleteButton]}
                            onPress={() => handleDeleteNotifications(item.notificationsId)}
                        >
                            <Ionicons name="trash" size={isTablet ? 36 : 24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
                rightOpenValue={responsive(-150)}
                ListEmptyComponent={() =>
                    filteredGroups.length === 0 && !loading && (
                        <View style={styles.emptyContainer}>
                            <CText style={styles.emptyMessage}>{t('no_reminder_found')}</CText>
                        </View>
                    )
                }
                ListFooterComponent={() => <View style={{ height: responsive(60) }} />}
            />
            <EditGroupDetail
                visible={isEditModalVisible}
                onClose={() => {
                    setIsEditModalVisible(false);
                    setSelectedNotification(null);
                    if (swipeListRef.current) {
                        swipeListRef.current.closeAllOpenRows();
                    }
                }}
                groupId={groupId}
                fetchNotifications={fetchNotifications}
                notification={selectedNotification}
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
    title: {
        marginTop: isTablet ? 0 : responsive(10),
        marginBottom: responsive(10),
        marginLeft: responsive(15),
        fontSize: isTablet ? 28 : 18,
        fontWeight: "600",
    },
    notificationsItem: {
        borderTopWidth: 1.2,
        paddingHorizontal: responsive(20),
        paddingVertical: responsive(15),
        justifyContent: "space-between",
        backgroundColor: colors.WHITE_COLOR,
        marginVertical: isTablet ? 0 : responsive(15),
    },
    status: {
        fontSize: isTablet ? 24 : 14,
        fontWeight: "500",
    },
    selectedDateContainer: {
        flexDirection: "row",
        gap: responsive(5),
        alignItems: "center",
    },
    searchContainer: {
        marginVertical: responsive(15),
    },
    notificationsName: {
        fontSize: isTablet ? 28 : 18,
        color: colors.TEXT_MAIN_COLOR,
        fontWeight: "600",
        marginVertical: responsive(5),
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: responsive(100),
        marginVertical: responsive(15),
    },
    hiddenButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: responsive(75),
        height: '100%',
    },
    editButton: {
        backgroundColor: colors.GREEN_COLOR,
    },
    deleteButton: {
        backgroundColor: colors.RED_COLOR,
    },
    metaContainer: {
        flexDirection: 'row',
        gap: 5,
        marginVertical: responsive(5),
    },
    notificationMeta: {
        fontSize: isTablet ? 23 : 13,
        color: colors.GRAY_COLOR,
        fontWeight: "400",
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationPhotoWrapper: {
        marginRight: responsive(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default GroupDetail;
