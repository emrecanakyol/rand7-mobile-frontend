import { useEffect, useState } from "react";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { DRAWER } from "../../../navigators/Stack";
import CTextInput from "../../../components/CTextInput";
import CButton from "../../../components/CButton";
import { Dimensions, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { responsive } from "../../../utils/responsive";
import { useTheme } from "../../../utils/colors";
import CText from "../../../components/CText/CText";
import DatePicker from "react-native-date-picker";
import DateFormatter from "../../../components/DateFormatter"
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import CPhotosAdd from "../../../components/CPhotosAdd";
import images from "../../../assets/image/images";

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

  const pickImage = async (index: number) => {
    const { launchImageLibrary } = await import("react-native-image-picker");
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri!;
      const updated = [...photos];
      updated[index] = uri;
      setPhotos(updated);
    }
  };

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
    // const hasPhoto = photos.some((p) => p && p.trim() !== ''); // en az 1 dolu fotoğraf var mı?

    if (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      birthDate !== null &&
      photos.length > 0
    ) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  };

  useEffect(() => {
    checkAllFieldsFilled();
  }, [firstName, lastName, birthDate, photos]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.inContainer}>

          <View style={styles.photoGrid}>

            <View style={styles.leftColumn}>
              {/* Sol taraf: büyük fotoğraf */}
              <View style={styles.addIconContainer}>
                <CPhotosAdd
                  key={0}
                  index={0}
                  photos={photos}
                  setPhotos={setPhotos}
                  width={isTablet ? responsive(250) : responsive(250)}
                  height={isTablet ? responsive(250) : responsive(250)}
                />
              </View>

              {/* Altında yatay 2 küçük kutu */}
              <View style={styles.bottomRow}>
                {[3, 4].map((index) => (
                  <View key={index} style={styles.addIconContainer}>
                    <CPhotosAdd
                      key={index}
                      index={index}
                      photos={photos}
                      setPhotos={setPhotos}
                      width={isTablet ? responsive(100) : responsive(120)}
                      height={isTablet ? responsive(100) : responsive(120)}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Sağ taraf: 3 küçük kutu dikey */}
            <View style={styles.rightColumn}>
              {[1, 2, 5].map((index) => (
                <View key={index} style={styles.addIconContainer}>
                  <CPhotosAdd
                    key={index}
                    index={index}
                    photos={photos}
                    setPhotos={setPhotos}
                    width={isTablet ? responsive(100) : responsive(120)}
                    height={isTablet ? responsive(100) : responsive(120)}
                  />
                </View>
              ))}
            </View>
          </View>

          <CTextInput
            label={t("name")}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("enter_your_first_name")}
            maxLength={50}
            required
          />
          <CTextInput
            label={t("surname")}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("enter_your_last_name")}
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

          <CTextInput
            label={t("about")}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("enter_your_about")}
            maxLength={500}
            required
            multiline
          />

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
  photoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsive(25),
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    justifyContent: "space-between",
    marginLeft: responsive(10),
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: responsive(10),
  },
  mainPhotoImage: {
    borderRadius: 16,
  },
  addIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontWeight: '600',
    color: colors.TEXT_MAIN_COLOR,
    marginBottom: responsive(7),
    marginTop: responsive(10),
  },
  dateDisplayContainer: {
    borderWidth: 0.5,
    borderColor: colors.GRAY_COLOR,
    borderRadius: responsive(14),
    padding: responsive(10),
    paddingVertical: responsive(13),
    backgroundColor: colors.EXTRA_LIGHT_GRAY,

  },
  btnContainer: {
    marginTop: responsive(20),
    marginBottom: responsive(330),
  },
})

export default AddProfile;