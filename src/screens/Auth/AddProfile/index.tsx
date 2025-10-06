import { useEffect, useState } from "react";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { DRAWER } from "../../../navigators/Stack";
import CPhotosAdd from "../../../components/CPhotosAdd";
import CTextInput from "../../../components/CTextInput";
import CButton from "../../../components/CButton";
import images from "../../../assets/image/images";
import { Dimensions, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import CustomBackButton from "../../../components/CBackButton";
import { responsive } from "../../../utils/responsive";
import { useTheme } from "../../../utils/colors";
import CText from "../../../components/CText/CText";
import DatePicker from "react-native-date-picker";
import DateFormatter from "../../../components/DateFormatter"
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";

const AddProfile = ({ navigation }: any) => {
  // Bugünden 18 yıl öncesini hesapla
  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const styles = getStyles(colors, isTablet);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const uploadPhotos = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      console.log('User not logged in');
      return [];
    }

    const uploadedPhotoUrls = [];

    for (const photo of photos) {
      const storageRef = storage().ref(
        `users/profile-photos/${userId}/${Date.now()}`,
      );
      await storageRef.putFile(photo);
      const downloadURL = await storageRef.getDownloadURL();
      uploadedPhotoUrls.push(downloadURL);
    }
    return uploadedPhotoUrls;

  };

  // annon- + 16 karakter random id üretip Firestore’da kontrol eder
  const generateUniqueAnonId = async (userId: string) => {
    const userRef = firestore().collection('users').doc(userId);
    const userSnap: any = await userRef.get();

    // Eğer kullanıcıda daha önce atanmış id varsa onu döndür
    if (userSnap.exists && userSnap.data()?.annonId) {
      return userSnap.data()?.annonId;
    }

    // Yoksa yeni benzersiz id üret
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    while (true) {
      let randomPart = '';
      for (let i = 0; i < 16; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const candidate = `annon-${randomPart}`;

      // Firestore’da başka kullanıcıda var mı kontrol et
      const query = await firestore()
        .collection('users')
        .where('annonId', '==', candidate)
        .limit(1)
        .get();

      if (query.empty) {
        return candidate; // benzersiz bulundu
      }
    }
  };


  const saveOnPress = async () => {
    setLoading(true);
    const userId = auth().currentUser?.uid;

    if (userId) {
      const uploadedPhotoUrls = await uploadPhotos();
      try {
        const annonId = await generateUniqueAnonId(userId); // annonId üretiyoruz

        await firestore()
          .collection('users')
          .doc(userId)
          .set(
            {
              annonId,
              firstName: firstName,
              lastName: lastName,
              photos: uploadedPhotoUrls,
              birthDate: birthDate ? firestore.Timestamp.fromDate(birthDate) : null,
            },
            { merge: true },
          );
        await navigation.navigate(DRAWER);
      } catch (error) {
        console.log('Error saving profile: ', error);
      }
    } else {
      console.log('User not logged in');
    }
    setLoading(false);
  };

  const checkAllFieldsFilled = () => {
    if (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      birthDate !== null
    ) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  };

  useEffect(() => {
    checkAllFieldsFilled();
  }, [firstName, lastName, birthDate]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.inContainer}>

          <CustomBackButton />
          <CPhotosAdd
            imgSource={images.defaultProfilePhoto}
            photos={photos}
            setPhotos={setPhotos}
          />
          <CTextInput
            label={t("name")}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            maxLength={50}
            required
          />
          <CTextInput
            label={t("surname")}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            maxLength={50}
            required
          />

          <View>
            <CText
              style={styles.label}
              required
            >{t("birth_date")}</CText>
            <TouchableOpacity
              onPress={() => setIsDatePickerOpen(true)}
              style={styles.dateDisplayContainer}
            >
              <DateFormatter
                timestamp={birthDate}
                locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
                showTime={false}
              />
            </TouchableOpacity>

            <DatePicker
              modal
              open={isDatePickerOpen}
              date={birthDate || eighteenYearsAgo}
              locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
              mode="date"
              title={t("select_date")}
              confirmText={t("ok")}
              cancelText={t("cancel")}
              maximumDate={eighteenYearsAgo}
              onConfirm={(date) => {
                setIsDatePickerOpen(false);
                setBirthDate(date);
              }}
              onCancel={() => {
                setIsDatePickerOpen(false);
              }}
            />
          </View>

          <CButton
            title={t("save")}
            onPress={saveOnPress}
            loading={loading}
            disabled={isButtonDisabled}
            style={styles.btnContainer}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  inContainer: {
    padding: responsive(24),
    paddingTop: responsive(10),
  },
  label: {
    fontWeight: '600',
    color: colors.TEXT_MAIN_COLOR,
    marginBottom: responsive(7),
    marginTop: responsive(10),
  },
  dateDisplayContainer: {
    borderWidth: 1,
    borderColor: colors.GRAY_COLOR,
    borderRadius: responsive(8),
    padding: responsive(10),
    paddingVertical: responsive(13),
  },
  btnContainer: {
    marginTop: responsive(20),
    marginBottom: responsive(330),
  },
})

export default AddProfile;