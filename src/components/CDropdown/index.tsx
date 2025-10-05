import React from 'react';
import { StyleSheet, View, TextStyle, ViewStyle, Dimensions } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from '../../utils/colors';
import { responsive } from '../../utils/responsive';

interface CDropdownProps {
    data: Array<{ label: string; value: string }>;
    value: string;
    onChange: (item: { label: string; value: string }) => void;
    placeholder?: string;
    containerStyle?: ViewStyle;
    dropdownStyle?: ViewStyle;
    placeholderStyle?: TextStyle;
    selectedTextStyle?: TextStyle;
    itemTextStyle?: TextStyle;
    activeColor?: string;
    disabled?: boolean;
}

const CDropdown: React.FC<CDropdownProps> = ({
    data,
    value,
    onChange,
    placeholder,
    containerStyle,
    dropdownStyle,
    placeholderStyle,
    selectedTextStyle,
    itemTextStyle,
    activeColor,
    disabled,
}) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);

    return (
        <View style={containerStyle}>
            <Dropdown
                style={[styles.dropdown, dropdownStyle, disabled ? { opacity: 0.6 } : null]}
                placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
                selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
                containerStyle={styles.dropdownContainerStyle}
                itemTextStyle={[styles.itemTextStyle, itemTextStyle]}
                activeColor={activeColor || colors.BACKGROUND_COLOR}
                data={data}
                labelField="label"
                valueField="value"
                placeholder={placeholder ? placeholder : "Select"}
                value={value}
                onChange={onChange}
                disable={!!disabled}
            />
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        dropdown: {
            height: isTablet ? responsive(35) : responsive(50),
            borderColor: colors.GRAY_COLOR,
            borderWidth: 1,
            borderRadius: responsive(7),
            paddingHorizontal: responsive(8),
        },
        placeholderStyle: {
            fontSize: isTablet ? 22 : 16,
            color: colors.TEXT_DESCRIPTION_COLOR,
            fontWeight: "400",
        },
        selectedTextStyle: {
            fontSize: isTablet ? 22 : 16,
            color: colors.TEXT_MAIN_COLOR,
            fontWeight: "600",
        },
        dropdownContainerStyle: {
            backgroundColor: colors.BACKGROUND_COLOR,
            borderColor: colors.GRAY_COLOR,
            borderWidth: 1,
            borderRadius: responsive(7),
        },
        itemTextStyle: {
            fontSize: isTablet ? 22 : 16,
            color: colors.TEXT_MAIN_COLOR,
            fontWeight: "400"

        },
    });

export default CDropdown;
