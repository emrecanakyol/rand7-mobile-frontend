import React from 'react';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { responsive } from '../../utils/responsive';
import { useTheme } from '../../utils/colors';
import CText from '../CText/CText';

interface CButtonProps {
    title: string;
    onPress: () => void;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    style?: object;
    loading?: any;
    disabled?: any;
}

const CButton = ({
    title,
    onPress,
    backgroundColor,
    textColor,
    borderRadius = responsive(7),
    style = {},
    loading,
    disabled,
}: CButtonProps) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);

    // Varsayılan renkleri burada ayarla
    const btnBgColor = backgroundColor ?? colors.BLACK_COLOR;
    const btnTextColor = textColor ?? colors.WHITE_COLOR;

    return (
        <View style={[styles.buttonContainer, style]}>
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: btnBgColor, borderRadius },
                    disabled && styles.disabledButton
                ]}
                onPress={!disabled && !loading ? onPress : undefined}
                disabled={loading || disabled}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={btnTextColor} />
                ) : (
                    <CText style={[styles.buttonText, { color: btnTextColor }]}>{title}</CText>
                )}
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        buttonContainer: {
            marginVertical: responsive(15),
        },
        button: {
            paddingVertical: isTablet ? responsive(10) : responsive(14),
            paddingHorizontal: responsive(20),
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonText: {
            fontSize: isTablet ? 22 : 16,
            fontWeight: 'bold',
            color: colors.WHITE_COLOR,
        },
        disabledButton: {
            backgroundColor: colors.GRAY_COLOR,
        },
    });

export default CButton;
