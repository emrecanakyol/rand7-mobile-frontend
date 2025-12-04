import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../utils/colors';
import { responsive } from '../../../utils/responsive';
import { useTranslation } from "react-i18next";
import CButton from '../../../components/CButton';
import CModal from '../../../components/CModal';
import CImage from '../../../components/CImage';
import CText from '../../../components/CText/CText';
import { EMAIL_LOGIN, REGISTER } from '../../../navigators/Stack';

const OnBoardingOne = () => {
    const { t } = useTranslation();
    const navigation: any = useNavigation();
    const { colors } = useTheme();
    const [tosVisible, setTosVisible] = useState(false);
    const [privacyVisible, setPrivacyVisible] = useState(false);
    // const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    // const languageOptions = [
    //     { label: '🇬🇧 English', value: 'en' },
    //     { label: '🇹🇷 Türkçe', value: 'tr' },
    //     { label: '🇩🇪 German', value: 'de' },
    //     { label: '🇸🇦 Arabic', value: 'ar' },
    //     { label: '🇫🇷 French', value: 'fr' },
    //     { label: '🇷🇺 Russian', value: 'ru' },
    //     { label: '🇵🇹 Portuguese', value: 'pt' },
    // ];

    // const handleLanguageChange = async (item: any) => {
    //     setSelectedLanguage(item.value);
    //     await i18n.changeLanguage(item.value);
    //     await AsyncStorage.setItem('appLanguage', item.value);
    // };

    return (
        <View style={{
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
            justifyContent: "space-between",
            paddingHorizontal: responsive(20),
        }}>

            <View style={{
                paddingHorizontal: 20,
            }}>
                <View style={{
                    backgroundColor: colors.LIGHT_PURPLE_COLOR,
                    alignSelf: "flex-start",
                    borderRadius: 140,
                    padding: 10,
                    marginBottom: -40,
                    marginTop: 40,
                }}>
                    <CImage
                        imgSource={{ uri: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&q=80" }}
                        width={140}
                        height={140}
                        imageBorderRadius={140}
                    />
                </View>
                <View style={{
                    backgroundColor: colors.PINK_COLOR,
                    alignSelf: "flex-end",
                    borderRadius: 140,
                    padding: 20,
                }}>
                    <CImage
                        imgSource={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80' }}
                        width={140}
                        height={140}
                        imageBorderRadius={140}
                    />
                </View>
            </View>

            <View>
                <CText
                    style={{
                        textAlign: "center",
                        fontSize: 28,
                        color: colors.TEXT_MAIN_COLOR,
                        fontWeight: "800",
                        lineHeight: 34,
                        marginBottom: 5,
                    }}
                >
                    {t('onboarding_title')}
                </CText>
                <CText
                    style={{
                        fontSize: 14,
                        color: '#6B6B6B',
                        textAlign: 'center',
                    }}>
                    {t('onboarding_subtitle')}
                </CText>
            </View>

            <View>
                <View style={{ gap: 10 }}>
                    {/* <CDropdown
                        data={languageOptions}
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        placeholder={t('language_selection')}
                        dropdownContainerStyle={{
                            maxHeight: 220,
                        }}
                        dropdownStyle={{
                            marginBottom: 5,
                        }}
                    /> */}
                    <CButton
                        title={t('continue')}
                        onPress={() => navigation.navigate(EMAIL_LOGIN)}
                        borderRadius={28}
                    />

                    <CButton
                        title={t('register')}
                        onPress={() => navigation.navigate(REGISTER)}
                        borderRadius={28}
                        backgroundColor={colors.LIGHT_PINK}
                        textColor={colors.TEXT_MAIN_COLOR}
                    />
                </View>

                <View style={{
                    marginVertical: 30,
                }}>
                    <CText style={{
                        textAlign: 'center',
                        fontSize: 13,
                        color: colors.DARK_GRAY,
                        lineHeight: responsive(18),
                    }}>
                        {t("tos_text")}{' '}
                        <CText
                            onPress={() => setTosVisible(true)}
                            style={{
                                fontSize: 13,
                                fontWeight: '700',
                                color: colors.TEXT_MAIN_COLOR,
                            }}
                        >
                            {t("tos_link")}
                        </CText>{' '}
                        ve{' '}
                        <CText
                            onPress={() => setPrivacyVisible(true)}
                            style={{
                                fontSize: 13,
                                fontWeight: '700',
                                color: colors.TEXT_MAIN_COLOR,
                            }}
                        >
                            {t("privacy_link")}
                        </CText>{' '}
                        {t("tos_accept_text")}
                    </CText>
                </View>
            </View>


            {/* GENEL KULLANIM KOŞULLARI - YARIM EKRAN */}
            <CModal
                visible={tosVisible}
                onClose={() => setTosVisible(false)}
                modalTitle={'Genel Kullanım Koşulları'}
            >
                <View>
                    <Text>
                        Buraya kullanım koşullarınızın metnini ekleyin. Uygulamanın kullanımına ilişkin hükümler,
                        kullanıcı yükümlülükleri, hesap güvenliği, içerik politikası ve sonlandırma koşulları gibi
                        maddeleri listeleyin. Metni dilediğiniz kadar uzun tutabilirsiniz.
                    </Text>
                </View>
            </CModal>

            {/* GİZLİLİK POLİTİKASI - YARIM EKRAN */}
            <CModal
                visible={privacyVisible}
                onClose={() => setPrivacyVisible(false)}
                modalTitle={'Gizlilik Politikası'}
            >
                <View>
                    <Text>
                        Buraya gizlilik politikanızın metnini ekleyin. Hangi verileri topladığınız, kullanım amaçları,
                        saklama süreleri, üçüncü taraflarla paylaşım, çerezler ve kullanıcı haklarına ilişkin açıklamaları
                        net ve anlaşılır şekilde belirtin.
                    </Text>
                </View>
            </CModal>
        </View>
    );
};

export default OnBoardingOne;
