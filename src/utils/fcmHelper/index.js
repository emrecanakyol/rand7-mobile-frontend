import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { PERMISSIONS, request } from 'react-native-permissions';
import { handleNotificationNavigation } from './notificationRouter';

export const getFcmToken = async () => {
    let token = null;
    const userId = auth().currentUser?.uid;
    await checkApplicationNotificationPermission();
    await registerAppWithFCM();
    try {
        token = await messaging().getToken();

        if (userId && token) {
            const userRef = firestore().collection('users').doc(userId);

            // Firestore'dan mevcut tokenlar dizisini al
            const userDoc = await userRef.get();
            const userData = userDoc.exists ? userDoc.data() : {};

            const existingTokens = userData?.fcmTokens || [];

            // Yeni token zaten varsa ekleme, yoksa ekle
            if (!existingTokens.includes(token)) {
                existingTokens.push(token);
                await userRef.set(
                    { fcmTokens: existingTokens },
                    { merge: true },
                );
            }
        }

        console.log('getFcmToken-->', token);
    } catch (error) {
        console.log('getFcmToken Device Token error ', error);
    }
    return token;
};

//method was called on  user register with firebase FCM for notification
export async function registerAppWithFCM() {
    console.log(
        'registerAppWithFCM status',
        messaging().isDeviceRegisteredForRemoteMessages,
    );
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging()
            .registerDeviceForRemoteMessages()
            .then(status => {
                console.log('registerDeviceForRemoteMessages status', status);
            })
            .catch(error => {
                console.log('registerDeviceForRemoteMessages error ', error);
            });
    }
}

//method was called on un register the user from firebase for stoping receiving notifications
export async function unRegisterAppWithFCM() {
    console.log(
        'unRegisterAppWithFCM status',
        messaging().isDeviceRegisteredForRemoteMessages,
    );

    if (messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging()
            .unregisterDeviceForRemoteMessages()
            .then(status => {
                console.log('unregisterDeviceForRemoteMessages status', status);
            })
            .catch(error => {
                console.log('unregisterDeviceForRemoteMessages error ', error);
            });
    }
    await messaging().deleteToken();
    console.log(
        'unRegisterAppWithFCM status',
        messaging().isDeviceRegisteredForRemoteMessages,
    );
}

export const checkApplicationNotificationPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
    request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
        .then(result => {
            console.log('POST_NOTIFICATIONS status:', result);
        })
        .catch(error => {
            console.log('POST_NOTIFICATIONS error ', error);
        });
};

//method was called to listener events from firebase for notification triger
export const registerListenerWithFCM = (navigation) => {
    messaging().onNotificationOpenedApp(remoteMessage => {
        const { type, senderId, receiverId } = remoteMessage?.data || {};
        setTimeout(() => {
            handleNotificationNavigation(navigation, { type, senderId, receiverId });
        }, 1500);
    });

    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            const { type, senderId, receiverId } = remoteMessage?.data || {};
            setTimeout(() => {
                handleNotificationNavigation(navigation, { type, senderId, receiverId });
            }, 1500);
        }
    });

    messaging().onMessage(async remoteMessage => {
        if (remoteMessage?.notification) {
            await notifee.displayNotification({
                title: remoteMessage.notification.title,
                body: remoteMessage.notification.body,
                android: {
                    channelId: 'default',
                    pressAction: { id: 'default' },
                },
                data: remoteMessage.data,
            });
        }
    });

    notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            const data = detail.notification?.data || {};
            setTimeout(() => {
                handleNotificationNavigation(navigation, {
                    type: data.type,
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                });
            }, 300);
        }
    });

};