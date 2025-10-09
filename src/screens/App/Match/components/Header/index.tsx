import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Platform, Dimensions } from 'react-native';
import { useTheme } from '../../../../../utils/colors';
import images from '../../../../../assets/image/images';
import { useNavigation } from '@react-navigation/native';
import CImage from '../../../../../components/CImage';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface HeaderProps {
    userData?: any;
}

const Header: React.FC<HeaderProps> = ({ userData }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const { t } = useTranslation();
    const navigation: any = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.inContainer}>
                <CImage
                    disablePress={true}
                    imgSource={
                        userData?.photos && userData?.photos.length > 0
                            ? { uri: userData?.photos[userData?.photos.length - 1] }
                            : images.defaultProfilePhoto
                    }
                    width={45}
                    height={45}
                    borderRadius={100}
                    imageBorderRadius={100}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.notificationButton}>
                        <Ionicons
                            name="notifications-outline"
                            size={22}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.notificationButton}>
                        <Ionicons
                            name="options-outline"
                            size={22}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        padding: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderColor: colors.GRAY_COLOR,
    },
    inContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    notificationButton: {
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: colors.GRAY_COLOR,
        borderRadius: 100,
        width: 40,
        height: 40,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
    },

});

export default Header;
