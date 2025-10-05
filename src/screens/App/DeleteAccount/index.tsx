import { useState } from "react";
import { useDispatch } from 'react-redux';
import { signOut } from "../../../store/services/authServices";
import { Alert, StyleSheet, View, ScrollView, Dimensions } from "react-native";
import { ToastSuccess } from "../../../utils/toast";
import { responsive } from "../../../utils/responsive";
import { useTheme } from "../../../utils/colors";
import CTextInput from "../../../components/CTextInput";
import CButton from "../../../components/CButton";
import DetailHeaders from "../../../components/DetailHeaders";
import { ONEBOARDINGONE } from "../../../navigators/Stack";
import { useTranslation } from "react-i18next";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { sendAdminNotification } from "../../../utils/constants/Notifications";

const DeleteAccount = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const styles = getStyles(colors, isTablet);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const isValidEmail = (email: string) => {
    // Basit bir email regex kontrolü
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = () => {
    return (
      firstName !== '' &&
      lastName !== '' &&
      email !== '' &&
      isValidEmail(email) &&
      confirmationMessage !== ''
    );
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      await firestore()
        .collection('users')
        .doc(userId)
        .update({ accountStatus: false }); // Hesap durumunu pasif yaptık

      await sendAdminNotification("Hesap Silme Talebi !", `${userId}${"\n"}${confirmationMessage}`);   //Admine hesap silindiğinde bildirim gönder.
      await signOut(dispatch);
      await navigation.navigate(ONEBOARDINGONE);
      Alert.alert(t("success"), t("delete_account_request_success"), [{ text: t("okay"), style: 'cancel' }])
    } catch (error) {
      console.log('Sign Out Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      t("delete_account_request_title"),
      t("delete_account_request_confirm"),
      [
        {
          text: t("no"),
          style: 'cancel',
        },
        {
          text: t("yes"),
          onPress: () => {
            handleSignOut();
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <View style={styles.container}>
      <DetailHeaders
        title={t("delete_account_request_title")}
      />

      <ScrollView style={styles.formContainer}>
        <View>
          <CTextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("enter_name")}
            maxLength={50}
            required
            label={t("first_name")}
          />
        </View>

        <CTextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder={t("enter_last_name")}
          maxLength={50}
          required
          label={t("last_name")}
        />

        <CTextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("enter_email")}
          maxLength={100}
          keyboardType="email-address"
          validateEmail
          required
          label={t("email")}
        />

        <CTextInput
          value={confirmationMessage}
          onChangeText={setConfirmationMessage}
          placeholder={t("delete_account_reason_placeholder")}
          maxLength={500}
          required
          label={t("delete_account_reason_label")}
          multiline
        />

        <CButton
          title={t("delete_account_submit")}
          onPress={handleSubmit}
          disabled={!isFormValid()}
          loading={loading}
          backgroundColor={colors.RED_COLOR}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  formContainer: {
    flex: 1,
    padding: responsive(24),
  },
  description: {
    fontSize: 14,
    color: colors.GRAY_COLOR,
    lineHeight: responsive(20),
  },
  submitButton: {
    marginBottom: isTablet ? responsive(200) : responsive(375),
  },
});

export default DeleteAccount;
