import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform, Switch, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ToastError, ToastSuccess } from '../../../../../utils/toast';
import CModal from '../../../../../components/CModal';
import CTextInput from '../../../../../components/CTextInput';
import { responsive } from '../../../../../utils/responsive';
import { useTheme } from '../../../../../utils/colors';
import DateFormatter from '../../../../../components/DateFormatter';
import DatePicker from 'react-native-date-picker';
import CText from '../../../../../components/CText/CText';
import CButton from '../../../../../components/CButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import CPhotosAdd from '../../../../../components/CPhotosAdd';
import images from '../../../../../assets/image/images';
import storage from '@react-native-firebase/storage';
import CDropdown from '../../../../../components/CDropdown';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../../utils/i18n';

interface AddGroupDetailProps {
    visible: boolean;
    onClose: () => void;
    groupId: string;
    fetchNotifications: () => void;
}

// Year options
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 2030 - currentYear + 1 }, (_, i) => ({
    label: (currentYear + i).toString(),
    value: currentYear + i,
}));

const AddGroupDetail: React.FC<AddGroupDetailProps> = ({ visible, onClose, groupId, fetchNotifications }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { t } = useTranslation();

    const [notificationName, setNotificationName] = useState(__DEV__ ? "Emre Canın Doğum Günü" : "");
    const [loading, setLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [repeatOption, setRepeatOption] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [filteredRepeatOptions, setFilteredRepeatOptions] = useState<{ label: string; value: string }[]>([]);
    const [photo, setPhoto] = useState<string>('');

    const dayOptions = [
        { label: t('same_day'), value: '0' },
        { label: t('x_days_ago', { count: 1 }), value: '1' },
        { label: t('x_days_ago', { count: 2 }), value: '2' },
        { label: t('x_days_ago', { count: 3 }), value: '3' },
        { label: t('x_days_ago', { count: 4 }), value: '4' },
        { label: t('x_days_ago', { count: 5 }), value: '5' },
        { label: t('x_days_ago', { count: 6 }), value: '6' },
        { label: t('x_days_ago', { count: 7 }), value: '7' },
        { label: t('x_days_ago', { count: 8 }), value: '8' },
        { label: t('x_days_ago', { count: 9 }), value: '9' },
        { label: t('x_days_ago', { count: 10 }), value: '10' },
        { label: t('x_days_ago', { count: 11 }), value: '11' },
        { label: t('x_days_ago', { count: 12 }), value: '12' },
        { label: t('x_days_ago', { count: 13 }), value: '13' },
        { label: t('x_days_ago', { count: 14 }), value: '14' },
        { label: t('x_days_ago', { count: 15 }), value: '15' },
        { label: t('x_days_ago', { count: 16 }), value: '16' },
        { label: t('x_days_ago', { count: 17 }), value: '17' },
        { label: t('x_days_ago', { count: 18 }), value: '18' },
        { label: t('x_days_ago', { count: 19 }), value: '19' },
        { label: t('x_days_ago', { count: 20 }), value: '20' },
        { label: t('x_days_ago', { count: 21 }), value: '21' },
        { label: t('x_days_ago', { count: 22 }), value: '22' },
        { label: t('x_days_ago', { count: 23 }), value: '23' },
        { label: t('x_days_ago', { count: 24 }), value: '24' },
        { label: t('x_days_ago', { count: 25 }), value: '25' },
        { label: t('x_days_ago', { count: 26 }), value: '26' },
        { label: t('x_days_ago', { count: 27 }), value: '27' },
        { label: t('x_days_ago', { count: 28 }), value: '28' },
        { label: t('x_days_ago', { count: 29 }), value: '29' },
        { label: t('x_days_ago', { count: 30 }), value: '30' },
    ];

    // Day options
    const getAvailableDayOptions = (selectedDate: Date, repeatOption: string) => {
        // Eğer "no" veya "daily" seçildiyse sadece "Aynı Gün"
        if (repeatOption === 'no' || repeatOption === 'daily' || repeatOption === 'weekly') {
            return [{ label: t('same_day'), value: '0' }];
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        const diffDays = Math.max(0, Math.round((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        return dayOptions.slice(0, diffDays + 1);
    };

    // Status toggle
    const toggleActiveStatus = () => {
        setIsActive(!isActive);
    };

    // Date picker açma
    const handleDatePress = () => {
        setIsDatePickerVisible(!isDatePickerVisible);
    };

    // Date picker açma
    const handleTimePress = () => {
        setIsTimePickerVisible(!isTimePickerVisible);
    };

    // Date picker değişikliği
    const handleDateChange = (date: Date) => {
        const newDate = new Date(date);
        setSelectedDate(newDate);
        setSelectedDay('');
    };

    // Time picker değişikliği
    const handleTimeChange = (time: Date) => {
        setSelectedTime(time);
        // selectedDate üzerindeki saat/dakikayı güncelle ki DateFormatter güncellensin
        const updated = new Date(selectedDate);
        updated.setHours(time.getHours());
        updated.setMinutes(time.getMinutes());
        updated.setSeconds(0);
        updated.setMilliseconds(0);
        setSelectedDate(updated);
    };

    // Fotoğrafı Firebase Storage'a yükle
    const uploadPhoto = async () => {
        const userId = auth().currentUser?.uid;
        if (!userId || !photo || photo.startsWith('http')) {
            return photo || '';
        }
        const storageRef = storage().ref(
            `users/group-detail-photos/${userId}/${Date.now()}-${Math.random()}`,
        );
        await storageRef.putFile(photo);
        const downloadURL = await storageRef.getDownloadURL();
        return downloadURL;
    };

    // Notification oluşturma
    const handleCreateNatification = async () => {
        const userId = auth().currentUser?.uid;

        if (!userId || !notificationName || !selectedDate) {
            ToastError('Error', 'Please fill all fields.');
            return;
        }

        try {
            setLoading(true);

            const groupRef = firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .doc(groupId)
                .collection('notifications')
                .doc();

            let photoUrl = '';
            if (photo) {
                photoUrl = await uploadPhoto();
            }

            // Şimdiki zamanın saat ve dakikasını ayarla
            const currentDateTime = new Date();
            currentDateTime.setSeconds(0, 0); // Saniyeyi sıfırla

            // Dakikayı en yakın 15 dakikanın katına yuvarla
            const minutes = currentDateTime.getMinutes();
            const roundedMinutes = Math.ceil(minutes / 15) * 15;
            if (roundedMinutes === 60) {
                currentDateTime.setHours(currentDateTime.getHours() + 1);
                currentDateTime.setMinutes(0);
            } else {
                currentDateTime.setMinutes(roundedMinutes);
            }

            // startDate oluştur (startDate içindeki gün,ay,yıl ile şimdiki zamanın saat ve dakikası birleştiriliyor)
            const startDate = new Date(selectedDate);

            // Eğer "aynı gün" seçildiyse, startDate'i bugünün saat ve dakikasıyla ayarlıyoruz
            if (selectedDay === '0' && repeatOption === 'no') {
                startDate.setHours(selectedDate.getHours());
                startDate.setMinutes(selectedDate.getMinutes());
                startDate.setSeconds(0, 0);
            } else if (selectedDay === '0') {
                startDate.setHours(0, 0);
                startDate.setMinutes(selectedDate.getMinutes());
                startDate.setSeconds(0, 0);
            } else if (parseInt(selectedDay) > 0) {
                startDate.setHours(0, 0);
                startDate.setMinutes(selectedDate.getMinutes());
                startDate.setSeconds(0, 0);
                // selectedDay kadar geriye git
                startDate.setDate(startDate.getDate() - parseInt(selectedDay));
            } else {
                startDate.setHours(currentDateTime.getHours());
                startDate.setMinutes(selectedDate.getMinutes());
                startDate.setSeconds(0, 0);
                // selectedDay kadar geriye git
                startDate.setDate(startDate.getDate() - parseInt(selectedDay));
            }
            // Tarih dizisini oluştur
            const dates = generateRepeatDates(startDate, selectedDate, repeatOption, selectedDay);

            // Saniyeyi ve milisaniyeyi sıfırla
            await groupRef.set({
                userId,
                groupId,
                createdAt: firestore.FieldValue.serverTimestamp(),
                notificationName,
                status: isActive ? true : false,
                selectedDate: new Date(selectedDate.setSeconds(0, 0)),
                startDate: startDate,
                dayBefore: selectedDay,
                repeat: repeatOption,
                repeatDates: dates,
                ...(photoUrl ? { photo: photoUrl } : {}),
            });

            // Reset state after successful creation
            setNotificationName('');
            setPhoto('');
            onClose();
            setIsActive(true);
            setSelectedDay('');
            setSelectedDate(new Date());
            setSelectedTime(new Date());
            fetchNotifications();
            ToastSuccess(t('success'), t('success_notification_message'));
        } catch (error) {
            console.log('Error creating notification: ', error);
            ToastError('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Ekran her açıldığında Dakikayı her zaman 15 dakika ileri al
    const getNextQuarterHour = () => {
        const now = new Date();
        now.setSeconds(0, 0); // Saniyeyi sıfırla

        const minutes = now.getMinutes();
        const remainder = 15 - (minutes % 15);
        now.setMinutes(minutes + remainder);

        return now;
    };

    // firestoreye kaydederken kullanıcının seçtiği tarih ve tekrar seçeneklerine göre tarihleri oluştur
    // Bu fonksiyon, startDate ve selectedDate arasındaki tarihleri oluşturur
    // repeatOption'a göre farklı tekrar seçenekleri uygular
    // Her tarih için { date: Date, status: boolean } şeklinde bir nesne döndürür..
    const generateRepeatDates = (startDate: Date, selectedDate: Date, repeatOption: string, selectedDay: string) => {
        const dates: { date: Date; status: boolean }[] = [];
        let currentDate = new Date(startDate);
        const now = new Date();
        now.setSeconds(0, 0);

        // For longer intervals, ensure we generate a full series leading up to selectedDate
        if (repeatOption === 'daily' || repeatOption === 'weekly' || repeatOption === 'monthly' || repeatOption === 'yearly') {
            // Align to the same time as selectedDate, then step backwards by the interval until not after 'now'

            const dayOffset = parseInt(selectedDay || '0', 10);

            currentDate = new Date(selectedDate);
            currentDate.setDate(currentDate.getDate() - dayOffset);
            currentDate.setSeconds(0, 0);

            while (currentDate > now) {
                if (repeatOption === 'daily') {
                    currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
                } else if (repeatOption === 'weekly') {
                    currentDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
                } else if (repeatOption === 'monthly') {
                    currentDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
                } else if (repeatOption === 'yearly') {
                    currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
                }
            }
        }

        // Repeat seçeneklerine göre tarihleri oluştur
        switch (repeatOption) {
            case 'no':
                // Tek tarih
                dates.push({ date: new Date(currentDate), status: true });
                break;
            case 'hourly':
                // Her saatte bir tarih
                while (currentDate <= selectedDate) {
                    dates.push({ date: new Date(currentDate), status: true });
                    currentDate = new Date(currentDate.setHours(currentDate.getHours() + 1));
                }
                break;
            case 'every3hourly':
                while (currentDate <= selectedDate) {
                    dates.push({ date: new Date(currentDate), status: true });
                    currentDate = new Date(currentDate.setHours(currentDate.getHours() + 3));
                }
                break;
            case 'every6hourly':
                while (currentDate <= selectedDate) {
                    dates.push({ date: new Date(currentDate), status: true });
                    currentDate = new Date(currentDate.setHours(currentDate.getHours() + 6));
                }
                break;
            case 'daily':
                // Her gün bir tarih
                while (currentDate <= selectedDate) {
                    dates.push({ date: new Date(currentDate), status: true });
                    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
                }
                break;
            case 'weekly':
                // Her hafta bir tarih
                while (currentDate <= selectedDate) {
                    dates.push({ date: new Date(currentDate), status: true });
                    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
                }
                break;
            case 'monthly': {
                const dayOfMonth = selectedDate.getDate(); // Örn: 29
                const dayOffset = parseInt(selectedDay || '0', 10); // Örn: 5 gün önce ise 5

                while (currentDate <= selectedDate) {
                    for (let i = dayOffset; i >= 0; i--) {
                        const date = new Date(currentDate);
                        date.setDate(dayOfMonth - i);

                        // Ay kayması kontrolü (örneğin Şubat 30 gibi tarih varsa atla)
                        if (date.getDate() !== (dayOfMonth - i)) continue;

                        // Saatleri ve dakikaları da ayarla
                        date.setHours(selectedDate.getHours());
                        date.setMinutes(selectedDate.getMinutes());
                        date.setSeconds(0, 0);

                        // Tarih, now'dan önceyse ekleme
                        if (date >= now && date <= selectedDate) {
                            dates.push({ date: new Date(date), status: true });
                        }
                    }

                    // Bir sonraki aya geç
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }

                break;
            }
            case 'yearly': {
                const eventMonth = selectedDate.getMonth();
                const eventDay = selectedDate.getDate();
                const dayOffset = parseInt(selectedDay || '0', 10); // Örn: 7 gün öncesi

                while (currentDate <= selectedDate) {
                    for (let i = dayOffset; i >= 0; i--) {
                        const date = new Date(currentDate);
                        date.setMonth(eventMonth);
                        date.setDate(eventDay - i);

                        // Tarih geçerli mi? (ör: 29 Şubat gibi özel durumları atla)
                        if (date.getMonth() !== eventMonth) continue;

                        // Saat ve dakika ayarı
                        date.setHours(selectedDate.getHours());
                        date.setMinutes(selectedDate.getMinutes());
                        date.setSeconds(0, 0);

                        if (date >= now && date <= selectedDate) {
                            dates.push({ date: new Date(date), status: true });
                        }
                    }
                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                }
                break;
            }
            default:
                // Eğer geçerli bir repeatOption yoksa, sadece startDate'i döndür
                dates.push({ date: new Date(currentDate), status: true });
                break;
        }

        return dates;
    };

    // Form validation
    useEffect(() => {
        const isValid =
            notificationName.trim().length > 0 &&
            selectedDate instanceof Date &&
            !isNaN(selectedDate.getTime()) &&
            selectedDay !== '' &&
            repeatOption !== ''
        setIsFormValid(!!isValid);
    }, [notificationName, selectedDate, selectedDay, repeatOption]);

    useEffect(() => {
        if (!visible) return;

        // Modal açıldığında alanları sıfırla
        setNotificationName(__DEV__ ? "Emre Canın Doğum Günü" : "");
        setPhoto('');
        setSelectedDate(getNextQuarterHour());
        setSelectedTime(getNextQuarterHour());
        setSelectedDay('');
        setRepeatOption('');
        setIsActive(true);
        setIsDatePickerVisible(false);
    }, [visible]);

    // Repeat dropdownu seçilen tarihe ve yıla göre düzeltiyor
    useEffect(() => {
        const now = new Date();
        const diffMs = selectedDate.getTime() - now.getTime();
        // const options = [];
        const options = [
            { label: t('no'), value: 'no' } // Bu her zaman ilk seçenek olur
        ];

        if (diffMs > 0) {
            const hour = selectedDate.getHours();
            const diffMinutes = diffMs / (1000 * 60);
            const diffHours = diffMinutes / 60;
            const diffDays = diffHours / 24;
            const diffMonths = diffDays / 30;
            const diffYears = diffDays / 365;
            // Show all eligible repeat options regardless of selectedDay
            if (diffHours >= 1) options.push({ label: t('every_hour'), value: 'hourly' });
            if (diffHours >= 3 && hour % 3 === 0) options.push({ label: t('every_3_hours'), value: 'every3hourly' });
            if (diffHours >= 6 && hour % 6 === 0) options.push({ label: t('every_6_hours'), value: 'every6hourly' });
            if (diffDays >= 1) options.push({ label: t('every_day'), value: 'daily' });
            if (diffDays >= 7) options.push({ label: t('every_week'), value: 'weekly' });
            if (diffMonths >= 1) options.push({ label: t('every_month'), value: 'monthly' });
            if (diffYears >= 1) options.push({ label: t('every_year'), value: 'yearly' });
        }

        setFilteredRepeatOptions(options);
    }, [selectedDate, repeatOption, selectedDay]);

    return (
        <CModal
            visible={visible}
            onClose={onClose}
            modalTitle={t('new_reminder')}
            width={"100%"}
            height={Platform.OS === "ios" ? "93%" : "99%"}
            justifyContent={"flex-end"}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: responsive(10) }}>
                    <CPhotosAdd
                        index={0}
                        width={isTablet ? responsive(65) : responsive(85)}
                        height={isTablet ? responsive(65) : responsive(85)}
                        imageBorderRadius={5}
                        borderRadius={10}
                        imgSource={images.defaultPhoto}
                        photos={photo ? [photo] : []}
                        setPhotos={arr => setPhoto(arr[arr.length - 1] || '')}
                    />
                    <View style={{ flex: 1, marginTop: responsive(5) }}>
                        <CTextInput
                            required
                            label={t('reminder_name')}
                            value={notificationName}
                            onChangeText={setNotificationName}
                            placeholder={t('enter_reminder_name')}
                            maxLength={60}
                        />
                    </View>
                </View>

                <View style={styles.toggleContainer}>
                    <View style={{ flexDirection: "row", gap: responsive(5) }}>
                        <CText style={styles.toggleLabel}>{t('status')}:</CText>
                        <CText
                            style={[
                                styles.toggleLabel, { color: isActive ? colors.GREEN_COLOR : colors.RED_COLOR },
                            ]}
                        >
                            {isActive ? t('on') : t('off')}
                        </CText>
                    </View>
                    <Switch
                        trackColor={{ false: colors.RED_COLOR, true: colors.GREEN_COLOR }}
                        thumbColor="#ffffff"
                        ios_backgroundColor={colors.RED_COLOR}
                        onValueChange={toggleActiveStatus}
                        value={isActive}
                    />
                </View>

                <View style={styles.dateHeader}>
                    <CText required style={styles.toggleLabel}>{t('date')}:</CText>
                    <TouchableOpacity onPress={handleDatePress} style={styles.dateDisplayContainer}>
                        <DateFormatter
                            timestamp={selectedDate}
                            color={colors.BLUE_COLOR}
                            locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
                            display="date"
                        />
                    </TouchableOpacity>
                </View>
                {isDatePickerVisible && (
                    <View
                        style={[
                            styles.datePickerInContainer,
                            isTablet && { transform: [{ scale: 1.6 }] },
                        ]}
                    >
                        <DatePicker
                            date={selectedDate}
                            onDateChange={handleDateChange}
                            mode="date"
                            theme={isDarkMode ? 'dark' : 'light'}
                            locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
                            minuteInterval={15}
                            minimumDate={new Date()}
                        />
                    </View>
                )}

                <View style={styles.dateHeader}>
                    <CText required style={styles.toggleLabel}>{t('time')}:</CText>
                    <TouchableOpacity onPress={handleTimePress} style={styles.dateDisplayContainer}>
                        <DateFormatter
                            timestamp={selectedDate}
                            color={colors.BLUE_COLOR}
                            locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
                            display="time"
                        />
                    </TouchableOpacity>
                </View>
                {isTimePickerVisible && (
                    <View
                        style={[
                            styles.datePickerInContainer,
                            isTablet && { transform: [{ scale: 1.6 }] },
                        ]}
                    >
                        <DatePicker
                            date={selectedTime}
                            onDateChange={handleTimeChange}
                            mode="time"
                            theme={isDarkMode ? 'dark' : 'light'}
                            locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
                            minuteInterval={15}
                            is24hourSource="locale"
                        />
                    </View>
                )}

                <View style={[styles.daySelectionContainer, styles.divider]}>
                    <CText required style={styles.toggleLabel}>{t('how_many_days_in_advance')}</CText>
                    <CDropdown
                        data={getAvailableDayOptions(selectedDate, repeatOption)}
                        placeholder={t('select_days')}
                        value={selectedDay}
                        onChange={item => {
                            setSelectedDay(item.value);
                        }}
                    />
                </View>

                <View style={styles.divider}>
                    <CText required style={styles.toggleLabel}>{t('repeat')}:</CText>
                    <CDropdown
                        data={filteredRepeatOptions.map(opt => ({
                            label: t(
                                opt.value === 'no' ? 'no' :
                                    opt.value === 'hourly' ? 'every_hour' :
                                        opt.value === 'every3hourly' ? 'every_3_hours' :
                                            opt.value === 'every6hourly' ? 'every_6_hours' :
                                                opt.value === 'daily' ? 'every_day' :
                                                    opt.value === 'weekly' ? 'every_week' :
                                                        opt.value === 'monthly' ? 'every_month' :
                                                            opt.value === 'yearly' ? 'every_year' :
                                                                opt.label
                            ),
                            value: opt.value
                        }))}
                        placeholder={t('change_date_first')}
                        value={repeatOption}
                        onChange={item => {
                            setRepeatOption(item.value);
                        }}
                    />
                </View>

                <View style={styles.btnConainer}>
                    <CButton
                        title={t('create_reminder')}
                        onPress={handleCreateNatification}
                        loading={loading}
                        disabled={!isFormValid}
                    />
                </View>
            </ScrollView>
        </CModal>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: responsive(20),
    },
    toggleLabel: {
        fontSize: isTablet ? 26 : 16,
        fontWeight: '600',
        color: colors.TEXT_MAIN_COLOR,
        marginBottom: responsive(7),
    },
    activeContainer: {
        backgroundColor: colors.GREEN_COLOR,
    },
    activeToggle: {
        transform: [{ translateX: responsive(25) }],
    },
    datePickerContainer: {
        marginVertical: responsive(10),
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: responsive(10),
    },
    datePickerInContainer: {
        alignItems: 'center',
        marginTop: responsive(10),
    },
    daySelectionContainer: {
        marginVertical: responsive(10),
    },
    btnConainer: {
        marginBottom: isTablet ? responsive(120) : responsive(300),
    },
    dateDisplayContainer: {
        borderWidth: 1,
        borderColor: colors.STROKE_COLOR,
        borderRadius: responsive(8),
        padding: responsive(8),
    },
    divider: {
        paddingVertical: responsive(10),
        marginVertical: responsive(10),
        borderTopWidth: 1,
        borderColor: colors.STROKE_COLOR,
    },


});

export default AddGroupDetail;

