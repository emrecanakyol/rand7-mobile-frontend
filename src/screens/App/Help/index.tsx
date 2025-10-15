import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Platform,
  Dimensions
} from 'react-native'
import DetailHeaders from '../../../components/DetailHeaders'
import { useTheme } from '../../../utils/colors'
import { responsive } from '../../../utils/responsive'
import CText from '../../../components/CText/CText'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import CButton from '../../../components/CButton'
import CTextInput from '../../../components/CTextInput'
import CModal from '../../../components/CModal'
import { ToastError, ToastSuccess } from '../../../utils/toast'
import DeviceInfo from 'react-native-device-info'
import { useNavigation } from '@react-navigation/native'
import { ADD_HELP } from '../../../navigators/Stack'
import { useTranslation } from 'react-i18next'
import { sendAdminNotification } from '../../../utils/constants/Notifications'

const HelpSupport = () => {
  const navigation: any = useNavigation();
  const { colors } = useTheme();
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const styles = getStyles(colors, isTablet);
  const appVersion = DeviceInfo.getVersion();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactEmail, setContactEmail] = useState('');

  // 🔁 Firestore'dan "helps" verisini çek
  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        const snapshot = await firestore()
          .collection('helps')
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setContactEmail(data.contactEmail || '');
        }
      } catch (error) {
        console.log('Help verisi çekilemedi:', error);
      }
    };

    fetchHelpData();
  }, []);

  const handleContactPress = () => {
    Linking.openURL(`mailto:${contactEmail}`);
  }

  const handleSendSuggestion = async () => {
    if (message.trim() === '') return;

    setLoading(true);
    const userId = auth().currentUser?.uid;

    try {
      const groupRef = firestore()
        .collection('supportMessages')

      await groupRef.add({
        createdAt: firestore.FieldValue.serverTimestamp(),
        message,
        userId,
      });


      await sendAdminNotification("Yeni Geri Bildirim & Öneri", message);
      setMessage('');
      setModalVisible(false);
      ToastSuccess(t('success'), t("feedback_sent_success"));
    } catch (error) {
      console.log('Error sending suggestion:', error);
      ToastError(t('error'), t("feedback_sent_failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <DetailHeaders
        title={t('help_support_title') /* "Help / Support" */}
        showRightIcon={true}
        rightIconOnPress={() => navigation.navigate(ADD_HELP)}
        rightIconName={"add"}
      />

      <View style={styles.inContainer}>
        <View style={styles.section}>
          <CText style={styles.sectionTitle}>{t('app_version')}</CText>
          <CText style={styles.sectionText}>{appVersion}</CText>
        </View>

        <View style={styles.section}>
          <CText style={styles.sectionTitle}>{t('contact_developer')}</CText>
          <TouchableOpacity onPress={handleContactPress}>
            <CText style={[styles.sectionText, styles.linkText]}>
              {contactEmail}
            </CText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <CText style={styles.sectionTitle}>{t('about_us')}</CText>
          <CText style={styles.sectionText}>
            {t('about_us_desc')}
          </CText>
        </View>
      </View>

      <CButton
        title={t('send_feedback_suggestion')}
        onPress={() => setModalVisible(true)}
        style={styles.button}
      />

      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        modalTitle={t('send_feedback')}
        width={"100%"}
        height={Platform.OS === "ios" ? "95%" : "99%"}
        justifyContent={"flex-end"}
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
      >
        <CText style={styles.modalTitle}>{t('your_message')}</CText>
        <CTextInput
          multiline
          placeholder={t('feedback_placeholder')}
          value={message}
          onChangeText={setMessage}
          maxLength={1500}
        />

        <CButton
          title={loading ? t('sending') : t('send')}
          onPress={handleSendSuggestion}
          disabled={loading || message.trim() === ''}
        />
      </CModal>
    </View>
  );
}

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  inContainer: {
    padding: responsive(16),
  },
  section: {
    marginBottom: responsive(24),
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '600',
    color: colors.TEXT_MAIN_COLOR,
    marginBottom: responsive(8),
  },
  sectionText: {
    fontWeight: '600',
    color: colors.GRAY_COLOR,
  },
  linkText: {
    color: colors.BLUE_COLOR,
    textDecorationLine: 'underline',
  },
  button: {
    margin: responsive(16),
  },
  modalTitle: {
    fontSize: isTablet ? 30 : 20,
    fontWeight: '700',
    color: colors.TEXT_MAIN_COLOR,
    marginBottom: responsive(16),
  },
})

export default HelpSupport;
