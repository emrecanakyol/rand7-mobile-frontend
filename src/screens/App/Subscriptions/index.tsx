import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Platform, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { initConnection, getSubscriptions, requestSubscription, purchaseErrorListener, purchaseUpdatedListener, finishTransaction, flushFailedPurchasesCachedAsPendingAndroid, ProductPurchase, validateReceiptIos, getAvailablePurchases, clearProductsIOS, clearTransactionIOS } from 'react-native-iap';
import { ToastError, ToastSuccess } from '../../../utils/toast';
import CText from '../../../components/CText/CText';
import CButton from '../../../components/CButton';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import CImage from '../../../components/CImage';
import images from '../../../assets/image/images';
import { useTranslation } from 'react-i18next';
import firestore from '@react-native-firebase/firestore';
import auth from "@react-native-firebase/auth";
import { sendAdminNotification } from '../../../constants/Notifications';
import CLoading from '../../../components/CLoading';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { fetchPremiumDataList } from '../../../store/services/premiumDataService';

interface PricingPhase {
    billingCycleCount: number;
    billingPeriod: string;
    formattedPrice: string;
    priceAmountMicros: string;
    priceCurrencyCode: string;
    recurrenceMode: number;
}

interface PricingPhases {
    pricingPhaseList: PricingPhase[];
}

interface SubscriptionOfferDetail {
    basePlanId: string;
    offerId: string | null;
    offerTags: string[];
    offerToken: string;
    pricingPhases: PricingPhases;
}

interface Product {
    description: string;
    name: string;
    platform: string;
    productId: any;
    productType: string;
    subscriptionOfferDetails: SubscriptionOfferDetail[];
    title: string;
}

// Google Play console ve Apple Developerdan gelen bilgiler haricinde kendimizin özel düzenleyeceği plan bilgileridir. Çeviri de uygulanabilir.
const GOOGLE_SUBSCRIPTION_SUBSCRIPTION_ID = ['com.remindernotifications.premium']; // buraya groupId geliyor.
const APPLE_SUBSCRIPTION_PRODUCT_ID = ['premium1weekly', 'premium1monthly', 'premium3monthly', 'premium12monthly']; // buraya direk abonelik id geliyor.

