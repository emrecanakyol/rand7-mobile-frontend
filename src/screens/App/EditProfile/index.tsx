import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CPhotosAdd from '../../../components/CPhotosAdd';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../store/hooks';

const EditProfileScreen = () => {
  const { userData } = useAppSelector((state) => state.userData);
  const navigation: any = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const styles = getStyles(colors, isTablet);
  const [about, setAbout] = useState(
    "A good listener. I love having a good talk to know each other’s side 😍."
  );

  const [interests, setInterests] = useState([
    '📸 Photography',
    '🎵 Music',
    '👗 Fashion',
    '📖 Read Book',
  ]);

  return (
    <View style={styles.container}>
      {/* 🔙 Geri Butonu ve Başlık */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 26 }} /> {/* Placeholder for spacing */}
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
                key={0}
                index={0}
                photos={userData.photos}
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
                    photos={userData.photos}
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
                  photos={userData.photos}
                  setPhotos={setPhotos}
                  width={isTablet ? responsive(110) : responsive(120)}
                  height={isTablet ? responsive(110) : responsive(120)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* 🧾 Kişisel Bilgiler */}
        <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value="Nadia Lipshutz"
            placeholder="Enter full name"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Birthdate</Text>
          <TextInput style={styles.input} value="20/10/2000" />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>About</Text>
          <View style={styles.aboutBox}>
            <TextInput
              multiline
              value={about}
              onChangeText={setAbout}
              maxLength={250}
              style={styles.aboutInput}
            />
            <Text style={styles.charCount}>{about.length}/250</Text>
          </View>
        </View>

        {/* 🎯 İlgi Alanları */}
        <View style={styles.interestHeader}>
          <Text style={styles.label}>My Interests</Text>
          <TouchableOpacity>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.interestsContainer}>
          {interests.map((item, i) => (
            <View key={i} style={styles.interestTag}>
              <Text style={styles.interestText}>{item}</Text>
              <Ionicons name="close" size={14} color="#999" />
            </View>
          ))}
        </View>

        {/* 📍 Location */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value="Hamburg, Germany" />
        </View>

        {/* 🚻 Gender */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            <Text style={styles.genderText}>Woman</Text>
            <Ionicons name="information-circle-outline" size={18} color="#999" />
          </View>
        </View>

        {/* 💾 Save Butonu */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
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
  fieldGroup: {
    marginTop: 14,
  },
  label: {
    color: '#1C1C1C',
    fontWeight: '600',
    marginBottom: 6,
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
    bottom: 8,
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
