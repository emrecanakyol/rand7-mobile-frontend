// functions/src/index.ts
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
