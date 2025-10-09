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

        const userDoc = await firestore().collection("users").doc(userId).get();

        if (!userDoc.exists) {
            console.log("User data bulunamadı.");
            dispatch(clearUserData());
            return;
        }

        const data = userDoc.data();
        dispatch(setUserData(data));
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
