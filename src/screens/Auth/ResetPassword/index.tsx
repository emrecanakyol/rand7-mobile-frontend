import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { resetPassword } from '../../../store/services/authServices';
import { ToastError, ToastSuccess } from '../../../utils/toast';
import CTextInput from '../../../components/CTextInput';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import CText from '../../../components/CText/CText';
import CBackButton from '../../../components/CBackButton';
import { useTranslation } from 'react-i18next';
import CCooldownButton from '../../../components/CCooldownButton';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const ResetPassword = () => {
    const route: any = useRoute();
    const emailFromProps = route.params?.email ?? '';
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const [email, setEmail] = useState(emailFromProps ?? "");
    const [loading, setLoading] = useState(false);
    const [showFooterText, setShowFooterText] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    // Başka ekrandan Email gönderilmiş ise doğrulaması için Firestore kontrolü
    const checkEmailInFirestore = async () => {
        if (!emailFromProps) {
            setIsButtonDisabled(false);
            return;
        }
        try {
            // emailFromProps ile eşleşen user document bulma
            const usersSnapshot = await firestore()
                .collection('users')
                .where('email', '==', emailFromProps)
                .limit(1)
                .get();

            if (!usersSnapshot.empty) {
                // Kullanıcı bulundu, inputtaki email ile eşleşiyor mu kontrol et ve butonu ona göre disabled yap
                const firestoreEmail = usersSnapshot.docs[0].data().email;
                setIsButtonDisabled(firestoreEmail !== email);
            } else {
                // Kullanıcı yok, butonu kapat
                setIsButtonDisabled(true);
            }
        } catch (error) {
            console.log('Error checking email in firestore:', error);
            setIsButtonDisabled(true);
        }
    };

    useEffect(() => {
        checkEmailInFirestore();
    }, [email, emailFromProps]);

    const handleResetPassword = async () => {
        setLoading(true);
        const response = await resetPassword(email);

        if (response.success) {
            ToastSuccess(t('reset_success_title'), t('reset_success_message'));
            setShowFooterText(true); // sayaç başladığında yazıyı görünür yap
        } else {
            ToastError(t('reset_error_title'), t('reset_error_message'));
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
                    <CText style={styles.header}>{t('reset_password_title')}</CText>

                    <CTextInput
                        label={t('email')}
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('email')}
                        maxLength={120}
                        keyboardType="email-address"
                        validateEmail
                    />

                    <CCooldownButton
                        title={t('reset_password_button')}
                        onPress={handleResetPassword}
                        cooldownKey="resetPasswordCooldownEndTime"
                        cooldownSeconds={900}
                        backgroundColor={colors.PURPLE_COLOR}
                        textColor={colors.WHITE_COLOR}
                        borderRadius={28}
                        loading={loading}
                        disabled={loading || isButtonDisabled}
                        setShowFooterText={setShowFooterText} // Sayacın bitişinden haberdar ol
                    />

                    {showFooterText && (
                        <View style={styles.footer}>
                            <CText style={styles.footerText}>{t('reset_password_info')}</CText>
                        </View>
                    )}
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
        fontWeight: 'bold',
        color: colors.TEXT_MAIN_COLOR,
        marginBottom: responsive(20),
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: responsive(20),
    },
    footerText: {
        textAlign: "center",
    }
});

export default ResetPassword;
