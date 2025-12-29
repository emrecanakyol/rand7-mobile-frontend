import { NavigationContainerRef } from '@react-navigation/native';
import { CHAT } from '../../navigators/Stack';
import { MATCH } from '../../navigators/BottomTabs';

export type NotificationPayload = {
    type: string;
    senderId?: string;
    receiverId?: string;
};

export function handleNotificationNavigation(
    navigation: NavigationContainerRef<any>,
    payload: NotificationPayload
) {
    if (!payload?.type) return;

    switch (payload.type) {
        case 'chat_message':
            if (payload.senderId && payload.receiverId) {
                navigation.navigate(CHAT, {
                    userId: payload.receiverId, // Kendi id
                    user2Id: payload.senderId,  // Karşı taraf id
                });
            }
            break;

        case 'like':
            navigation.navigate(MATCH);
            break;
        case 'superlike':
            navigation.navigate(MATCH);
            break;
        case 'like_matched':
            navigation.navigate(MATCH);
            break;
        case 'superlike_matched':
            navigation.navigate(MATCH);
            break;

        default:
            console.warn('Bilinmeyen bildirim türü:', payload.type);
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