const Subscriptions = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { width, height } = Dimensions.get('window');
    const dispatch = useDispatch<AppDispatch>();
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
    const handledPurchaseTokens = useRef<Set<string>>(new Set());
    const selectedPlanRef = useRef<string>("");
    const [isWeeklyPlanEnabled, setIsWeeklyPlanEnabled] = useState(false);

    // denemek için 1 haftalık 1 tl olan paketi ekledik. Geçici olarak ekledik.
    const fetchPlanStatus = async () => {
        try {
            const statusDoc = await firestore().collection("status").doc("premiumPlans").get();
            const data = statusDoc.data();

            if (data?.premium1weekly === true) {
                setIsWeeklyPlanEnabled(true);
            } else {
                setIsWeeklyPlanEnabled(false);
            }
        } catch (error) {
            console.log("Plan durumu alınırken hata:", error);
        }
    };

    const localPlanInfo = [
        {
            id: 'premium1weekly',
            title: "Deneme Üyeliği",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                t("plan_feature_adfree"),
                t("plan_feature_unlimited"),
            ],
        },
        {
            id: 'premium1monthly',
            title: t("plan_premium_1month"),
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                t("plan_feature_adfree"),
                t("plan_feature_unlimited"),
            ],
        },
        {
            id: 'premium3monthly',
            title: t("plan_premium_3month"),
            label: "",
            save: t("plan_save_1"),
            oldPrice: '',
            trial: [
                t("plan_feature_adfree"),
                t("plan_feature_unlimited"),
            ],
        },
        {
            id: 'premium12monthly',
            title: t("plan_premium_12month"),
            label: t("plan_most_popular"),
            save: t("plan_save_2"),
            oldPrice: '',
            trial: [
                t("plan_feature_adfree"),
                t("plan_feature_unlimited"),
            ],
        }
    ];

    // IAP ile bağlantı kuruyor. Ekran ilk açıldığında tüm abonelik ürünlerini çekiyor.
    const setupIAP = async () => {
        try {
            setLoading(true);
            await initConnection();
            // console.log('IAP bağlantısı kuruldu');

            const products: any = await getSubscriptions({
                skus: Platform.OS == "android" ? GOOGLE_SUBSCRIPTION_SUBSCRIPTION_ID : APPLE_SUBSCRIPTION_PRODUCT_ID
            });

            if (products.length > 0) {
                setProducts(products);
            }

            if (Platform.OS === 'android') {
                //Android cihazlarda geçmişte başarısız olup sistemde bekleyen ve uygulama tarafından işlenmemiş pending (bekleyen) satın alma işlemlerini temizlemek için kullanılır.
                await flushFailedPurchasesCachedAsPendingAndroid();
            }

        } catch (error) {
            console.log('IAP setup hatası:', error);
            ToastError(t('error'), t('subscriptions_iap_load_error'));
        } finally {
            setLoading(false);
        }
    };

    // Devam et butonuna tıklandığında satın alma işlemini başlatır.
    const handlePurchase = async () => {
        const user = auth().currentUser;
        if (!user) {
            ToastError(t('error'), t('subscriptions_login_required'));
            return;
        }

        if (!products) {
            ToastError(t('error'), t('subscriptions_not_found'));
            return;
        }

        //Hangi planı seçtiyse, o planın ID'sini al
        const selectedProduct = products.find(p =>
            Platform.OS === 'android'
                ? p.subscriptionOfferDetails?.some(plan => plan.basePlanId === selectedPlan)
                : p.productId === selectedPlan
        );

        const selectedOffer: any = Platform.OS === 'android'
            ? selectedProduct?.subscriptionOfferDetails.find(plan => plan.basePlanId === selectedPlan)
            : null;

        if (!selectedProduct || (Platform.OS === 'android' && !selectedOffer)) {
            ToastError(t('error'), t('subscriptions_no_plan_selected'));
            return;
        }

        try {
            setProductLoading(true);
            if (Platform.OS === 'android') {
                await requestSubscription({
                    sku: selectedProduct.productId,
                    subscriptionOffers: [
                        {
                            sku: selectedProduct.productId,
                            offerToken: selectedOffer.offerToken,
                        },
                    ],
                });
            } else if (Platform.OS === 'ios') {
                await requestSubscription({ sku: selectedPlan });
            }
        } catch (error) {
            console.log('Satın alma hatası detay:', error);
        } finally {
            setProductLoading(false);
        }
    };

    const handleClose = () => {
        navigation.goBack();
    };

    const openPrivacyPolicy = () => {
        Linking.openURL("https://emrecanakyol.github.io/app-privacy-policy/");
    };

    const openTermsOfUse = () => {
        Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/");
    };

    // selectedPlan seçim her değiştiğinde ref'i güncelle
    useEffect(() => {
        selectedPlanRef.current = selectedPlan;
    }, [selectedPlan]);

    // Satın almayı başlattıktan sonraki adımları kontrol ediyoruz.
    useEffect(() => {
        setupIAP();
        fetchPlanStatus();

        // Varsayılan olarak 12 aylık paketi seçiyoruz
        const defaultPlan = localPlanInfo.find(plan => plan.id === 'premium12monthly');
        if (defaultPlan) {
            setSelectedPlan(defaultPlan.id);
        }

        const purchaseErrorSub = purchaseErrorListener(error => {
            console.log('Satın alma hatası:', error);
        });

        const purchaseUpdateSub = purchaseUpdatedListener(async (purchase: ProductPurchase) => {
            // console.log("purchase tetiklendi ->", purchase)

            // hem android hemde ios satın alma başlatıldığında 1 kere render edilsin diye eklendi.
            const purchaseToken = Platform.OS === "android" ? purchase.purchaseToken : purchase.transactionReceipt

            if (!purchaseToken) {
                console.log("purchaseToken yok, işlenemez.");
                return;
            }

            if (handledPurchaseTokens.current.has(purchaseToken)) {
                // console.log("Bu satın alma zaten işlendi:", purchaseToken);
                return;
            }

            handledPurchaseTokens.current.add(purchaseToken);
            // console.log("Yeni satın alma:", purchaseToken);

            try {
                setLoading(true);
                // Kullanıcı bilgisi al
                const user = auth().currentUser;
                const userId = user?.uid;

                // Satın alma işlemi başarılı ise transactionReceipt olması şartı
                if (!purchase?.transactionReceipt) {
                    throw new Error("Geçersiz işlem: transactionReceipt yok.");
                }

                let result: any = null;

                // ✅ Android Receipt Doğrulama (backend üzerinden)
                if (Platform.OS === 'android') {
                    const response = await fetch('https://verifygoogleapireceipt-66vu444soa-ew.a.run.app', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            purchaseToken: purchase.purchaseToken,
                            productId: purchase.productId,
                            packageName: 'com.remindernotifications', // ← burayı kendi packageName'inle değiştir
                        }),
                    });

                    result = await response.json();
                    // console.log("Android Google API doğrulama sonucu:", result);

                    if (!result || result.paymentState !== 1) {
                        throw new Error("Android receipt doğrulama başarısız.");
                    }
                }

                // ✅ iOS Receipt Doğrulama
                if (Platform.OS === 'ios') {
                    const receiptBody = {
                        'receipt-data': purchase.transactionReceipt,
                        password: 'dfd926fca2154a249731a9671f5afcaa', // App Store Connect > App informations > App-Specific Shared Secret
                    };

                    result = await validateReceiptIos({ receiptBody, isTest: __DEV__ }); // Sandbox için __DEV__
                    // console.log("iOS doğrulama sonucu:", result);

                    if (result?.status !== 0) {
                        throw new Error("iOS receipt doğrulama başarısız.");
                    }
                }

                // Satın alma ve doğrulama işlemlerini yaptıktan sonra Firestore'a kaydetmek için firebase functions gönderiyoruz.
                await fetch('https://savefirestorepurchaseandresult-66vu444soa-ew.a.run.app', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        purchase: purchase,    // purchase objesi
                        result: result,        // doğrulama sonucu (Google/Apple API yanıtı)
                        userId: userId,        // kullanıcı ID'si
                        platform: Platform.OS === "android" ? "android" : "ios",
                        selectedPlan: selectedPlanRef.current,
                    }),
                });

                // Satın alma işlemini tamamla
                await finishTransaction({ purchase, isConsumable: false });
                await sendAdminNotification("🎉 Yeni Abonelik !", `${selectedPlanRef.current}`);
                ToastSuccess(t('success'), t('subscriptions_premium_activated'));
                await dispatch(fetchPremiumDataList());  // Premium localde uygulamada aktifleşmesi için premium bilgilerini tekrar çek
                setTimeout(() => {
                    navigation.goBack();
                }, 1200);

            } catch (error: any) {
                console.log("Doğrulama/kayıt hatası:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => {
            purchaseErrorSub.remove();
            purchaseUpdateSub.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <CLoading visible={loading} />
            ) : (
                <ScrollView contentContainerStyle={styles.inContainer}>
                    {/* Header */}
                    <View style={styles.logoContainer}>

                        <View style={styles.logoInContainer}>
                            <CImage
                                imgSource={images.logoBlack}
                                width={isTablet ? responsive(30) : responsive(40)}
                                height={isTablet ? responsive(30) : responsive(40)}
                                borderRadius={responsive(10)}
                                imageBorderRadius={responsive(10)}
                                disablePress={true}
                            />
                            <View>
                                <CText style={styles.logoTitle}>Reminder</CText>
                                <CText style={styles.logoTitle}>Notifications</CText>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Entypo name="cross" size={isTablet ? 30 : 20} color={colors.WHITE_COLOR} />
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <CText style={styles.title}>{t('subscriptions_choose_plan')}</CText>
                    {/* <CText style={styles.subtitle}>{t('subscriptions_enjoy_unlimited')}</CText>
                    <CText style={styles.desc}>{t('subscriptions_premium_desc')}</CText> */}
                    <CText style={styles.desc}>{t('subscriptions_enjoy_unlimited')}</CText>

                    {/* Product */}
                    <View style={styles.plansWrapper}>
                        {products.length > 0 &&
                            localPlanInfo
                                .filter(plan => {
                                    // Eğer plan ID'si premium1weekly ise, kontrol yap
                                    if (plan.id === 'premium1weekly') {
                                        return isWeeklyPlanEnabled;
                                    }
                                    return true; // diğer tüm planları göster
                                })
                                .map((localPlan: any) => {
                                    const productMatch: any = Platform.OS === 'android'
                                        ? products.find(p =>
                                            p.subscriptionOfferDetails?.some(o => o.basePlanId === localPlan.id)
                                        )
                                        : products.find(p => p.productId === localPlan.id);

                                    if (!productMatch) return null;

                                    const offer = Platform.OS === 'android'
                                        ? productMatch.subscriptionOfferDetails.find((o: any) => o.basePlanId === localPlan.id)
                                        : { pricingPhases: { pricingPhaseList: [{ formattedPrice: productMatch?.localizedPrice }] } };

                                    if (!offer) return null;

                                    const pricing = offer.pricingPhases.pricingPhaseList[0];
                                    const isSelected = selectedPlan === localPlan.id;

                                    return (
                                        <TouchableOpacity
                                            key={localPlan.id}
                                            style={[styles.planCard, isSelected && styles.planCardSelected]}
                                            activeOpacity={0.9}
                                            onPress={() => setSelectedPlan(localPlan.id)}
                                        >
                                            <View style={styles.planHeader}>
                                                <CText style={styles.planTitle}>{localPlan.title}</CText>
                                                {localPlan.label ? (
                                                    <View style={styles.planLabel}>
                                                        <CText style={styles.planLabelText}>{localPlan.label}</CText>
                                                    </View>
                                                ) : null}
                                                {isSelected && (
                                                    <View style={styles.checkCircle}>
                                                        <Entypo name="check" size={isTablet ? 28 : 14} color="#fff" />
                                                    </View>
                                                )}
                                            </View>

                                            <View style={styles.planDetails}>
                                                <View
                                                    style={{ marginTop: responsive(25) }}
                                                >
                                                    {localPlan.trial.map((text: any, i: any) => (
                                                        <CText style={styles.planTrial} key={i}>{text}</CText>
                                                    ))}
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    {/* <CText style={styles.planOldPrice}>{plan.oldPrice}</CText> */}
                                                    <CText style={styles.planSave}>{localPlan.save}</CText>
                                                    <CText style={styles.planPrice}>{pricing.formattedPrice}</CText>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                    </View>

                    {/* Info */}
                    {Platform.OS === "android" ? (
                        <CText style={styles.infoText}>
                            {t('google_play_info_text')}
                        </CText>
                    ) : (
                        <CText style={styles.infoText}>
                            {t('apple_store_info_text')}
                        </CText>
                    )}

                    <CButton
                        title={t('continue')}
                        onPress={handlePurchase}
                        backgroundColor={colors.ORANGE_COLOR}
                        borderRadius={responsive(30)}
                        textColor='#fff'
                        disabled={!selectedPlan}
                        loading={productLoading}
                    />

                    {/* <CButton
                        title={"Plan Ekle"}
                        onPress={() => navigation.navigate(ADD_SUBSCRIPTONS)}
                        backgroundColor={colors.BLUE_COLOR}
                        borderRadius={responsive(30)}
                        textColor='#fff'
                    /> */}

                    <View style={styles.infoText2Container}>
                        <TouchableOpacity onPress={openPrivacyPolicy}>
                            <CText style={styles.infoText2}>
                                {t('privacy_policy_button')}
                            </CText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openTermsOfUse}>
                            <CText style={styles.infoText2}>
                                {t('terms_of_use_button')}
                            </CText>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            )}
        </View>
    )
}

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        inContainer: {
            padding: isTablet ? responsive(20) : responsive(20),
            marginTop: responsive(10),
        },
        logoInContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: responsive(10),
        },
        logoContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: responsive(18),
        },
        logoTitle: {
            fontWeight: "600",
            color: colors.BLACK_COLOR,
        },
        closeButton: {
            backgroundColor: colors.BLACK_COLOR,
            borderRadius: responsive(50),
            padding: responsive(2),
        },
        title: {
            fontSize: isTablet ? 32 : 22,
            fontWeight: '700',
            color: colors.BLACK_COLOR,
            marginTop: isTablet ? 0 : responsive(14),
        },
        subtitle: {
            fontSize: isTablet ? 24 : 14,
            fontWeight: '600',
            color: colors.BLACK_COLOR,
            marginVertical: responsive(8),
        },
        desc: {
            fontSize: isTablet ? 22 : 14,
            color: colors.GRAY_COLOR,
            marginTop: responsive(5),
        },
        plansWrapper: {
            marginTop: isTablet ? responsive(12) : responsive(20),
            marginBottom: isTablet ? responsive(2) : responsive(5),
        },
        planCard: {
            backgroundColor: '#2D1B0F',
            borderRadius: responsive(14),
            padding: responsive(16),
            marginBottom: responsive(12),
            borderWidth: responsive(2),
            borderColor: 'transparent',
            minHeight: isTablet ? responsive(90) : responsive(125),
            height: "auto"
        },
        planCardSelected: {
            borderColor: colors.ORANGE_COLOR,
            // shadowColor:  colors.ORANGE_COLOR,
            // shadowOpacity: 0.2,
            // shadowRadius: 8,
            // elevation: 4,
        },
        planHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: responsive(10),
            // marginBottom: responsive(8),
        },
        planTitle: {
            color: '#fff',
            fontWeight: '700',
            fontSize: isTablet ? 26 : 20,
        },
        planLabel: {
            borderRadius: responsive(8),
            paddingHorizontal: responsive(8),
            paddingVertical: responsive(2),
            backgroundColor: colors.ORANGE_COLOR,
        },
        planLabelText: {
            color: '#fff',
            fontWeight: '700',
            fontSize: isTablet ? 22 : 12,
        },
        checkCircle: {
            marginLeft: 'auto',
            backgroundColor: colors.ORANGE_COLOR,
            borderRadius: responsive(28),
            width: isTablet ? responsive(18) : responsive(20),
            height: isTablet ? responsive(18) : responsive(20),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: responsive(4),
        },
        planDetails: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        planSave: {
            color: colors.ORANGE_COLOR2,
            fontWeight: '600',
            fontSize: isTablet ? 23 : 13,
        },
        planTrial: {
            color: "#F2F2F7",
            fontSize: isTablet ? 22 : 12,
            marginTop: responsive(4),
        },
        planOldPrice: {
            color: '#fff',
            fontSize: isTablet ? 22 : 12,
            textDecorationLine: 'line-through',
            textAlign: 'right',
        },
        planPrice: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: isTablet ? 30 : 20,
            textAlign: 'right',
        },
        infoText: {
            color: colors.GRAY_COLOR,
            fontSize: isTablet ? 22 : 14,
        },
        infoText2Container: {
            flexDirection: "row",
            marginBottom: responsive(100),
            gap: responsive(10),
            justifyContent: "center",
        },
        infoText2: {
            color: colors.GRAY_COLOR,
            fontSize: isTablet ? 22 : 14,
            fontWeight: "bold",
        }
    })

export default Subscriptions;
