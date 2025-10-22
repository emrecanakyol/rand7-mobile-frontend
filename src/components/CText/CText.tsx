import React from 'react';
import { Text, TextProps, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../utils/colors';

type FontWeightType = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

interface CTextProps extends TextProps {
    fontSize?: number;
    color?: string;
    fontWeight?: FontWeightType;
    required?: boolean;
    textAlign?: "auto" | "center" | "justify" | "left" | "right",
}

const CText: React.FC<CTextProps> = ({
    children,
    style,
    fontSize,
    color,
    fontWeight,
    required = false,
    textAlign,
    ...props
}) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);

    return (
        <Text
            style={[{
                fontSize: fontSize ? fontSize : isTablet ? 22 : 16,
                color: color ? color : colors.TEXT_MAIN_COLOR,
                fontWeight: fontWeight ? fontWeight : '400',
                textAlign,
            },
                style
            ]}
            {...props}
        >
            {children}
            {required && <Text style={styles.requiredStyle}> *</Text>}

        </Text>
    );
};

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        requiredStyle: {
            color: colors.RED_COLOR,
            fontSize: isTablet ? 22 : 16,
            fontWeight: '600',
        },
    });

export default CText; 