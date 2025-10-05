import { useCallback, useEffect, useState } from "react";
import firestore from '@react-native-firebase/firestore';
import auth, { EmailAuthProvider } from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import CPhotosAdd from "../../../components/CPhotosAdd";
import CTextInput from "../../../components/CTextInput";
import CButton from "../../../components/CButton";
import images from "../../../assets/image/images";
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, Switch, Alert } from "react-native";
import { responsive } from "../../../utils/responsive";
import { useTheme } from "../../../utils/colors";
import DetailHeaders from "../../../components/DetailHeaders";
import { ToastError, ToastSuccess } from "../../../utils/toast";
import CText from "../../../components/CText/CText";
import { useDispatch } from 'react-redux';
import { DELETE_ACCOUNT, EMAIL_LOGIN, RESET_PASSWORD } from "../../../navigators/Stack";
import { signOut } from "../../../store/services/authServices";
import DatePicker from "react-native-date-picker";
import DateFormatter from "../../../components/DateFormatter";
import CModal from "../../../components/CModal";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CLoading from "../../../components/CLoading";
import i18n from "../../../utils/i18n";

const EditProfile = () => {
  const { colors } = useTheme();
  const navigation: any = useNavigation()
  const styles = getStyles(colors);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailVerification, setEmailVerification] = useState(false);
  const [password, setPassword] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  //Şifre Değiştirme 
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  //Şifre Değiştirme
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("error"), t("fill_all_fields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t("error"), t("new_passwords_do_not_match"));
      return;
    }

    try {
      setPasswordChangeLoading(true);
      const user = auth().currentUser;

      if (!user?.email) {
        throw new Error("User email not found.");
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordModalVisible(false);
      ToastSuccess(t("success"), t("password_updated_successfully"));
    } catch (error: any) {
      console.log("Password change error:", error);
      Alert.alert(t("error"), t("failed_to_change_password"));
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  //Tüm kullanıcı bilgileri firestoreden çekiliyor
  const fetchUserData = async () => {
    const user: any = auth().currentUser;
    const userId = user?.uid;
    await user.reload();

    if (userId) {
      try {
        // Email doğrulanmış ise emailVerification false yapalım.
        if (user.emailVerified) {
          await firestore()
            .collection('users')
            .doc(userId)
            .set({
              emailVerification: false,
            }, { merge: true });
        }

        const userDoc: any = await firestore()
          .collection('users')
          .doc(userId)
          .get();
        const userData = userDoc.data();

        if (userDoc.exists) {
          setFirstName(userData?.firstName || '');
          setLastName(userData?.lastName || '');
          setPhotos(userData?.photos || []);
          setEmail(userData?.email || '');
          setEmailVerification(userData.emailVerification);
          setBirthDate(userData?.birthDate ? userData.birthDate.toDate() : null);
        }

      } catch (error) {
        console.log('Error fetching user data: ', error);
      } finally {
        setInitialLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        fetchUserData();
      }, 1000);
    }, [])
  );

  //Fotoğraf yüklemesi için kütüphane ayarı
  const uploadPhotos = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) return [];

    if (photos.length === 0) return [];

    const uploadedPhotoUrls = [];

    for (const photo of photos) {
      if (photo.startsWith('http')) {
        uploadedPhotoUrls.push(photo);
        continue;
      }

      try {
        const storageRef = storage().ref(
          `users/profile-photos/${userId}/${Date.now()}`
        );
        await storageRef.putFile(photo);
        const downloadURL = await storageRef.getDownloadURL();
        uploadedPhotoUrls.push(downloadURL);
      } catch (error) {
        console.log('Error uploading photo:', error);
        throw error;
      }
    }

    return uploadedPhotoUrls;
  };

  //Tüm inputlar dolu olması için kontrol
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

  const handleSignOut = async () => {
    try {
      await signOut(dispatch);
      await navigation.navigate(EMAIL_LOGIN);
      Alert.alert(t("success"), t("email_change_request_success"), [{ text: t("okay"), style: 'cancel' }])
    } catch (error) {
      console.log('Sign Out Error:', error);
    }
  };

  const saveOnPress = async () => {
    setLoading(true);
    try {
      const user = auth().currentUser;
      const userId = user?.uid;

      if (!user || !userId) {
        throw new Error(t("user_not_logged_in"));
      }

      const uploadedPhotoUrls = await uploadPhotos();

      const updateData: any = {
        firstName: firstName,
        lastName: lastName,
        birthDate: birthDate ? firestore.Timestamp.fromDate(birthDate) : null,
      };

      //Eğer yeni fotoğraf eklendiyse
      if (uploadedPhotoUrls.length > 0 || photos.length === 0) {
        updateData.photos = uploadedPhotoUrls;
      }

      // Burası sadece email değişince çalışıyor
      // Kullanıcı email ile giriş yaptıysa kontrolü ekledim
      if (auth().currentUser?.providerData[0].providerId !== "phone") {
        // Email değiştirildi ise doğrulama gönderiyor
        if (email !== user?.email) {
          if (!password) {
            throw new Error(t("enter_password_to_update_email"));
          }
          const credential = EmailAuthProvider.credential(user.email!, password);
          await user?.reauthenticateWithCredential(credential);
          await user.verifyBeforeUpdateEmail(email);
          updateData.emailVerification = true; // firestorede email doğrulamayı aç true olarak firestoreye kaydet.
          handleSignOut();
        }
      }

      // Firestore'da ad/soyad ve fotoğraf güncelle
      await firestore()
        .collection('users')
        .doc(userId)
        .set(updateData, { merge: true });
      ToastSuccess(t("success"), t("profile_updated_successfully"));
      // navigation.goBack();
    } catch (error: any) {
      console.log('Error:', error);
      ToastError(t("error"), t("failed_to_update_profile"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    setPasswordModalVisible(false);
    navigation.navigate(RESET_PASSWORD, { email });
  };

  return (
    <View style={styles.container}>
      <DetailHeaders title={t("edit_profile")} />
      {initialLoading ? (
        <CLoading visible={initialLoading} />
      ) : (
        <ScrollView style={styles.inContainer}>
          <View>
            <CPhotosAdd
              imgSource={images.defaultProfilePhoto}
              photos={photos}
              setPhotos={setPhotos}
            />
            <CTextInput
              label={t("first_name")}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t("enter_first_name")}
              maxLength={50}
              required
            />
            <CTextInput
              label={t("last_name")}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t("enter_last_name")}
              maxLength={50}
              required
            />

            <View>
              <CText style={styles.label} required>
                {t("birth_date")}
              </CText>
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
                date={birthDate || new Date()}
                locale={i18n.language === 'tr' ? 'tr-TR' : 'en-US'}
                mode="date"
                maximumDate={new Date()}
                onConfirm={(date) => {
                  setIsDatePickerOpen(false);
                  setBirthDate(date);
                }}
                onCancel={() => {
                  setIsDatePickerOpen(false);
                }}
              />
            </View>

            {/* Kullanıcı email ile giriş yaptıysa */}
            {auth().currentUser?.providerData[0].providerId !== "phone" && (
              <View style={{ marginTop: 10 }}>
                <CTextInput
                  label={t("email")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("enter_email")}
                  keyboardType="email-address"
                  validateEmail
                  maxLength={100}
                  required
                />
                {emailVerification == true && (
                  <CText style={styles.emailVerification}>
                    {t("verify_new_email_message")}
                  </CText>
                )}
                {email !== auth().currentUser?.email && (
                  <View>
                    <CTextInput
                      label={t("password")}
                      value={password}
                      onChangeText={setPassword}
                      placeholder={t("enter_password")}
                      secureTextEntry
                      maxLength={100}
                      required
                    />
                    <CText style={styles.emailVerification}>{t("must_enter_password_to_change_email")}</CText>
                  </View>
                )}
                {email === auth().currentUser?.email && (
                  <TouchableOpacity
                    onPress={() => setPasswordModalVisible(true)}
                    style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 8 }}
                  >
                    <CText style={{ color: colors.DARK_GREEN_COLOR, textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' }}>
                      {t("change_password")}
                    </CText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <CButton
              title={t("save")}
              onPress={saveOnPress}
              loading={loading}
              disabled={isButtonDisabled}
              style={styles.btnContainer}
            />

            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(DELETE_ACCOUNT)}
                style={styles.deleteAccountBtn}>
                <CText
                  color={colors.RED_COLOR}
                  fontWeight="600">
                  {t("delete_account")}
                </CText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
      <CModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        modalTitle={t("change_password")}
        width={"100%"}
        height={Platform.OS === "ios" ? "93%" : "99%"}
        justifyContent={"flex-end"}
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
      >
        <CTextInput
          label={t("current_password")}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={t("enter_current_password")}
          secureTextEntry
          maxLength={100}
          required
          validatePassword
        />
        <CTextInput
          label={t("new_password")}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t("enter_new_password")}
          secureTextEntry
          maxLength={100}
          required
          validatePassword
        />
        <CTextInput
          label={t("confirm_new_password")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("confirm_new_password")}
          secureTextEntry
          maxLength={100}
          required
          validatePassword
        />
        <CButton
          title={passwordChangeLoading ? t("changing") : t("change_password")}
          onPress={handleChangePassword}
          loading={passwordChangeLoading}
          style={{ marginTop: 20 }}
        />
        <TouchableOpacity
          onPress={handleResetPassword}
          style={styles.resetPasswordContainer}>
          <CText style={styles.resetPasswordText}>
            {t("forgot_password")}
          </CText>
        </TouchableOpacity>
      </CModal>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  inContainer: {
    padding: responsive(24),
  },
  emailVerification: {
    color: colors.RED_COLOR,
    fontSize: 14,
    fontWeight: '400',
  },
  label: {
    fontWeight: '600',
    color: colors.TEXT_MAIN_COLOR,
    marginBottom: responsive(7),
    marginTop: responsive(17),
  },
  dateDisplayContainer: {
    borderWidth: 1,
    borderColor: colors.GRAY_COLOR,
    borderRadius: responsive(8),
    padding: responsive(10),
    paddingVertical: responsive(13),
  },
  btnContainer: {
    marginTop: responsive(40),
  },
  deleteAccountBtn: {
    marginTop: responsive(20),
    marginBottom: responsive(370),
    width: responsive(200),
    alignItems: "center",
  },
  resetPasswordContainer: {
    alignSelf: "center",
    marginTop: responsive(20),
  },
  resetPasswordText: {
    color: colors.TEXT_DESCRIPTION_COLOR,
  }
});

export default EditProfile;
