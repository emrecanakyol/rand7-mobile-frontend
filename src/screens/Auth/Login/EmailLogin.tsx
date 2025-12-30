import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { signIn, signInWithGoogle } from '../../../store/services/authServices';
import { PHONE_LOGIN, REGISTER, RESET_PASSWORD } from '../../../navigators/Stack';
import { ToastError } from '../../../utils/toast';
import CTextInput from '../../../components/CTextInput';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import CButton from '../../../components/CButton';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CText from '../../../components/CText/CText';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

const EmailLogin = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const dispatch = useDispatch();
    const [email, setEmail] = useState(__DEV__ ? "emrecanakyoll@gmail.com" : "");
    const [password, setPassword] = useState(__DEV__ ? "2619.caN" : "");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = () => {
        navigation.navigate(RESET_PASSWORD);
    };

    const handleRegister = () => {
        navigation.navigate(REGISTER);
    };

    const handlePhoneAuth = () => {
        navigation.navigate(PHONE_LOGIN);
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signIn(email, password, dispatch);
        } catch (error) {
            ToastError(t('login_failed_title'), t('login_failed_message'));
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.innerContainer}>
                    <CText style={styles.header}>{t('login')}</CText>

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
                    <CButton
                        title={t('login_button')}
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                    />

                    <TouchableOpacity onPress={handleResetPassword} style={styles.linkContainer}>
                        <CText>{t('forgot_password')}</CText>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <CText>{t('dont_have_account')}</CText>
                        <TouchableOpacity onPress={handleRegister}>
                            <CText style={styles.registerText}>{t('sign_up')}</CText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.phoneFooter}>
                        <TouchableOpacity onPress={handlePhoneAuth} style={styles.phoneBtn}>
                            <CText>{t('login_with_phone')}</CText>
                            <FontAwesome name="phone" size={20} color={colors.BLACK_COLOR} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.googleFooter}>
                        <GoogleSigninButton
                            style={{ width: responsive(192), height: responsive(48), marginTop: responsive(10) }}
                            size={GoogleSigninButton.Size.Wide}
                            color={GoogleSigninButton.Color.Dark}
                            disabled={loading}
                            onPress={async () => {
                                try {
                                    setLoading(true);
                                    await signInWithGoogle(dispatch);
                                } catch (error) {
                                    ToastError(t('login_failed_title'), t('login_failed_message'));
                                }
                                setLoading(false);
                            }}
                        />
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
    linkContainer: {
        marginTop: responsive(10),
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: responsive(20),
    },
    registerText: {
        fontWeight: '700',
        marginLeft: responsive(5),
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: colors.GRAY_COLOR,
        marginTop: responsive(20),
    },
    phoneFooter: {
        marginTop: responsive(30),
        alignItems: "center",
    },
    phoneBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.BLACK_COLOR,
        padding: responsive(14),
        borderRadius: responsive(28),
        width: responsive(350),
        gap: responsive(7)
    },
    googleFooter: {
        marginTop: responsive(20),
        alignItems: 'center',
    },
});

export default EmailLogin;
