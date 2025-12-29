import React from 'react';
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

    return (
        <CModal
            visible={visible}
            onClose={onClose}
            modalTitle="Hoş Geldin 👋✨"
            justifyContent="center"
            width="90%"
            height="auto"
            paddingTop={0}
            borderBottomLeftRadius={30}
            borderBottomRightRadius={30}
        >
            <View style={{ gap: responsive(14) }}>
                <CText
                    style={{
                        fontSize: 16,
                        color: colors.TEXT_MAIN_COLOR,
                        lineHeight: responsive(20),
                    }}
                >
                    Merhabalar 😊{'\n'}{'\n'}Ekiplerimiz uygulamayı sürekli geliştiriyor.{"\n"}Herhangi bir sorun yaşarsanız lütfen{"\n"}
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
                    olacağımıza söz veriyoruz.
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
                        title="Tamam 👍"
                        onPress={onClose}
                        borderRadius={28}
                    />
                </View>
            </View>
        </CModal>
    );
};

export default WelcomeModal;
