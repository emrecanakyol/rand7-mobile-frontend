//Admine Abonelik alınınca bildirim gönder.
export const sendAdminNotification = async (title: string, body: any) => {
    try {
        await fetch('https://sendadminnotification-66vu444soa-ew.a.run.app',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    body: body,
                }),
            },
        );

    } catch (error) {
        console.log('Error sending notification:', error);
    }
};