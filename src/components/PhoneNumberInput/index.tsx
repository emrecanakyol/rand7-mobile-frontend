import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { useTheme } from "../../utils/colors";
import NumberDropDownSvg from "../../assets/svg/NumbverDropDown";
import { responsive } from "../../utils/responsive";
import * as RNLocalize from "react-native-localize";


interface PhoneNumberInputProps {
    value: string;
    setValue: (value: string) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, setValue }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const phoneInput = useRef<PhoneInput>(null);
    const country = RNLocalize.getCountry(); // cihazın sistem ülkesini alır
    let countryCodes: any = country ? country : "US"

    const handlePhoneChange = (formattedValue: string) => {
        setValue(formattedValue);
    };

    return (
        <PhoneInput
            ref={phoneInput}
            defaultValue={value}
            defaultCode={countryCodes}
            layout="second"
            onChangeFormattedText={handlePhoneChange}
            withDarkTheme={false}
            withShadow={false}
            autoFocus
            placeholder={"___ ___ __ __"}
            containerStyle={styles.containerStyle}
            textContainerStyle={styles.textContainerStyle}
            renderDropdownImage={<NumberDropDownSvg />}
            textInputStyle={styles.textInputStyle}
            codeTextStyle={styles.codeTextStyle}
            textInputProps={{ keyboardType: "numeric", placeholderTextColor: "#828282" }}
        />
    );
};

export default PhoneNumberInput;

export const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    containerStyle: {
        borderColor: colors.GRAY_COLOR,
        borderWidth: 1,
        width: "100%",
        borderRadius: responsive(7),
        height: isTablet ? responsive(35) : responsive(50),
        backgroundColor: colors.WHITE_COLOR,
    },
    textContainerStyle: {
        backgroundColor: colors.WHITE_COLOR,
        borderTopEndRadius: responsive(7),
        borderBottomEndRadius: responsive(7),
        borderLeftColor: colors.STROKE_COLOR,
        borderLeftWidth: 2,
        margin: 0,
        padding: 0,
    },
    textInputStyle: {
        fontSize: isTablet ? 22 : 16,
        color: colors.TEXT_MAIN_COLOR,
        padding: 0,
        height: responsive(20),
    },
    codeTextStyle: {
        color: colors.TEXT_MAIN_COLOR,
    },
});
