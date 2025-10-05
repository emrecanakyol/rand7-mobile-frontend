import { View, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import DetailHeaders from '../../../components/DetailHeaders';
import { useTheme } from '../../../utils/colors';
import firestore from '@react-native-firebase/firestore';
import CText from '../../../components/CText/CText';
import moment from 'moment';
import CLoading from '../../../components/CLoading';

const AdminPanel = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [loading, setLoading] = useState(true);
    const [visitStats, setVisitStats] = useState({
        today: 0,
        yesterday: 0,
        last7Days: 0,
        thisMonth: 0,
    });

    const fetchVisitStats = async () => {
        try {
            // 📌 1. Öncelikle tarihleri tanımlıyoruz
            const todayDate = moment().format('YYYY-MM-DD');                     // Bugünün tarihi
            const yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD'); // Dünün tarihi
            const sevenDaysAgo = moment().subtract(6, 'days').startOf('day').toDate(); // 6 gün önce saat 00:00
            const monthStart = moment().startOf('month').toDate();                  // Ayın 1'i saat 00:00

            // 📌 2. Bugünün verisini al
            const todayDoc: any = await firestore()
                .collection('adminPanel')
                .doc('userVisits')
                .collection('daily')
                .doc(todayDate)
                .get();

            // Eğer döküman varsa count bilgisini al, yoksa 0 yap
            const todayCount = todayDoc.exists ? todayDoc.data()?.count || 0 : 0;

            // 📌 3. Dünün verisini al
            const yesterdayDoc: any = await firestore()
                .collection('adminPanel')
                .doc('userVisits')
                .collection('daily')
                .doc(yesterdayDate)
                .get();

            // Eğer döküman varsa count bilgisini al, yoksa 0 yap
            const yesterdayCount = yesterdayDoc.exists ? yesterdayDoc.data()?.count || 0 : 0;

            // 📌 4. Son 7 günü çek
            const last7DaysSnapshot = await firestore()
                .collection('adminPanel')
                .doc('userVisits')
                .collection('daily')
                .where('createdAt', '>=', sevenDaysAgo)  // 6 gün önceden bugüne kadar olan veriler
                .get();

            let last7DaysCount = 0;

            // Bu snapshot içindeki tüm dökümanları gez ve count değerlerini topla
            last7DaysSnapshot.forEach(doc => {
                last7DaysCount += doc.data()?.count || 0;
            });

            // 📌 5. Bu ayın verilerini çek
            const thisMonthSnapshot = await firestore()
                .collection('adminPanel')
                .doc('userVisits')
                .collection('daily')
                .where('createdAt', '>=', monthStart)  // Ayın 1'inden bugüne kadar
                .get();

            let thisMonthCount = 0;

            // Snapshot içindeki tüm dökümanları gez ve count değerlerini topla
            thisMonthSnapshot.forEach(doc => {
                thisMonthCount += doc.data()?.count || 0;
            });

            // 📌 6. Hesaplanan tüm verileri state'e kaydet
            setVisitStats({
                today: todayCount,
                yesterday: yesterdayCount,
                last7Days: last7DaysCount,
                thisMonth: thisMonthCount,
            });

        } catch (error) {
            // Eğer herhangi bir hatada log kaydı yap
            console.log('Veri alınırken hata:', error);
        } finally {
            // İşlem bitince loading false yap ki ActivityIndicator kaybolsun
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchVisitStats();
    }, []);

    return (
        <View style={styles.container}>
            <DetailHeaders title={"Admin Panel"} />
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <CLoading visible={loading} />
                ) : (
                    <View>
                        <CText style={styles.title}>Ziyaretci Sayısı</CText>
                        <CText style={styles.text}>Bugün: {visitStats.today}</CText>
                        <CText style={styles.text}>Dün: {visitStats.yesterday}</CText>
                        <CText style={styles.text}>Son 7 Gün: {visitStats.last7Days}</CText>
                        <CText style={styles.text}>Bu Ay: {visitStats.thisMonth}</CText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    content: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.TEXT_MAIN_COLOR,
        marginBottom: 15,
    },
    text: {
        fontSize: 20,
        color: colors.TEXT_MAIN_COLOR,
        marginBottom: 15,
    },
});

export default AdminPanel;
