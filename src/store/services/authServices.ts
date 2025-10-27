// authService.js
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { getFcmToken } from '../../utils/fcmHelper';

export const setUser = (user: any) => ({
    type: 'SET_USER',
    payload: user,
});

export const logout = () => ({
    type: 'LOGOUT',
});

export const resetAuth = () => ({
    type: 'RESET_AUTH',
});

//===EMAIL===
export const signIn = async (
    email: string,
    password: string,
    dispatch: any,
) => {
    try {
        const { user } = await auth().signInWithEmailAndPassword(email, password);
        const userData = {
            uid: user.uid,
            email: user.email,
        };

        await AsyncStorage.setItem('user', JSON.stringify(userData));

        dispatch(setUser({ ...userData }));
    } catch (error: any) {
        console.log('Sign in failed:', error);
        throw error.response.data;
    }
};

export const createUser = async (email: string, password: string) => {
    try {
        const { user } = await auth().createUserWithEmailAndPassword(email, password);

        await firestore()
            .collection('users')
            .doc(user.uid)
            .set({
                createdAt: new Date(),
                userId: user.uid,
                email: user.email,
                emailVerification: true, // E-posta doğrulama başlangıçta true
            });

        // Opsiyonel: Kullanıcıya doğrulama e-postası gönder
        await user.sendEmailVerification();
        return user;
    } catch (error: any) {
        console.log('Registration failed: ', error);
        throw error.response.data;
    }
};

export const resetPassword = async (email: string) => {
    try {
        await auth().sendPasswordResetEmail(email);
        return { success: true, message: 'Şifre sıfırlama e-postası gönderildi!' };
    } catch (error: any) {
        console.log('Şifre sıfırlama hatası:', error);
        return { success: false, message: 'E-posta adresi hatalı veya kayıtlı değil.' };
    }
};

export const signOut = async (dispatch: any) => {
    try {
        const userId = auth().currentUser?.uid;
        const token = await getFcmToken();

        // Çıkış yapmadan önce firestoredeki bu cihazın fcmToken sil.
        if (token) {
            await firestore()
                .collection("users")
                .doc(userId)
                .update({
                    fcmTokens: firestore.FieldValue.arrayRemove(token),
                });

            console.log("Token başarıyla silindi:", token);
        }

        // premiumData verisi varsa onu da temizle
        await dispatch(clearPremiumData());

        await auth().signOut();
        // Remove user data from AsyncStorage
        await AsyncStorage.removeItem('user');
        // Dispatch logout action
        await dispatch(logout());
    } catch (error: any) {
        console.log('Sign out failed:', error);
        throw error.response.data;
    }
};

//===PHONE===
export const signInPhoneNumber = async (phoneNumber: string) => {
    try {
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        return confirmation;
    } catch (error: any) {
        // Firebase hata kodunu kontrol et
        const errorCode = error?.code || error?.message || '';

        if (errorCode.includes('too-many-requests')) {
            // Cihaz geçici olarak engellendi
            ToastError(
                'Çok fazla istek gönderildi',
                'Lütfen kısa bir süre sonra tekrar deneyin.'
            );
        } else if (errorCode.includes('invalid-phone-number')) {
            ToastError(
                'Geçersiz Telefon Numarası',
                'Lütfen geçerli bir telefon numarası formatı girin.'
            );
        } else if (errorCode.includes('network-request-failed')) {
            ToastError(
                'Bağlantı Hatası',
                'Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'
            );
        } else {
            ToastError(
                'Doğrulama Başarısız',
                'Telefon numarası doğrulaması şu anda gerçekleştirilemiyor.'
            );
        }
        // Hata fırlatmayı istersen log amaçlı koruyabilirsin:
        throw error;
    }
};

// Doğrulama kodunu onaylama fonksiyonu
export const confirmCode = async (
    confirmation: any,
    verificationCode: string,
    dispatch: any,
) => {
    try {
        const { user } = await confirmation.confirm(verificationCode);

        const userData = {
            createdAt: new Date(),
            uid: user.uid,
            phoneNumber: user.phoneNumber,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        dispatch(setUser({ ...userData }));

        await firestore()
            .collection('users')
            .doc(user.uid)
            .set(
                {
                    phoneNumber: user.phoneNumber,
                    createdAt: new Date(),
                    userId: user.uid,
                },
                { merge: true },
            );
    } catch (error: any) {
        console.log('Code confirmation failed:', error);
        throw error.response.data;
    }
};

export const resendCode = async (phoneNumber: string, dispatch: any) => {
    try {
        // Yeni bir doğrulama kodu göndermek için signInPhoneNumber fonksiyonunu çağırın
        const confirmation = await signInPhoneNumber(phoneNumber);
        return confirmation;
    } catch (error: any) {
        console.log('Kod gönderimi başarısız:', error);

        throw error.response.data;
    }
};

//===SOSYAL GİRİŞ ===
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { clearPremiumData } from '../reducer/premiumDataReducer';
import { ToastError } from '../../utils/toast';

// Initialize GoogleSignin
GoogleSignin.configure({
    webClientId:
        '516391638484-qsqgdcv9tqve4lst8ot4gcdqpl996rq8.apps.googleusercontent.com',
    offlineAccess: true,
});

// Google ile giriş yapma fonksiyonu
export const signInWithGoogle = async (dispatch: any) => {
    try {
        await GoogleSignin.hasPlayServices();
        const { idToken }: any = await GoogleSignin.signIn();

        const credential = auth.GoogleAuthProvider.credential(idToken);
        const { user } = await auth().signInWithCredential(credential);

        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        };

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        dispatch(setUser({ ...userData }));

        await firestore().collection('users').doc(user.uid).set(
            {
                email: user.email,
                displayName: user.displayName,
                createdAt: new Date(),
                userId: user.uid,
            },
            { merge: true },
        );
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // User cancelled the login flow
            console.log('Google sign-in cancelled');
        } else if (error.code === statusCodes.IN_PROGRESS) {
            // Operation (e.g. sign in) is in progress already
            console.log('Google sign-in in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // Play services not available or outdated
            console.log('Play services not available');
        } else {
            // Some other error happened
            console.log('Google sign-in failed:', error);
        }
        throw error;
    }
};
