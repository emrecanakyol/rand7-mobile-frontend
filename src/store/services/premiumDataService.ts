import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AppDispatch } from '../store';
import { clearPremiumData, setPremiumDataList } from '../reducer/premiumDataReducer';
import { getAvailablePurchases } from 'react-native-iap';

export const fetchPremiumDataList = () => async (dispatch: AppDispatch) => {
    try {
        const userId = auth().currentUser?.uid;
        if (!userId) {
            dispatch(clearPremiumData());
            return;
        }

        const snapshot = await firestore()
            .collection("users")
            .doc(userId)
            .collection("premiumData")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get({ source: 'server' });  // güncel veri çekiyoruz

        if (snapshot.empty) {
            console.log("Premium data bulunamadı.");
            dispatch(clearPremiumData());
            return;
        }

        const doc = snapshot.docs[0];
        const premiumData: any = {
            id: doc.id,
            ...doc.data(),
        };

        // Optional: Güncel purchaseToken kontrolü
        const purchases = await getAvailablePurchases();
        const latestPurchaseToken = purchases[0]?.purchaseToken;
        const firestorePurchaseToken = premiumData.purchaseToken;

        if (firestorePurchaseToken !== latestPurchaseToken && latestPurchaseToken) {
            await firestore()
                .collection('users')
                .doc(userId)
                .collection('premiumData')
                .doc(premiumData.id)
                .update({
                    purchaseToken: latestPurchaseToken,
                });

            premiumData.purchaseToken = latestPurchaseToken;
        }

        dispatch(setPremiumDataList(premiumData));
    } catch (error) {
        console.error("Failed to fetch premium data:", error);
        dispatch(clearPremiumData());
    }
};

export const clearPremiumDataList = () => (dispatch: AppDispatch) => {
    dispatch(clearPremiumData());
};
