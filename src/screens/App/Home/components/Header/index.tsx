import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Platform, Dimensions } from 'react-native';
import { responsive } from '../../../../../utils/responsive';
import { useTheme } from '../../../../../utils/colors';
import images from '../../../../../assets/image/images';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CText from '../../../../../components/CText/CText';
import CImage from '../../../../../components/CImage';
import { useTranslation } from 'react-i18next';
import { SUBSCRIPTONS } from '../../../../../navigators/Stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);
    const [activeTab, setActiveTab] = useState<'friends' | 'partners'>('partners');

    const openDrawer = () => {
        navigation.openDrawer();
    };

    return (
        <View style={styles.container}>
            <View style={styles.inContainer}>
                <TouchableOpacity onPress={openDrawer}>
                    <CImage
                        disablePress={true}
                        imgSource={
                            userData?.photos && userData?.photos.length > 0
                                ? { uri: userData?.photos[userData?.photos.length - 1] }
                                : images.defaultProfilePhoto
                        }
                        width={isTablet ? responsive(35) : responsive(50)}
                        height={isTablet ? responsive(35) : responsive(50)}
                        borderRadius={responsive(100)}
                        imageBorderRadius={responsive(100)}
                    />
                </TouchableOpacity>


                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.notificationButton}>
                        <Ionicons
                            name="notifications-outline"
                            size={isTablet ? responsive(24) : responsive(24)}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.notificationButton}>
                        <Ionicons
                            name="options-outline"
                            size={isTablet ? responsive(24) : responsive(24)}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        padding: responsive(10),
        paddingHorizontal: responsive(20),
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
        borderWidth: 0.7,
        borderColor: colors.GREEN_COLOR,
        borderRadius: responsive(100),
        width: isTablet ? responsive(45) : responsive(45),
        height: isTablet ? responsive(45) : responsive(45),
    },
    buttonContainer: {
        flexDirection: "row",
        gap: responsive(12),
    },

});

export default Header;
