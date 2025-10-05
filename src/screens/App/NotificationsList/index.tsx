import { View, Text, StyleSheet, Alert, Dimensions, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import DetailHeaders from '../../../components/DetailHeaders'
import { useTheme } from '../../../utils/colors'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { SwipeListView } from 'react-native-swipe-list-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsive } from '../../../utils/responsive'
import CText from '../../../components/CText/CText'
import DateFormatter from '../../../components/DateFormatter'
import images from '../../../assets/image/images';
import { useFocusEffect } from '@react-navigation/native'
import CImage from '../../../components/CImage'
import { useTranslation } from "react-i18next";
import CLoading from '../../../components/CLoading'
import i18n from '../../../utils/i18n'
import { ToastSuccess } from '../../../utils/toast'

// Bildirim tipi tanımı
interface NotificationItem {
  id: string;
  title: string;
  sentAt: any;
  groupId: string;
  userId: string;
}

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const styles = getStyles(colors, isTablet);
  const { t } = useTranslation();
  const [sentNotificationsList, setSentNotificationsList] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fetchSentNotifications = async () => {
    setLoading(true);
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    try {
      const sentSnap = await firestore()
        .collection('users')
        .doc(userId)
        .collection('sentNotifications')
        .orderBy('sentAt', 'desc')
        .get();

      const notifications = sentSnap.docs.map(doc => {
        const notif = doc.data();
        return {
          id: doc.id,
          title: notif.notificationName,
          sentAt: notif.sentAt,
          groupId: notif.groupId,
          userId: userId,
        };
      });

      setSentNotificationsList(notifications);
    } catch (e) {
      console.log("Bildirimler çekilemedi:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSentNotifications();
    }, [])
  );

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      t('delete_notification_title'),
      t('delete_notification_message'),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              const userId = auth().currentUser?.uid;
              if (!userId) return;

              const batch = firestore().batch();
              selectedItems.forEach(id => {
                const ref = firestore()
                  .collection("users")
                  .doc(userId)
                  .collection("sentNotifications")
                  .doc(id);
                batch.delete(ref);
              });
              await batch.commit();

              setSentNotificationsList(prev =>
                prev.filter(item => !selectedItems.includes(item.id))
              );
              setSelectedItems([]);
              ToastSuccess(t('success'), t('notification_deleted_successfully'));
            } catch (e) {
              console.log("Silme hatası:", e);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (item: NotificationItem) => {
    Alert.alert(
      t('delete_notification_title'),
      t('delete_notification_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await firestore()
                .collection('users')
                .doc(item.userId)
                .collection('sentNotifications')
                .doc(item.id)
                .delete();
              setSentNotificationsList(prev => prev.filter(n => n.id !== item.id));
              ToastSuccess(t('success'), t('notification_deleted_successfully'));
            } catch (e) {
              console.log("Error", e);
            } finally {
              setTimeout(() => {
                setDeleting(false);
              }, 1500);
            }
          },
        },
      ]
    );
  };

  const renderItem = (data: { item: NotificationItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.row}>
        {isSelectionMode && (
          <Ionicons
            name={selectedItems.includes(data.item.id) ? "checkbox" : "square-outline"}
            size={24}
            color={colors.BLACK_COLOR}
            onPress={() => handleSelectItem(data.item.id)}
          />
        )}
        <View>
          <CImage
            imgSource={images.logoBlack}
            width={responsive(35)}
            height={responsive(35)}
            borderRadius={responsive(50)}
            imageBorderRadius={responsive(50)}
            borderWidth={1}
          />
        </View>
        <View>
          <CText style={styles.title}>{data.item.title}</CText>
          <DateFormatter
            timestamp={data.item.sentAt}
            color={colors.TEXT_DESCRIPTION_COLOR}
            locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
          />
        </View>
      </View>
    </View>
  );

  const renderHiddenItem = (data: { item: NotificationItem }) => (
    <View style={styles.rowBack}>
      <Ionicons
        name="trash"
        size={isTablet ? 36 : 24}
        color="white"
        style={styles.trashIcon}
        onPress={() => handleDelete(data.item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <DetailHeaders title={t("notifications_list")} />
      <TouchableOpacity
        style={styles.selectModeIcon}
        onPress={() => setIsSelectionMode(!isSelectionMode)}
      >
        <Ionicons
          name={isSelectionMode ? "close-outline" : "checkbox-outline"}
          size={isTablet ? 32 : 22}
          color={colors.BLACK_COLOR}
        />
      </TouchableOpacity>
      {isSelectionMode && (
        <View style={styles.selectAllContainer}>
          <TouchableOpacity
            onPress={() => {
              if (selectedItems.length === sentNotificationsList.length) {
                setSelectedItems([]);
              } else {
                setSelectedItems(sentNotificationsList.map(item => item.id));
              }
            }}>
            <Text
              style={styles.selectAllText}
            >
              {selectedItems.length === sentNotificationsList.length
                ? t("deselect_all")
                : t("select_all")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteSelected}>
            <Ionicons
              name="trash"
              size={24}
              color={colors.RED_COLOR}
            />
          </TouchableOpacity>
        </View>
      )}

      {loading || deleting ? (
        <CLoading visible={loading || deleting} />
      ) : (
        <SwipeListView
          data={sentNotificationsList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75}
          disableRightSwipe
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t("no_incoming_notifications")}</Text>
          }
          refreshing={loading}
          onRefresh={() => {
            fetchSentNotifications();
          }}
        />
      )}
    </View>
  )
}

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  listContent: {
    padding: responsive(16),
  },
  selectModeIcon: {
    position: 'absolute',
    top: responsive(22),
    right: responsive(22),
    zIndex: 99,
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsive(16),
  },
  selectAllText: {
    fontSize: 16,
    color: colors.TEXT_MAIN_COLOR,
    fontWeight: '600',
    borderColor: colors.GRAY_COLOR,
    borderWidth: 0.5,
    borderRadius: responsive(7),
    padding: responsive(5),
    paddingHorizontal: responsive(15),
  },
  itemContainer: {
    backgroundColor: colors.BACKGROUND_COLOR,
    padding: responsive(16),
    borderRadius: responsive(7),
    marginBottom: responsive(14),
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive(12),
  },
  title: {
    fontWeight: '500',
    color: colors.TEXT_MAIN_COLOR,
    marginBottom: responsive(4),
  },
  date: {
    color: colors.GRAY_COLOR,
  },
  emptyText: {
    color: colors.GRAY_COLOR,
    textAlign: 'center',
    marginTop: responsive(60),
    fontWeight: '500',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: colors.RED_COLOR,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: responsive(20),
    borderRadius: responsive(7),
    marginBottom: responsive(15),
  },
  trashIcon: {
    padding: responsive(8),
  },
})

export default NotificationsScreen
