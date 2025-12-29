//constants/Notifications/index.tsx
export const sendNotification = async (
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
) => {
    try {
        const res = await fetch(
            'https://sendnotification-6bttbtdspq-ew.a.run.app',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tokens,
                    title,
                    body,
                    data,
                }),
            }
        );

        const json = await res.json();
        return json;

    } catch (error) {
        console.log('Error sending notification:', error);
        throw error;
    }
};
