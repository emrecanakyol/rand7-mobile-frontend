import { NavigationContainerRef } from '@react-navigation/native';
import { GROUP_DETAIL } from '../../navigators/Stack';

export type NotificationPayload = {
    id: string;
    type: string;
};

export function handleNotificationNavigation(
    navigation: NavigationContainerRef<any>,
    payload: NotificationPayload
) {
    if (!payload?.id || !payload?.type) return;

    const { id, type } = payload;

    switch (type) {
        case 'group':
            navigation.navigate(GROUP_DETAIL, { groupId: id });
            break;

        default:
            console.warn('Bilinmeyen bildirim türü:', type);
    }
}


// NOT: firebase functions içerisindeki bildirim gönderme koduna aşağıdaki gibi id ve type eklersen direk çalışır.
// Tek yapman gereken "id" ve "type" dataya eklemek ve handleNotificationNavigation fonksiyonunu projene göre düzenlemek. 

// const message = {
//     notification: { title, body },
//     tokens: fcmTokens,
//     data: {
//         notificationId: notifDoc.id,
//         groupId: groupId,
//         userId: userId,
//         id: groupId, // Yönlendirme işlemi için eklendi
//         type: "group", // Yönlendirme işlemi için eklendi
//     },