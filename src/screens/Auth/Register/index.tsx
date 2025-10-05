import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { createUser } from '../../../store/services/authServices';
import { ToastError, ToastSuccess } from '../../../utils/toast';
import CTextInput from '../../../components/CTextInput';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import CButton from '../../../components/CButton';
import { EMAIL_LOGIN } from '../../../navigators/Stack';
import CBackButton from '../../../components/CBackButton';
import CText from '../../../components/CText/CText';
import { useTranslation } from 'react-i18next';
import DeviceInfo from 'react-native-device-info';

const Register = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const [email, setEmail] = useState(__DEV__ ? "emrecanakyoll@gmail.com" : "");
    const [password, setPassword] = useState(__DEV__ ? "2619.caN" : "");
    const [verifyPassword, setVerifyPassword] = useState(__DEV__ ? "2619.caN" : "");
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleRegister = async () => {
        setLoading(true);

        if (password !== verifyPassword) {
            ToastError(t('register_failed_title'), t('passwords_do_not_match'));
        }

        try {
            await createUser(email, password);
            navigation.navigate(EMAIL_LOGIN);
            ToastSuccess(t('register_success_title'), t('register_success_message'));
        } catch (error) {
            ToastError(t('register_failed_title'), t('register_failed_message'));
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <CBackButton />

                <View style={styles.innerContainer}>
                    <CText style={styles.header}>{t('sign_up')}</CText>

                    <CTextInput
                        label={t('email')}
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('email')}
                        maxLength={120}
                        keyboardType="email-address"
                        validateEmail
                    />
                    <CTextInput
                        label={t('password')}
                        value={password}
                        onChangeText={setPassword}
                        placeholder={t('password')}
                        maxLength={120}
                        secureTextEntry
                        validatePassword
                    />
                    <CTextInput
                        label={t('verify_password')}
                        value={verifyPassword}
                        onChangeText={setVerifyPassword}
                        placeholder={t('verify_password')}
                        maxLength={120}
                        secureTextEntry
                        validatePassword
                    />

                    <CButton
                        title={t('register')}
                        onPress={handleRegister}
                        backgroundColor={colors.BLACK_COLOR}
                        textColor={colors.WHITE_COLOR}
                        loading={loading}
                        disabled={loading}
                    />

                    <View style={styles.footer}>
                        <CText>{t('already_have_account')}</CText>
                        <TouchableOpacity onPress={handleBack}>
                            <CText style={styles.registerText}>{t('login')}</CText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
        padding: responsive(20),
        paddingTop: responsive(30),
    },
    innerContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        fontSize: isTablet ? 34 : 24,
        fontWeight: '700',
        color: colors.TEXT_MAIN_COLOR,
        marginBottom: responsive(20),
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: responsive(20),
        gap: responsive(5)
    },
    registerText: {
        fontWeight: '700',
    },
});

export default Register;
