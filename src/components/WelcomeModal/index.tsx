import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../utils/colors';
import CModal from '../CModal';
import { responsive } from '../../utils/responsive';
import CText from '../CText/CText';
import CButton from '../CButton';

interface WelcomeModalProps {
    visible: boolean;
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
    visible,
    onClose,
}) => {
    const { colors } = useTheme();
    const [secondsLeft, setSecondsLeft] = useState(15);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;

        if (visible) {
            setSecondsLeft(15);

            timer = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [visible]);



    return (
        <CModal
            visible={visible}
            onClose={onClose}
            modalTitle="Hoş Geldiniz 👋"
            justifyContent="center"
            width="90%"
            height="auto"
            paddingTop={0}
            borderBottomLeftRadius={30}
            borderBottomRightRadius={30}
            closeButton={false}
        >
            <View style={{ gap: responsive(14) }}>
                <CText
                    style={{
                        fontSize: 16,
                        color: colors.TEXT_MAIN_COLOR,
                        lineHeight: responsive(20),
                    }}
                >
                    Merhabalar 😊{'\n'}{'\n'}Ekiplerimiz uygulamamızı sürekli geliştiriyor. Daha bir sürü{" "}
                    <CText style={{ fontWeight: '700' }}>
                        ek özellik
                    </CText>{" "}yolda geliyor. 🚀
                </CText>

                <CText
                    style={{
                        fontSize: 16,
                        color: colors.TEXT_MAIN_COLOR,
                        lineHeight: responsive(20),
                    }}
                >
                    Lütfen herhangi bir sorun yaşarsanız{"\n"}
                    <CText style={{ fontWeight: '700' }}>
                        Hesabım &gt; Yardım & Destek
                    </CText>{" "}bölümünden bize bildiriniz.
                </CText>

                <CText
                    style={{
                        fontSize: 16,
                        color: colors.TEXT_MAIN_COLOR,
                        lineHeight: responsive(20),
                    }}
                >
                    Her zaman{' '}
                    <CText style={{ fontWeight: '700' }}>
                        Türkiye’nin en uygun fiyatlı dating uygulaması
                    </CText>{' '}
                    olmaya çalışacağımıza söz veriyoruz.
                </CText>

                <CText
                    style={{
                        fontSize: 16,
                        color: colors.TEXT_MAIN_COLOR,
                    }}
                >
                    Keyifli sohbetler ve iyi eğlenceler dileriz 😍✨
                </CText>

                <View style={{ marginTop: responsive(10) }}>
                    <CButton
                        title={
                            secondsLeft > 0
                                ? `Tamam (${secondsLeft})`
                                : 'Tamam 👍'
                        }
                        onPress={onClose}
                        borderRadius={28}
                        disabled={secondsLeft > 0}
                    />
                </View>

            </View>
        </CModal>
    );
};

export default WelcomeModal;
