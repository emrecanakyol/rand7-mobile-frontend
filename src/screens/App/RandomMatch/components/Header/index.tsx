import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Platform, Dimensions } from 'react-native';
import { responsive } from '../../../../../utils/responsive';
import { useTheme } from '../../../../../utils/colors';
import images from '../../../../../assets/image/images';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CText from '../../../../../components/CText/CText';
import CImage from '../../../../../components/CImage';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface HeaderProps {

}

const Header: React.FC<HeaderProps> = ({ }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const { t } = useTranslation();
    const navigation: any = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);

    const openDrawer = () => {
        navigation.openDrawer();
    };

    return (
        <View style={styles.container}>
            <View style={styles.inContainer}>
                {/* <TouchableOpacity onPress={openDrawer}>
                    <CImage
                        disablePress={true}
                        imgSource={images.defaultProfilePhoto}
                        width={isTablet ? responsive(35) : responsive(50)}
                        height={isTablet ? responsive(35) : responsive(50)}
                        borderRadius={responsive(100)}
                        imageBorderRadius={responsive(100)}
                    />
                </TouchableOpacity> */}

                <CText style={{ fontSize: isTablet ? responsive(24) : responsive(40), fontWeight: "bold" }}>Rand7</CText>

                <TouchableOpacity
                    style={styles.notificationButton}>
                    <AntDesign
                        name="filter"
                        size={isTablet ? responsive(24) : responsive(24)}
                    />
                </TouchableOpacity>

            </View>
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        padding: responsive(24),
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
        borderColor: colors.GREEN_COLOR,
        borderRadius: responsive(100),
        width: isTablet ? responsive(45) : responsive(45),
        height: isTablet ? responsive(45) : responsive(45),
    },
});

export default Header;
