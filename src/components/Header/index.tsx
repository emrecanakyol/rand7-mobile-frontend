import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CImage from '../CImage';
import images from '../../assets/image/images';
import { useTheme } from '../../utils/colors';
import CModal from '../CModal';
import Filter from './components/Filter';

interface HeaderProps {
    userData: any;
}

const Header: React.FC<HeaderProps> = ({ userData }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const { t } = useTranslation();
    const navigation: any = useNavigation();

    // ✅ Modal görünürlüğü state
    const [modalVisible, setModalVisible] = useState(false);

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
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={22} />
                    </TouchableOpacity>

                    {/* ✅ Options icon - modal açar */}
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => setModalVisible(true)}>
                        <Ionicons name="options-outline" size={22} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal */}
            <CModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                paddingTop={Platform.OS === "android" ? 25 : 70}
                modalTitle='Filtre'
                closeButton={false}
            >
                <Filter onClose={() => setModalVisible(false)} />
            </CModal>
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
