import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
                    ✨Random 7•7•7✨{"\n"}{"\n"}{t('onboarding_title')}
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
                <ScrollView>
                    <Text>
                        1) Tanımlar

                        Rand7 (“Uygulama”), mobil ve web platformlarında kullanıcıların anonim olarak eşleşmesini ve sohbet etmesini sağlayan bir hizmettir.
                        Kullanıcı, Uygulama’ya erişim sağlayan ve kayıt olan gerçek kişidir.
                        Bu Kullanım Şartları (“Şartlar”), Rand7 ile kullanıcı arasındaki hukuki ilişkiyi belirler.

                        2) Uygulamanın Kapsamı

                        Rand7, kullanıcıların anonim profiller üzerinden eşleşmesine ve 7 dakikalık süreli sohbetler ile tanışmasına imkân sağlar. Bazı özellikler ücretsiz, bazı özellikler ise premium abonelik gerektirebilir.

                        3) Şartların Kabulü

                        Uygulamayı kullanarak, bu Şartları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş sayılırsınız.

                        4) Yaş ve Kayıt Şartı

                        Rand7 yalnızca 18 yaş ve üzeri kişilerin kullanımına açıktır. Kayıt sırasında verdiğiniz bilgilerin doğru ve güncel olmasından ve birden fazla hesap açmaktan siz sorumlusunuz.

                        5) Kullanıcı Sorumlulukları

                        Kullanıcılar, hizmeti kullanırken:

                        Doğru ve güncel bilgi vermek,

                        Başkalarını rahatsız edici davranışlarda bulunmamak,

                        Yasa dışı veya uygunsuz içerik paylaşmamak,

                        Başka kullanıcıların haklarına ve gizliliğine saygı göstermek zorundadır.

                        6) Mesajlaşma ve İçerikten Sorumluluk

                        Uygulamadaki mesajlaşma, paylaşımlar ve görüşmeler tamamen kullanıcıların sorumluluğundadır. Rand7:

                        Kullanıcıların sohbetlerinden,

                        Paylaşılan içeriklerden,

                        Kullanıcıların aldığı kararlardan,

                        Uygulama içi/gerçek hayatta gerçekleşen buluşmalardan

                        hiçbir şekilde sorumlu tutulamaz.
                        Bu sorumluluk sınırı, teknik arızalar, algoritma önerileri ve dış etkenler için de geçerlidir.

                        7) Davranış Kuralları

                        Uygulama’da:

                        Hakaret, taciz, tehdit, nefret söylemi gibi davranışlar,

                        Pornografik veya insan onurunu zedeleyen içerikler,

                        Başkalarının kişisel verilerini izinsiz paylaşmak,

                        Dolandırıcılık ve dolandırıcılık amaçlı içerikler,

                        Uygulamanın normal kullanımını engelleyecek bot/otomasyon kullanımı
                        gibi davranışlar yasaktır.

                        Rand7 bu tür davranışları tespit ettiği takdirde kullanıcı hesabını uyarı, askıya alma veya kapatma haklarını saklı tutar.

                        8) Kullanıcının Sorumluluğu

                        Uygulama içerisindeki tüm etkileşimler, mesajlar, paylaşımlar ve görüşmeler tamamen kullanıcıların kendi sorumluluğundadır. Rand7; kullanıcıların yaptığı konuşmalar, paylaştığı içerikler, verdiği bilgiler, aldığı kararlar ve gerçekleştirdiği eylemler nedeniyle doğabilecek doğrudan veya dolaylı hiçbir zarardan sorumlu tutulamaz. Kısaca Rand7 uygulamasını kullanmak tamamen sizin sorumluluğunuzdadır.

                        9) Sorumluluk Sınırı

                        Rand7, aşağıdakilerden dolayı doğrudan, dolaylı, özel veya sonuçsal herhangi bir zarardan sorumlu tutulmaz:

                        Kullanıcı etkileşimleri,

                        Uygulama üzerinden gerçek hayatta yapılan görüşmeler,

                        Kayıt dışı platformlarla iletişim,

                        Bağlantı ve ağ sorunları,

                        Veri kaybı ve üçüncü taraf erişimleri.

                        10) Değişiklik Hakkı

                        Rand7, bu Şartları herhangi bir zamanda uyarı yaparak veya yapmadan güncelleme hakkını saklı tutar. Güncel Şartlar, uygulama içinde ve web sitesinde yayımlanır.

                        11) Şikayet ve Destek

                        Herhangi bir uygunsuz davranış, dolandırıcılık veya sorun durumunda kullanıcılar Uygulama içi bildirim veya destek mekanizması ile Rand7’a bildirimde bulunabilir.

                        12) Yürürlük

                        Bu Şartlar, hizmeti kullanmaya başladığınız anda yürürlüğe girer ve kullanım süresi boyunca geçerlidir.
                    </Text>
                </ScrollView>
            </CModal>

            {/* GİZLİLİK POLİTİKASI - YARIM EKRAN */}
            <CModal
                visible={privacyVisible}
                onClose={() => setPrivacyVisible(false)}
                modalTitle={'Gizlilik Politikası'}
            >
                <ScrollView>
                    <Text>
                        Rand7 (“Uygulama”), kullanıcıların gizliliğini ve kişisel verilerinin korunmasını ciddiye alır. Bu Gizlilik Politikası, Rand7’nin kişisel verilerinizi nasıl topladığını, işlediğini, kullandığını ve paylaştığını açıklar. Uygulamayı kullanarak bu politikayı kabul etmiş sayılırsınız.

                        1. Topladığımız Bilgiler
                        Zorunlu Veriler

                        Aşağıdaki bilgiler, Uygulama’nın temel işlevlerini sağlayabilmek için zorunludur:

                        Kayıt bilgileri (ad, e-posta veya telefon numarası)

                        Doğum tarihi ve yaş doğrulaması

                        Fotoğraflar

                        Teknik cihaz verileri (cihaz modeli, işletim sistemi vb.)

                        Uygulama kullanım verileri (bağlantı tarihleri, profil etkileşimleri)

                        Bu veriler Uygulama’nın çalışması için gereklidir ve bunları sağlamadan hizmetten tam olarak faydalanamazsınız.
                        support.happn.fr

                        2. Konum Verileri

                        Rand7 bazı özelliklerinde (örneğin çevrenizdeki kullanıcıları önerme) konum verilerini toplar.

                        Konum verileri sadece sizin açık rızanızla toplanır.

                        Konum verileri diğer kullanıcılara kesin koordinat olarak gösterilmez; yalnızca genel çevre veya mesafe bilgisi sunulur.

                        Konum servisini kapatmanız halinde bu özellikler sınırlı hale gelir.
                        support.happn.fr

                        3. Profil ve Kullanıcı Tercihleri

                        Kullanıcı profiline eklediğiniz tüm bilgiler isteğe bağlıdır ve tamamen sizin sorumluluğunuzdadır:

                        İlgi alanları, hobiler, yaşam tarzı tercihleri

                        Kısa biyografi veya açıklamalar

                        Arama tercihleri (yaş aralığı, cinsiyet vb.)

                        Bu bilgiler profiliniz üzerinde diğer kullanıcılar tarafından görülebilir olur.
                        support.happn.fr

                        4. Mesajlar ve Etkileşimler

                        Uygulamadaki sohbetler (yazılı mesajlar, sesli mesajlar, görüntülü aramalar):

                        Gizlidir ve yalnızca mesajlaşan taraflar tarafından görülebilir.

                        Rand7 yetkili personeli bu mesajlara erişmez ve içeriklerini görmez.

                        Hukuki zorunluluk halleri (yasal talepler) dışında üçüncü taraflarla paylaşılmaz.
                        support.happn.fr

                        5. Otomatik Toplanan Veriler

                        Uygulama kullanımına ilişkin veriler arka planda otomatik olarak toplanabilir:

                        Bağlantı ve kullanım süreleri

                        Etkileşim geçmişi

                        Uygulama içi işlem ve bildirim tercihleri

                        Cihaz IP adresi ve teknik tanımlayıcılar
                        support.happn.fr

                        Bu veriler hizmet kalitesini artırmak, hataları düzeltmek ve deneyimi kişiselleştirmek için kullanılır.

                        6. Verilerin Kullanım Amaçları

                        Toplanan bilgiler aşağıdaki amaçlarla kullanılabilir:

                        Hizmetlerin sunulması ve kullanıcı hesabının yönetimi

                        Arama ve eşleştirme algoritmasının çalıştırılması

                        Bildirim ve müşteri desteği

                        Güvenlik ve dolandırıcılık önleme

                        Pazarlama, analiz ve performans iyileştirme (izniniz varsa)

                        7. Verilerin Paylaşımı

                        Rand7; verilerinizi üçüncü taraflarla sadece yasal zorunluluk olduğunda, teknik hizmet sağlayıcılar veya analiz araçları ile paylaşabilir. Bunun dışındaki durumlarda verileriniz satılmaz veya izniniz olmadan üçüncü tarafa devredilmez.

                        8. Çerezler ve Teknolojiler

                        Uygulama, web sürümlerinde çerezler ve benzeri teknolojiler kullanabilir.
                        Bu teknolojiler; kullanıcı deneyimini iyileştirme, analiz yapma ve reklam hedefleme gibi amaçlarla kullanılabilir.

                        9. Veri Saklama Süresi

                        Verileriniz, hizmetlerin sunulması için gerekli olduğu sürece tutulur.
                        Profilinizi silme, konum verisi iznini kaldırma veya hesabınızı kapatma gibi taleplerinizde, ilgili veriler belirli sürelerle saklanabilir ya da anonim hâle getirilebilir.

                        10. Haklarınız

                        Kullanıcı olarak aşağıdaki haklara sahipsiniz:

                        Kişisel verilerinize erişme

                        Yanlış veya eksik verileri düzeltme

                        Verilerin silinmesini talep etme

                        İşleme sınırı veya itiraz hakkı

                        Rıza geri çekme

                        Bu hakları uygulama içerisinden veya destek e-posta/yardım kanalıyla talep edebilirsiniz.

                        11. Güvenlik

                        Rand7, verilerinizin güvenliğini sağlamak adına uygun teknik ve organizasyonel önlemleri uygular. Ancak hiçbir sistem %100 güvenli değildir ve veri güvenliği tamamen garanti edilemez.

                        12. Değişiklikler

                        Bu Gizlilik Politikası zaman zaman güncellenebilir. Güncel politika uygulama içi veya web sitesi üzerinden yayımlanacaktır.
                    </Text>
                </ScrollView>
            </CModal>
        </View>
    );
};

export default OnBoardingOne;
