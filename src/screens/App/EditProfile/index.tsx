import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CPhotosAdd from '../../../components/CPhotosAdd';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../store/hooks';
import CTextInput from '../../../components/CTextInput';
import CText from '../../../components/CText/CText';
import DateFormatter from '../../../components/DateFormatter';
import DatePicker from 'react-native-date-picker';
import i18n from '../../../utils/i18n';
import { categorizedHobbies } from '../../../constants/constant';
import CModal from '../../../components/CModal';
import firestore from '@react-native-firebase/firestore';
import CButton from '../../../components/CButton';
import auth from '@react-native-firebase/auth';
import { ToastError, ToastSuccess } from '../../../utils/toast';

const EditProfileScreen = () => {
  const { userData } = useAppSelector((state) => state.userData);
  const navigation: any = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const styles = getStyles(colors, isTablet);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  // EditProfileScreen.tsx en üste ekle
  const toDateSafe = (raw: any): Date | null => {
    if (!raw) return null;
    if (raw?.toDate && typeof raw.toDate === 'function') return raw.toDate();
    if (raw instanceof Date) return raw;
    if (typeof raw === 'number' || typeof raw === 'string') {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  // 🔻 Tüm state’leri userData’dan başlat
  const [photos, setPhotos] = useState<string[]>(userData.photos ?? []);
  // const [photos, setPhotos] = useState<string[]>(Array.isArray(userData?.photos) ? userData.photos : []);
  const [firstName, setFirstName] = useState<string>(userData.firstName ?? '');
  const [lastName, setLastName] = useState<string>(userData.lastName ?? '');
  const [birthDate, setBirthDate] = useState<Date | null>(toDateSafe(userData?.birthDate));
  const [about, setAbout] = useState<string>(userData?.about ?? '');
  const [hobbies, setHobbies] = useState<string[]>(Array.isArray(userData?.hobbies) ? userData.hobbies : []);
  const [hobbyModalVisible, setHobbyModalVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const MAX_HOBBY_SELECTION = 10;
  const toggleHobby = (item: string) => {
    setHobbies((prev) => {
      if (prev.includes(item)) return prev.filter((x) => x !== item);
      if (prev.length >= MAX_HOBBY_SELECTION) return prev; // limit
      return [...prev, item];
    });
  };

  // 🧠 state'lerin altına ekle

  // küçük yardımcılar
  const isArrayEqual = (a?: any[], b?: any[]) =>
    Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((v, i) => v === b[i]) : a === b;

  const changed = <T,>(a: T, b: T) => {
    if (Array.isArray(a) && Array.isArray(b)) return !isArrayEqual(a, b);
    return a !== b;
  };

  const userId = auth().currentUser?.uid;

  const onSave = async () => {
    if (!userId) {
      ToastError('Error', 'User ID not found.');
      return;
    }

    // Sadece değişmiş alanları merge edeceğiz
    const payload: any = {};

    if (changed(photos, userData?.photos)) payload.photos = photos;
    if (changed(firstName, userData?.firstName)) payload.firstName = firstName?.trim() ?? '';
    if (changed(lastName, userData?.lastName)) payload.lastName = lastName?.trim() ?? '';
    if (changed(about, userData?.about)) payload.about = about ?? '';

    // birthDate (Date | null) → Firestore Timestamp | null, sadece değiştiyse
    const prevBD: Date | null = toDateSafe(userData?.birthDate);
    if (changed(birthDate?.getTime?.(), prevBD?.getTime?.())) {
      payload.birthDate = birthDate ? firestore.Timestamp.fromDate(birthDate) : null;
    }

    if (changed(hobbies, userData?.hobbies)) payload.hobbies = hobbies;

    if (Object.keys(payload).length === 0) {
      ToastError('Info', 'No changes to save.');
      return;
    }

    try {
      setSaving(true);
      await firestore().collection('users').doc(userId).set(payload, { merge: true });
      ToastSuccess('Success', 'Profile updated.');
    } catch (e: any) {
      console.log('[EditProfile] save error:', e);
      ToastError('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* 🔙 Geri Butonu ve Başlık */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <CText style={styles.headerTitle}>Edit Profile</CText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >

        <View style={styles.photoGrid}>

          <View style={styles.leftColumn}>
            {/* Sol taraf: büyük fotoğraf */}
            <View style={styles.addIconContainer}>
              <CPhotosAdd
                index={0}
                photos={photos}
                setPhotos={setPhotos}
                width={isTablet ? responsive(270) : responsive(250)}
                height={isTablet ? responsive(250) : responsive(250)}
                resizeMode="cover"
              />
            </View>

            {/* Altında yatay 2 küçük kutu */}
            <View style={styles.bottomRow}>
              {[3, 4].map((index) => (
                <View key={index} style={styles.addIconContainer}>
                  <CPhotosAdd
                    index={index}
                    photos={photos}
                    setPhotos={setPhotos}
                    width={isTablet ? responsive(110) : responsive(120)}
                    height={isTablet ? responsive(110) : responsive(120)}
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
                  index={index}
                  photos={photos}
                  setPhotos={setPhotos}
                  width={isTablet ? responsive(110) : responsive(120)}
                  height={isTablet ? responsive(110) : responsive(120)}
                />
              </View>
            ))}
          </View>

        </View>

        {/* 🧾 Kişisel Bilgiler */}
        <CText style={styles.sectionLabel}>PERSONAL DETAILS</CText>

        <View style={styles.fieldGroupName}>
          <View style={styles.label}>
            <CTextInput
              label={t("name")}
              value={firstName}
              onChangeText={setFirstName}
              maxLength={50}
            />
          </View>
          <View style={styles.label}>
            <CTextInput
              label={t("surname")}
              value={lastName}
              onChangeText={setLastName}
              maxLength={50}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <CText
            style={styles.label}
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

        <View style={styles.fieldGroup}>
          <CTextInput
            label={t("about")}
            multiline
            value={about}
            onChangeText={setAbout}
            maxLength={250}
            style={styles.aboutInput}
          />
          <Text style={styles.charCount}>{about.length}/250</Text>
        </View>

        <View style={styles.interestHeader}>
          <CText style={styles.label}>My Hobbies</CText>
          <TouchableOpacity onPress={() => setHobbyModalVisible(true)}>
            <CText style={styles.editText}>Edit</CText>
          </TouchableOpacity>

        </View>

        <View style={styles.interestsContainer}>
          {hobbies.length === 0 ? (
            <CText style={{ color: '#999', marginTop: 8 }}>No interests selected yet.</CText>
          ) : (
            hobbies.map((item, i) => (
              <View key={`${item}_${i}`} style={styles.interestTag}>
                <CText style={styles.interestText}>{item}</CText>
              </View>
            ))
          )}
        </View>

        <CButton
          title={"Save"}
          onPress={onSave}
          loading={saving}
          disabled={saving}
        />
      </ScrollView>

      {/* 🔻 Hobiler Düzenleme Modalı */}
      <CModal
        visible={hobbyModalVisible}
        onClose={() => setHobbyModalVisible(false)}
        justifyContent="flex-end"
        modalTitle="Select Hobbies"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: responsive(16) }}
        >
          {Object.entries(categorizedHobbies).map(([category, options]) => (
            <View key={category} style={{ marginBottom: responsive(18) }}>
              <CText style={styles.categoryTitle}>{category}</CText>
              <View style={styles.hobbiesContainer}>
                {options.map((hobby) => {
                  const selected = hobbies.includes(hobby);
                  const limitReached = hobbies.length >= MAX_HOBBY_SELECTION && !selected;
                  return (
                    <TouchableOpacity
                      key={hobby}
                      onPress={() => !limitReached && toggleHobby(hobby)}
                      style={[
                        styles.hobbyButton,
                        {
                          backgroundColor: selected ? colors.BLACK_COLOR : colors.WHITE_COLOR,
                          borderWidth: 1,
                          borderColor: selected ? colors.BLACK_COLOR : colors.GRAY_COLOR,
                          opacity: limitReached ? 0.5 : 1,
                        },
                      ]}
                    >
                      <CText
                        style={{
                          color: selected ? colors.WHITE_COLOR : colors.TEXT_MAIN_COLOR,
                          fontWeight: '600',
                        }}
                      >
                        {hobby}
                      </CText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={styles.hobbyFooterRow}>
            <CText style={styles.progressText}>{hobbies.length}/{MAX_HOBBY_SELECTION}</CText>
            <CText style={{ color: '#999' }}>Tap to select / deselect</CText>
          </View>

          <View style={{ height: responsive(16) }} />
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.BLACK_COLOR }]}
            onPress={() => setHobbyModalVisible(false)}
          >
            <CText style={styles.saveButtonText}>Done</CText>
          </TouchableOpacity>
        </ScrollView>
      </CModal>

    </View>
  );
};

export default EditProfileScreen;

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  photoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: responsive(25),
  },
  leftColumn: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_MAIN_COLOR
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_MAIN_COLOR,
    marginBottom: responsive(8)
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsive(10)
  },
  hobbyButton: {
    borderRadius: responsive(20),
    paddingHorizontal: responsive(12),
    paddingVertical: responsive(8),
  },
  hobbyFooterRow: {
    marginTop: responsive(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateDisplayContainer: {
    borderWidth: 0.5,
    borderColor: colors.GRAY_COLOR,
    borderRadius: responsive(14),
    padding: responsive(10),
    paddingVertical: responsive(13),
    backgroundColor: colors.EXTRA_LIGHT_GRAY,
    marginTop: 10,
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
  btnContainer: {
    marginTop: responsive(20),
    marginBottom: responsive(330),
    alignItems: "flex-end"
  },
  btnStyle: {
    width: responsive(80),
  },
  addText: {
    color: '#E56BFA',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionLabel: {
    color: '#A1A1A1',
    marginTop: 25,
    fontWeight: '600',
    letterSpacing: 1,
  },
  fieldGroupName: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fieldGroup: {
    marginTop: 14,
  },
  label: {
    color: '#1C1C1C',
    fontWeight: '600',
    width: 180,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  aboutBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 10,
    position: 'relative',
  },
  aboutInput: {
    fontSize: 14,
    color: '#333',
    minHeight: 70,
  },
  charCount: {
    position: 'absolute',
    bottom: 15,
    right: 12,
    fontSize: 12,
    color: '#999',
  },
  interestHeader: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editText: {
    color: '#E56BFA',
    fontWeight: '600',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 30,
    gap: 8,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1ECF5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestText: {
    fontSize: 13,
    color: '#333',
    marginRight: 4,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  genderText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#3B004D',
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
