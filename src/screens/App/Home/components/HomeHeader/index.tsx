import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, Dimensions } from 'react-native';
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

interface GroupsHeaderProps {
    fetchGroups?: () => void;
    title?: string;
    swipeListRef?: any;
    groupsData?: any;
    userData: any;
    loading?: boolean;
}

const GroupsHeader: React.FC<GroupsHeaderProps> = ({ fetchGroups, title, swipeListRef, groupsData, userData, loading }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const { t } = useTranslation();
    const navigation: any = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);

    const handleNewGroup = () => {
        // Kullanıcı 1 den fazla grup oluşturamasın.
        if (!premiumData?.isPremium && groupsData?.length > 0) {
            navigation.navigate(SUBSCRIPTONS);
        } else {
            setIsModalVisible(!isModalVisible);
            if (swipeListRef.current) {
                swipeListRef.current.closeAllOpenRows();
            }
        }
    };

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


                <TouchableOpacity
                    style={styles.newGroupButton}
                    onPress={handleNewGroup}
                    disabled={loading}>
                    <CText style={styles.newGroupText}>{`+ ${t('new_group')}`}</CText>
                </TouchableOpacity>

            </View>

            <CText style={styles.title}>{title}</CText>

        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        marginTop: Platform.OS === "android" ? responsive(30) : 0,
    },
    inContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: responsive(10),
    },
    title: {
        fontSize: isTablet ? 48 : 38,
        fontWeight: "700",
        color: colors.TEXT_MAIN_COLOR,
    },
    newGroupButton: {
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    newGroupText: {
        fontSize: isTablet ? 28 : 18,
        color: colors.TEXT_MAIN_COLOR,
        fontWeight: 'bold',
    },
});

export default GroupsHeader;
