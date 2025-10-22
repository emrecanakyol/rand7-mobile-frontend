import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Declare constants for admin
let ADMIN_EMAIL;
let ADMIN_UID;
let ADMIN_PHONE;
let ADMIN_NAME;
let ADMIN_LASTNAME;
let ADMIN_FCM_TOKEN;
let ADMIN = false;

// Function to fetch user data from Firestore
export const fetchUserRoleData = async () => {
    const userId = auth().currentUser?.uid;

    if (!userId) {
        console.log('No user is currently logged in.');
        return;
    }

    try {
        const userDoc = await firestore()
            .collection('users')
            .doc(userId)
            .get();

        if (userDoc.exists()) {
            const data = userDoc.data();

            // Check if the user is an admin
            if (data?.adminRole === 'admin') {
                ADMIN_EMAIL = data?.email;
                ADMIN_UID = data.userId;
                ADMIN_PHONE = data?.phoneNumber;
                ADMIN_NAME = data.firstName;
                ADMIN_LASTNAME = data.lastName;
                ADMIN_FCM_TOKEN = data.fcmTokens;
                ADMIN = true;
            } else {
                ADMIN = false;
            }

        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.log('Error fetching user data: ', error);
    }
};

// İlk çalıştırma
fetchUserRoleData();

// Export the constants
export {
    ADMIN_EMAIL,
    ADMIN_UID,
    ADMIN_PHONE,
    ADMIN_NAME,
    ADMIN_LASTNAME,
    ADMIN_FCM_TOKEN,
    ADMIN,
};
