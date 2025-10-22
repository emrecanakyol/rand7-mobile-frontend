import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CImage from '../CImage';
import images from '../../assets/image/images';
import { useTheme } from '../../utils/colors';
import CModal from '../CModal';
import FilterModal from './components/FilterModal';
import { MYPROFILE } from '../../navigators/Stack';

interface HeaderProps {
    userData: any;
    twoIcon?: boolean;
}

const Header: React.FC<HeaderProps> = ({ userData, twoIcon = true }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const { t } = useTranslation();
    const navigation: any = useNavigation();
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.inContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate(MYPROFILE)}>
                    <CImage
                        disablePress={true}
                        imgSource={
                            userData?.photos && userData?.photos.length > 0
                                ? { uri: userData?.photos[userData?.photos.length - 1] }
                                : images.defaultProfilePhoto
                        }
                        width={50}
                        height={50}
                        imageBorderRadius={50}
                    />
                </TouchableOpacity>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={22} />
                    </TouchableOpacity>

                    {twoIcon && (
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() => setFilterModalVisible(true)}>
                            <Ionicons name="options-outline" size={22} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Modal */}
            <CModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                paddingTop={Platform.OS === "android" ? 25 : 70}
                modalTitle='Filtre'
                closeButton={false}
            >
                <FilterModal onClose={() => setFilterModalVisible(false)} />
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
