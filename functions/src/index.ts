// functions/src/index.ts
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

type SendToTokensBody = {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
};

export const sendNotification = onRequest(
    {
        region: 'europe-west1',
    },
    async (req, res) => {
        try {
            if (req.method !== 'POST') {
                res.status(405).send('Method Not Allowed');
                return;
            }

            const { tokens, title, body, data } = req.body as SendToTokensBody;

            if (!tokens?.length || !title || !body) {
                res.status(400).json({
                    success: false,
                    message: 'tokens, title ve body zorunlu',
                });
                return;
            }

            // 🔒 Güvenlik: max 500 token (FCM limiti)
            if (tokens.length > 500) {
                res.status(400).json({
                    success: false,
                    message: 'Max 500 tokens allowed',
                });
                return;
            }

            const message: admin.messaging.MulticastMessage = {
                tokens,
                notification: {
                    title,
                    body,
                },
                data: {
                    ...(data || {}),
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                        },
                    },
                },
            };

            const response = await admin.messaging().sendEachForMulticast(message);

            const invalidTokens: string[] = [];

            response.responses.forEach((r, i) => {
                if (!r.success) {
                    const code = r.error?.code;
                    if (
                        code === 'messaging/invalid-registration-token' ||
                        code === 'messaging/registration-token-not-registered'
                    ) {
                        invalidTokens.push(tokens[i]);
                    }
                }
            });

            res.status(200).json({
                success: true,
                sent: response.successCount,
                failed: response.failureCount,
                invalidTokens,
            });
        } catch (err) {
            console.error('sendNotificationToTokens error:', err);
            res.status(500).json({
                success: false,
            });
        }
    }
);

export const profileVisitersRandomBotUser = onSchedule(
    {
        // schedule: 'every 5 minutes',
        schedule: 'every 6 hours',
        region: 'europe-west1',
        timeZone: 'Europe/Istanbul',
    },
    async (): Promise<void> => {
        try {
            const db = admin.firestore();

            const snapshot = await db.collection('users').get();
            if (snapshot.empty) {
                console.log('No users found');
                return;
            }

            const botUsers: { id: string; email: string; firstName: string }[] = [];
            const receiverUsers: { id: string; email: string; firstName: string; fcmTokens: string[] }[] = [];

            snapshot.docs.forEach((doc) => {
                const data = doc.data() as {
                    email?: unknown;
                    firstName?: unknown;
                    fcmTokens?: unknown;
                };

                if (
                    typeof data.email !== 'string' ||
                    typeof data.firstName !== 'string' ||
                    data.firstName.trim() === ''
                ) return;

                if (data.email.endsWith('@rand7.com')) {
                    botUsers.push({
                        id: doc.id,
                        email: data.email,
                        firstName: data.firstName.trim(),
                    });
                } else {
                    const tokens =
                        Array.isArray(data.fcmTokens) &&
                            data.fcmTokens.every((t) => typeof t === 'string')
                            ? (data.fcmTokens as string[])
                            : [];
                    if (tokens.length === 0) return;

                    receiverUsers.push({
                        id: doc.id,
                        email: data.email,
                        firstName: data.firstName.trim(),
                        fcmTokens: tokens,
                    });
                }
            });

            if (botUsers.length === 0 || receiverUsers.length === 0) {
                console.log('Valid bot or receiver users not found');
                return;
            }

            const randomBotUser = botUsers[Math.floor(Math.random() * botUsers.length)];
            const receiverUser = receiverUsers[Math.floor(Math.random() * receiverUsers.length)];

            if (
                !randomBotUser.firstName ||
                !receiverUser.firstName ||
                !randomBotUser.email ||
                !receiverUser.email ||
                !receiverUser.fcmTokens.length
            ) {
                console.log('Validation failed, not writing to Firestore');
                return;
            }

            const now = admin.firestore.Timestamp.now();
            const selectionRef = db
                .collection('adminPanel')
                .doc('isBot')
                .collection('randomSelections')
                .doc(receiverUser.id);

            const selectionDoc = await selectionRef.get();

            // Daha önce var mı ve 1 gün geçti mi kontrol
            let shouldWrite = false;

            if (!selectionDoc.exists) {
                shouldWrite = true;
            } else {
                const prevSelectedAt = selectionDoc.data()?.selectedAt as admin.firestore.Timestamp | undefined;
                if (!prevSelectedAt) {
                    shouldWrite = true;
                } else {
                    const oneDayMs = 24 * 60 * 60 * 1000;
                    if (now.toMillis() - prevSelectedAt.toMillis() >= oneDayMs) {
                        shouldWrite = true;
                    }
                }
            }

            // ✅ Eğer yazılmayacaksa, hiçbir Firestore işlemi yapma
            if (!shouldWrite) {
                console.log('Selection exists and less than 1 day, skipping all writes');
                return;
            }

            // 🔥 Firestore'a yazma ve profile array ekleme
            const batch = db.batch();

            // adminPanel/randomSelections
            batch.set(
                selectionRef,
                {
                    senderUserId: randomBotUser.id,
                    senderEmail: randomBotUser.email,
                    senderFirstName: randomBotUser.firstName,

                    receiverUserId: receiverUser.id,
                    receiverEmail: receiverUser.email,
                    receiverFirstName: receiverUser.firstName,
                    receiverFcmTokens: receiverUser.fcmTokens,

                    selectedAt: now,
                },
                { merge: true }
            );

            // senderUser.profileVisited
            const senderRef = db.collection('users').doc(randomBotUser.id);
            // const senderRef = db.collection('users').doc("pIMjc0GDelhBCEUlLOKgo3up7p92"); //userId test amaçlı eklendi.
            batch.update(senderRef, {
                profileVisited: admin.firestore.FieldValue.arrayUnion({
                    userId: receiverUser.id,
                    visitedAt: now,
                }),
            });

            // receiverUser.profileVisiters
            const receiverRef = db.collection('users').doc(receiverUser.id);
            // const receiverRef = db.collection('users').doc("RsM8HYwHAecexUBy2nARDXx8FlI2"); //UserId test amaçlı eklendi.
            batch.update(receiverRef, {
                profileVisiters: admin.firestore.FieldValue.arrayUnion({
                    userId: randomBotUser.id,
                    visitedAt: now,
                }),
            });

            await batch.commit();

            console.log('Saved selection and updated users:', randomBotUser.email, '→', receiverUser.email);

            // 🔔 FCM bildirimi gönder
            const title = 'Profil ziyareti';
            const body = `${randomBotUser.firstName} sizi ziyaret etti.`;
            const message = {
                tokens: receiverUser.fcmTokens,
                //Aşağıdaki tokens test amaçlı eklendi.
                // tokens: ["c2KWdHRC8pZ8u2j5rT8e7_:APA91bH283QgHBZ3X8q67hpRgg31cYOrhylHzAWuqTLikVKP8k4JAhJpTfOfJLtRlQiyBSBexAEWTmThYnOlHPhTK8EzN_FLQjkWyxyqsh-3DB0qDTWncNA"],
                notification: {
                    title,
                    body
                },
                android: {
                    notification: {
                        sound: "default"
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: "default"
                        }
                    },
                    headers: {
                        "apns-priority": "10"
                    }
                },
            };
            await admin.messaging().sendEachForMulticast(message);

        } catch (error) {
            console.error('pickRandomRand7User error:', error);
        }
    }
);

