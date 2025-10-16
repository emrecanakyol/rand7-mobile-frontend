import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { PHONE_VERIFICATION } from '../../../navigators/Stack';
import { ToastError } from '../../../utils/toast';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import CButton from '../../../components/CButton';
import { signInPhoneNumber } from '../../../store/services/authServices';
import Icon from 'react-native-vector-icons/Ionicons';
import PhoneNumberInput from '../../../components/PhoneNumberInput';
import CBackButton from '../../../components/CBackButton';
import CText from '../../../components/CText/CText';
import { useTranslation } from 'react-i18next';

const PhoneLogin = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handlePhoneSignIn = async () => {
        if (!phoneNumber) {
            ToastError(t('login_failed_title'), t('invalid_phone_number'));
            return;
        }
        setLoading(true);

        try {
            const confirmation = await signInPhoneNumber(phoneNumber);
            navigation.navigate(PHONE_VERIFICATION, { confirmation, phoneNumber });
        } catch (err) {
            ToastError(t('login_failed_title'), t('invalid_phone_number'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <CBackButton />
                <View style={styles.innerContainer}>
                    <CText style={styles.header}>{t('phone_number_entry')}</CText>
                    <PhoneNumberInput
                        value={phoneNumber}
                        setValue={setPhoneNumber}
                    />
                    <CButton
                        title={t('send_code')}
                        onPress={handlePhoneSignIn}
                        loading={loading}
                        disabled={loading}
                        style={{
                            marginTop: 20,
                        }}
                    />

                    <View style={styles.divider} />

                    <View style={styles.phoneFooter}>
                        <TouchableOpacity onPress={handleBack} style={styles.phoneBtn}>
                            <CText>{t('login_with_email')}</CText>
                            <Icon name="mail-outline" size={20} color={colors.BLACK_COLOR} />
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
    divider: {
        borderTopWidth: 1,
        borderTopColor: colors.GRAY_COLOR,
        marginVertical: responsive(20),
    },
    phoneFooter: {
        alignItems: "center",
    },
    phoneBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.BLACK_COLOR,
        padding: responsive(14),
        borderRadius: responsive(28),
        alignItems: "center",
        width: responsive(350),
        gap: responsive(5),
    },
});

export default PhoneLogin;
