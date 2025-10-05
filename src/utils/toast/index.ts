import Toast from 'react-native-toast-message';
import { responsive } from '../responsive';
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = Math.min(width, height) >= 600;

export const ToastSuccess = (title: string, description: string, time?: number) => {
    Toast.show({
        type: 'success',
        position: 'top',
        text1: title,
        text2: description ? description : "Hata",
        visibilityTime: time ?? 3000,
        autoHide: true,
        topOffset: responsive(50),
        bottomOffset: responsive(40),
        text1Style: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: "600",
        },
        text2Style: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: "400",
        }
    });
};

export const ToastError = (title: string, description: string, time?: number) => {
    Toast.show({
        type: 'error',
        position: 'top',
        text1: title,
        text2: description,
        visibilityTime: time ?? 3000,
        autoHide: true,
        topOffset: responsive(50),
        bottomOffset: responsive(40),
        text1Style: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: "600",
        },
        text2Style: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: "400",
        }
    });
};