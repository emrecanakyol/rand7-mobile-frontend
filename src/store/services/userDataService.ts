// store/services/userDataService.ts
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AppDispatch } from '../store';
import { setUserData, clearUserData, setLoading, setError } from '../reducer/userDataReducer';

export const fetchUserData = () => async (dispatch: AppDispatch) => {
    try {
        const userId = auth().currentUser?.uid;

        if (!userId) {
            dispatch(clearUserData());
            return;
        }

        dispatch(setLoading(true));

        //---- Düz sadece userData çekiyor. 
        // const userDoc = await firestore().collection("users").doc(userId).get();

        // if (!userDoc.exists) {
        //     console.log("User data bulunamadı.");
        //     dispatch(clearUserData());
        //     return;
        // }

        // const data = userDoc.data();
        // dispatch(setUserData(data));

        //---- userData çekerken online modu ekliyor.
        const userRef = firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log("User data bulunamadı.");
            dispatch(clearUserData());
            return;
        }

        // 1) Redux'a user data'yı yaz
        const data = userDoc.data();
        dispatch(setUserData(data));

        // 2) online alanını güncelle
        const now = new Date();
        now.setSeconds(0, 0); // saniye = 0, milisaniye = 0

        await userRef.update({
            lastOnline: firestore.Timestamp.fromDate(now), //sadece lastOnline ekler/günceller
        });

    } catch (error: any) {
        console.error("Failed to fetch user data:", error);
        dispatch(setError(error.message));
        dispatch(clearUserData());
    } finally {
        dispatch(setLoading(false));
    }
};

export const clearUserDataAction = () => (dispatch: AppDispatch) => {
    dispatch(clearUserData());
};
