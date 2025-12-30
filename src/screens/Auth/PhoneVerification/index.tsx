import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    TouchableOpacity,
    Platform,
    TextInput,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { confirmCode, resendCode } from '../../../store/services/authServices';
import { ToastError } from '../../../utils/toast';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import CButton from '../../../components/CButton';
import CText from '../../../components/CText/CText';
import { useTranslation } from 'react-i18next';

const PhoneVerification = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const { confirmation, phoneNumber } = route.params;
    const { t } = useTranslation();

    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timer, setTimer] = useState<number>(120);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [resendLoading, setResendLoading] = useState<boolean>(false);

    const refs = [
        useRef<TextInput | null>(null),
        useRef<TextInput | null>(null),
        useRef<TextInput | null>(null),
        useRef<TextInput | null>(null),
        useRef<TextInput | null>(null),
        useRef<TextInput | null>(null),
    ];

    const dispatch = useDispatch();

    const handleConfirmCode = async () => {
        const code = otp.join('');
        if (code.length === 6) {
            setLoading(true);

            try {
                await confirmCode(confirmation, code, dispatch);
            } catch (err: any) {
                ToastError(t('verification_error_title'), t('verification_error_message'));
            } finally {
                setLoading(false);
            }
        } else {
            ToastError(t('verification_error_title'), t('verification_error_message'));
        }
    };

    const fillAllFromCode = (fullCode: string) => {
        // sadece rakamları al, max 6 hane
        const cleaned = fullCode.replace(/[^0-9]/g, '').slice(0, 6);
        if (!cleaned) return;

        const chars = cleaned.split('');
        const filled = ['', '', '', '', '', ''];

        for (let i = 0; i < chars.length; i++) {
            filled[i] = chars[i];
        }

        setOtp(filled);

        // son haneye focus et
        const lastIndex = Math.min(chars.length - 1, 5);
        if (lastIndex >= 0 && refs[lastIndex]?.current) {
            refs[lastIndex].current?.focus();
        }

        // istersen burada otomatik verify de yapabilirsin:
        // if (cleaned.length === 6) {
        //     handleConfirmCode();
        // }
    };

    const handleTextChange = (text: string, index: number) => {
        // iOS autofill veya kullanıcı paste ile komple kod yapıştırdıysa
        if (text.length > 1) {
            fillAllFromCode(text);
            return;
        }

        // normal tek karakter girişi
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // ileri odak
        if (text && index < 5) {
            refs[index + 1].current?.focus();
        }
    };

    const handleBackspace = (index: number) => {
        // şu anki kutu zaten boşsa, bir önceki kutuyu da sil ve ona dön
        if (otp[index] === '' && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
            refs[index - 1].current?.focus();
            return;
        }

        // değilse sadece bu kutuyu boşalt
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
    };

    const handleResendCode = async () => {
        if (resendLoading) return;

        setResendLoading(true);
        setCanResend(false);

        try {
            await resendCode(phoneNumber, dispatch);
            setOtp(['', '', '', '', '', '']);
            setTimer(120);
            setCanResend(false);
        } catch (err) {
            console.log('Kod yeniden gönderiminde hata:', err);
        } finally {
            setResendLoading(false);
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (timer > 0 && !canResend) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
            clearInterval(interval!);
        } else {
            clearInterval(interval!);
        }

        return () => clearInterval(interval!);
    }, [timer, canResend]);

    // mm:ss format
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.innerContainer}>
                    <CText style={styles.header}>
                        {t('phone_verification_title')}
                    </CText>

                    <View>
                        <View style={styles.otpContainer}>
                            {otp.map((value, index) => (
                                <TextInput
                                    key={index}
                                    style={styles.roundedTextInput}
                                    value={value}
                                    onChangeText={(text) =>
                                        handleTextChange(text, index)
                                    }
                                    keyboardType="number-pad"
                                    // iOS'un "Mesajlar'dan xxxx" autofill'i için kritik
                                    textContentType="oneTimeCode"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    ref={refs[index]}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Backspace') {
                                            handleBackspace(index);
                                        }
                                    }}
                                />
                            ))}
                        </View>

                        <CButton
                            title={t('login_button')}
                            onPress={handleConfirmCode}
                            backgroundColor={colors.BLACK_COLOR}
                            textColor={colors.WHITE_COLOR}
                            loading={loading}
                        />

                        <View style={styles.resendView}>
                            {resendLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.BLACK_COLOR}
                                />
                            ) : canResend ? (
                                <TouchableOpacity
                                    onPress={handleResendCode}
                                    disabled={!canResend || resendLoading}
                                >
                                    <CText style={styles.resendText}>
                                        {t('resend_code')}
                                    </CText>
                                </TouchableOpacity>
                            ) : (
                                <CText style={styles.timeText}>
                                    {formattedTime}
                                </CText>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
            padding: responsive(20),
        },
        innerContainer: {
            flexGrow: 1,
            justifyContent: 'center',
        },
        roundedTextInput: {
            borderRadius: responsive(10),
            height: responsive(50),
            width: responsive(50),
            borderColor: colors.GRAY_COLOR,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: isTablet ? 22 : 16,
            color: colors.TEXT_MAIN_COLOR,
            paddingBottom: 0,
        },
        otpContainer: {
            justifyContent: 'space-around',
            marginVertical: responsive(20),
            flexDirection: 'row',
        },
        header: {
            fontSize: isTablet ? 34 : 24,
            fontWeight: '600',
            color: colors.TEXT_MAIN_COLOR,
            marginBottom: responsive(20),
            textAlign: 'center',
        },
        resendView: {
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: responsive(15),
            flexDirection: 'row',
        },
        resendText: {
            fontSize: isTablet ? 22 : 16,
            color: colors.TEXT_MAIN_COLOR,
            textDecorationLine: 'underline',
        },
        timeText: {
            marginLeft: responsive(10),
        },
    });

export default PhoneVerification;
