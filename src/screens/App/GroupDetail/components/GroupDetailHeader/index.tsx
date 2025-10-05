import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useTheme } from '../../../../../utils/colors';
import CText from '../../../../../components/CText/CText';
import AddGroupDetail from '../AddGroupDetail';
import CustomBackButton from '../../../../../components/CBackButton';
import DeviceInfo from 'react-native-device-info';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SUBSCRIPTONS } from '../../../../../navigators/Stack';
import { useNavigation } from '@react-navigation/native';
import { responsive } from '../../../../../utils/responsive';
import { RootState } from '../../../../../store/store';
import { useSelector } from 'react-redux';

interface CustomHeaderProps {
    title: string;
    groupId: string;
    fetchNotifications: () => void;
    swipeListRef?: any;
    notificationsData?: any;
    loading?: boolean;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ title, groupId, fetchNotifications, swipeListRef, notificationsData, loading }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);

    const handleNewNatification = () => {
        //Kullanıcı 1 den fazla bildirim hatırlatıcısı oluşturamasın.
        if (!premiumData?.isPremium && notificationsData?.length > 0) {
            navigation.navigate(SUBSCRIPTONS);
        } else {
            setIsModalVisible(!isModalVisible);
            if (swipeListRef.current) {
                swipeListRef.current.closeAllOpenRows();
            }
        }
    };

    return (
        <View style={styles.header}>
            <CustomBackButton />
            <CText style={styles.title}>{title}</CText>

            <TouchableOpacity
                onPress={handleNewNatification}
                disabled={loading}
            >
                <Ionicons name="add-circle-outline" size={isTablet ? 50 : 28} color={colors.BLACK_COLOR} />
            </TouchableOpacity>

            <AddGroupDetail
                visible={isModalVisible}
                onClose={handleNewNatification}
                groupId={groupId}
                fetchNotifications={fetchNotifications}
            />
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.WHITE_COLOR,
        paddingTop: isTablet ? responsive(15) : responsive(30),
    },
    title: {
        fontSize: isTablet ? 40 : 30,
        fontWeight: "700",
        color: colors.TEXT_MAIN_COLOR,
    },
});

export default CustomHeader;