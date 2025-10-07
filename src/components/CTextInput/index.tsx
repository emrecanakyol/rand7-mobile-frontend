import React, { useState, useEffect } from 'react';
import { TextInput, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../utils/colors';
import { responsive } from '../../utils/responsive';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

interface CTextInputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    errorMessage?: string;
    style?: object;
    maxLength: number;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad' | 'numeric' | 'url' | 'visible-password';
    validateEmail?: boolean;
    validatePassword?: boolean;  // Şifre doğrulama için yeni özellik
    required?: boolean;  // Yeni required prop'u
    multiline?: boolean;  // Çok satırlı metin girişi için yeni özellik
}

const CTextInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    errorMessage,
    style = {},
    maxLength,
    keyboardType = 'default',
    validateEmail = false,
    validatePassword = false,  // Şifre doğrulama kontrolü
    required = false,  // Varsayılan değer false
    multiline = false,  // Varsayılan değer false
}: CTextInputProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const [isPasswordVisible, setIsPasswordVisible] = useState(secureTextEntry);
    const [localErrorMessage, setLocalErrorMessage] = useState<string | undefined>(errorMessage);

    useEffect(() => {
        //Email doğru girilmişmi kontrol et
        if (keyboardType === 'email-address' && value) {
            const emailValidationMessage = validateEmailInput(value);
            setLocalErrorMessage(emailValidationMessage);
        }

        //Şifre kurallara göre doğru girilmişmi kontrol et
        if (validatePassword && value) {
            const passwordValidationMessage = validatePasswordInput(value);
            setLocalErrorMessage(passwordValidationMessage);
        }
    }, [value, validateEmail, validatePassword]);

    const validateEmailInput = (email: string) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!regex.test(email)) {
            return t('valid_email_error');
        }
        return '';
    };

    const validatePasswordInput = (password: string) => {
        const passwordRegex = /^(?=.*\d).{6,}$/; // En az 6 karakter ve bir rakam gereksinimi
        if (!passwordRegex.test(password)) {
            return t('valid_password_error');
        }
        return '';
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { marginTop: label ? 0 : responsive(-26) }]}>
                {label}
                {required && <Text style={styles.requiredAsterisk}> *</Text>}
            </Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multilineInput,
                        style
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={isPasswordVisible}
                    placeholderTextColor={colors.GRAY_COLOR}
                    maxLength={maxLength}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    multiline={multiline}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.iconContainer}
                    >
                        <Icon
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={isTablet ? 25 : 20}
                            color={colors.TEXT_MAIN_COLOR}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {(localErrorMessage || errorMessage) && (
                <Text style={styles.error}>{localErrorMessage || errorMessage}</Text>
            )}
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        marginVertical: responsive(10),
    },
    label: {
        fontSize: isTablet ? 22 : 16,
        fontWeight: '600',
        color: colors.BLACK_COLOR,
        paddingVertical: responsive(7)
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 0.5,
        borderColor: colors.GRAY_COLOR,
        backgroundColor: colors.BACKGROUND_COLOR,
        borderRadius: responsive(14),
        paddingRight: responsive(3),
    },
    input: {
        flex: 1,
        height: isTablet ? responsive(35) : responsive(50),
        paddingLeft: responsive(10),
        fontSize: isTablet ? 22 : 16,
        color: colors.BLACK_COLOR,
    },
    multilineInput: {
        height: responsive(100),
        paddingTop: responsive(10),
        textAlignVertical: 'top',
    },
    iconContainer: {
        padding: responsive(10),
    },
    error: {
        color: colors.RED_COLOR,
        fontSize: isTablet ? 20 : 14,
        marginTop: responsive(7),
    },
    requiredAsterisk: {
        color: colors.RED_COLOR,
        fontSize: isTablet ? 20 : 14,
        fontWeight: '400',
    },
});

export default CTextInput;
