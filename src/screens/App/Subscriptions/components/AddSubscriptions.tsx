import React from 'react';
import { Button, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import CBackButton from '../../../../components/CBackButton';
import { ToastError, ToastSuccess } from '../../../../utils/toast';

//dilleri tek butonla kaydet
const SaveEnPlansButton = () => {

    const trPlans = [
        {
            id: 'premium-trial-membership-1monthly',
            title: "Deneme 1 Ay",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Reklamsız",
                "Sınırsız Kullanım",
            ],
            isActive: false,
        },
        {
            id: 'premium-trial-membership-3monthly',
            title: "Deneme 3 Ay",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Reklamsız",
                "Sınırsız Kullanım",
            ],
            isActive: false,
        },
        {
            id: "premium-1weekly",
            title: "Premium 1 Hafta",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Reklamsız",
                "Sınırsız Kullanım",
            ],
            isActive: true,
        }, {
            id: 'premium-1monthly',
            title: "Premium 1 Ay",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Reklamsız",
                "Sınırsız Kullanım",
            ],
            isActive: true,
        },
        {
            id: 'premium-3monthly',
            title: "Premium 3 Ay",
            label: "",
            save: "%30 Tasarruf",
            oldPrice: '',
            trial: [
                "Reklamsız",
                "Sınırsız Kullanım",
            ],
            isActive: true,
        },
        {
            id: 'premium-12monthly',
            title: "Premium 12 Ay",
            label: "EN AVANTAJLI",
            save: "%50 Tasarruf",
            oldPrice: '',
            trial: [
                "Reklamsız",
                "Sınırsız Kullanım",
            ],
            isActive: true,
        },
    ];

    const enPlans = [
        {
            id: 'premium-trial-membership-1monthly',
            title: "Trial 1 Month",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Ad-free",
                "Unlimited Usage",
            ],
            isActive: false,
        },
        {
            id: 'premium-trial-membership-3monthly',
            title: "Trial 3 Months",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Ad-free",
                "Unlimited Usage",
            ],
            isActive: false,
        },
        {
            id: "premium-1weekly",
            title: "Premium 1 Week",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Ad-free",
                "Unlimited Usage",
            ],
            isActive: true,
        }, {
            id: 'premium-1monthly',
            title: "Premium 1 Month",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Ad-free",
                "Unlimited Usage",
            ],
            isActive: true,
        },
        {
            id: 'premium-3monthly',
            title: "Premium 3 Months",
            label: "",
            save: "Save 30%",
            oldPrice: '',
            trial: [
                "Ad-free",
                "Unlimited Usage",
            ],
            isActive: true,
        },
        {
            id: 'premium-12monthly',
            title: "Premium 12 Months",
            label: "BEST VALUE",
            save: "Save 50%",
            oldPrice: '',
            trial: [
                "Ad-free",
                "Unlimited Usage",
            ],
            isActive: true,
        },
    ];

    const arPlans = [
        {
            id: 'premium-trial-membership-1monthly',
            title: "تجربة شهر واحد",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "بدون إعلانات",
                "استخدام غير محدود",
            ],
            isActive: false,
        },
        {
            id: 'premium-trial-membership-3monthly',
            title: "تجربة 3 أشهر",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "بدون إعلانات",
                "استخدام غير محدود",
            ],
            isActive: false,
        },
        {
            id: "premium-1weekly",
            title: "بريميوم 1 أسبوع",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "بدون إعلانات",
                "استخدام غير محدود",
            ],
            isActive: true,
        }, {
            id: 'premium-1monthly',
            title: "بريميوم شهر واحد",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "بدون إعلانات",
                "استخدام غير محدود",
            ],
            isActive: true,
        },
        {
            id: 'premium-3monthly',
            title: "بريميوم 3 أشهر",
            label: "",
            save: "وفر 30%",
            oldPrice: '',
            trial: [
                "بدون إعلانات",
                "استخدام غير محدود",
            ],
            isActive: true,
        },
        {
            id: 'premium-12monthly',
            title: "بريميوم 12 شهرًا",
            label: "الأفضل قيمة",
            save: "وفر 50%",
            oldPrice: '',
            trial: [
                "بدون إعلانات",
                "استخدام غير محدود",
            ],
            isActive: true,
        },
    ];

    const dePlans = [
        {
            id: 'premium-trial-membership-1monthly',
            title: "Test 1 Monat",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Werbefrei",
                "Unbegrenzte Nutzung",
            ],
            isActive: false,
        },
        {
            id: 'premium-trial-membership-3monthly',
            title: "Test 3 Monate",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Werbefrei",
                "Unbegrenzte Nutzung",
            ],
            isActive: false,
        },
        {
            id: "premium-1weekly",
            title: "Premium 1 Woche",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Werbefrei",
                "Unbegrenzte Nutzung",
            ],
            isActive: true,
        }, {
            id: 'premium-1monthly',
            title: "Premium 1 Monat",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Werbefrei",
                "Unbegrenzte Nutzung",
            ],
            isActive: true,
        },
        {
            id: 'premium-3monthly',
            title: "Premium 3 Monate",
            label: "",
            save: "30% Sparen",
            oldPrice: '',
            trial: [
                "Werbefrei",
                "Unbegrenzte Nutzung",
            ],
            isActive: true,
        },
        {
            id: 'premium-12monthly',
            title: "Premium 12 Monate",
            label: "BESTER WERT",
            save: "50% Sparen",
            oldPrice: '',
            trial: [
                "Werbefrei",
                "Unbegrenzte Nutzung",
            ],
            isActive: true,
        },
    ];

    const frPlans = [
        {
            id: 'premium-trial-membership-1monthly',
            title: "Essai 1 Mois",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Sans publicité",
                "Utilisation illimitée",
            ],
            isActive: false,
        },
        {
            id: 'premium-trial-membership-3monthly',
            title: "Essai 3 Mois",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Sans publicité",
                "Utilisation illimitée",
            ],
            isActive: false,
        },
        {
            id: "premium-1weekly",
            title: "Premium 1 Semaine",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Sans publicité",
                "Utilisation illimitée",
            ],
            isActive: true,
        }, {
            id: 'premium-1monthly',
            title: "Premium 1 Mois",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Sans publicité",
                "Utilisation illimitée",
            ],
            isActive: true,
        },
        {
            id: 'premium-3monthly',
            title: "Premium 3 Mois",
            label: "",
            save: "Économisez 30%",
            oldPrice: '',
            trial: [
                "Sans publicité",
                "Utilisation illimitée",
            ],
            isActive: true,
        },
        {
            id: 'premium-12monthly',
            title: "Premium 12 Mois",
            label: "MEILLEUR DEAL",
            save: "Économisez 50%",
            oldPrice: '',
            trial: [
                "Sans publicité",
                "Utilisation illimitée",
            ],
            isActive: true,
        },
    ];

    const ptPlans = [
        {
            id: 'premium-trial-membership-1monthly',
            title: "Teste 1 Mês",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Sem anúncios",
                "Uso ilimitado",
            ],
            isActive: false,
        },
        {
            id: 'premium-trial-membership-3monthly',
            title: "Teste 3 Meses",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Sem anúncios",
                "Uso ilimitado",
            ],
            isActive: false,
        },
        {
            id: "premium-1weekly",
            title: "Premium 1 Semana",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Sem anúncios",
                "Uso ilimitado",
            ],
            isActive: true,
        }, {
            id: 'premium-1monthly',
            title: "Premium 1 Mês",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Sem anúncios",
                "Uso ilimitado",
            ],
            isActive: true,
        },
        {
            id: 'premium-3monthly',
            title: "Premium 3 Meses",
            label: "",
            save: "Economize 30%",
            oldPrice: '',
            trial: [
                "Sem anúncios",
                "Uso ilimitado",
            ],
            isActive: true,
        },
        {
            id: 'premium-12monthly',
            title: "Premium 12 Meses",
            label: "MELHOR VALOR",
            save: "Economize 50%",
            oldPrice: '',
            trial: [
                "Sem anúncios",
                "Uso ilimitado",
            ],
            isActive: true,
        },
    ];

    const ruPlans = [
        {
            id: 'premium-trial-membership-1monthly',
            title: "Пробный 1 месяц",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Без рекламы",
                "Неограниченное использование",
            ],
            isActive: false,
        },
        {
            id: 'premium-trial-membership-3monthly',
            title: "Пробный 3 месяца",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Без рекламы",
                "Неограниченное использование",
            ],
            isActive: false,
        },
        {
            id: "premium-1weekly",
            title: "Премиум 1 неделя",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Без рекламы",
                "Неограниченное использование",
            ],
            isActive: true,
        }, {
            id: 'premium-1monthly',
            title: "Премиум 1 месяц",
            label: "",
            save: "",
            oldPrice: '',
            trial: [
                "Без рекламы",
                "Неограниченное использование",
            ],
            isActive: true,
        },
        {
            id: 'premium-3monthly',
            title: "Премиум 3 месяца",
            label: "",
            save: "Экономия 30%",
            oldPrice: '',
            trial: [
                "Без рекламы",
                "Неограниченное использование",
            ],
            isActive: true,
        },
        {
            id: 'premium-12monthly',
            title: "Премиум 12 месяцев",
            label: "ЛУЧШАЯ ЦЕНА",
            save: "Экономия 50%",
            oldPrice: '',
            trial: [
                "Без рекламы",
                "Неограниченное использование",
            ],
            isActive: true,
        },
    ];

    const allPlans = {
        tr: trPlans,
        en: enPlans,
        ar: arPlans,
        de: dePlans,
        fr: frPlans,
        pt: ptPlans,
        ru: ruPlans,
    };

    const saveAllPlans = async () => {
        try {
            const savePromises = Object.entries(allPlans).map(async ([langCode, plans]) => {
                const plansObj: Record<string, any> = {};
                plans.forEach(plan => {
                    plansObj[plan.id] = plan;
                });

                await firestore()
                    .collection('i18n')
                    .doc(langCode)
                    .set(plansObj, { merge: true });
            });

            await Promise.all(savePromises);

            ToastSuccess('Başarılı', 'Tüm diller Firestore\'a kaydedildi!');
        } catch (error) {
            console.error('Firestore kaydetme hatası:', error);
            ToastError('Hata', 'Planlar kaydedilirken bir sorun oluştu.');
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 50 }}>
            <CBackButton />
            <Button
                title="Tüm Dilleri Firestore'a Kaydet"
                onPress={saveAllPlans}
            />
        </ScrollView>
    );
};

export default SaveEnPlansButton;
