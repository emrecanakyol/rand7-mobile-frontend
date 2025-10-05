import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../utils/colors';
import { responsive } from '../../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';

const CustomBackButton = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Entypo
                name="chevron-left"
                size={isTablet ? 30 : 20}
                color={colors.WHITE_COLOR}
            />
        </TouchableOpacity>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    backButton: {
        backgroundColor: colors.BLACK_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: responsive(50),
        width: isTablet ? responsive(18) : responsive(26),
        height: isTablet ? responsive(18) : responsive(26),
    },
});

export default CustomBackButton;