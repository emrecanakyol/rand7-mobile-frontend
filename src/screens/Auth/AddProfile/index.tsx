import { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import DatePicker from "react-native-date-picker";
import { useTheme } from "../../../utils/colors";
import { responsive } from "../../../utils/responsive";
import { useTranslation } from "react-i18next";
import CTextInput from "../../../components/CTextInput";
import CButton from "../../../components/CButton";
import CText from "../../../components/CText/CText";
import CPhotosAdd from "../../../components/CPhotosAdd";
import DateFormatter from "../../../components/DateFormatter";
import i18n from "../../../utils/i18n";
import { DRAWER, ADD_PROFILE_2 } from "../../../navigators/Stack";

const AddProfile = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const styles = getStyles(colors, isTablet);
  const [photos, setPhotos] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const canProceed = photos.length > 0 && firstName && lastName && birthDate;

  const handleNext = () => {
    navigation.navigate(ADD_PROFILE_2, {
      photos,
      firstName,
      lastName,
      birthDate,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inContainer}>
        <View style={styles.photoGrid}>

          <View style={styles.leftColumn}>
            {/* Sol taraf: büyük fotoğraf */}
            <View style={styles.addIconContainer}>
              <CPhotosAdd
                key={0}
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
                    key={index}
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
                  key={index}
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


        <CTextInput
          label={t("name")}
          value={firstName}
          onChangeText={setFirstName}
          placeholder={t("enter_your_first_name")}
          maxLength={50}
        />
        <CTextInput
          label={t("surname")}
          value={lastName}
          onChangeText={setLastName}
          placeholder={t("enter_your_last_name")}
          maxLength={50}
        />

        <View>
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

        <View style={styles.btnContainer}>
          <CButton
            style={styles.btnStyle}
            title={t("next")}
            disabled={!canProceed}
            onPress={handleNext} />
        </View>

      </ScrollView>
    </View>
  );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_COLOR
  },
  inContainer: {
    padding: responsive(20)
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
  btnContainer: {
    marginTop: responsive(20),
    marginBottom: responsive(330),
    alignItems: "flex-end"
  },
  btnStyle: {
    width: responsive(80),
  }
});

export default AddProfile;