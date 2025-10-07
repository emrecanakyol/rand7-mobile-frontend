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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EditProfileScreen = () => {
  const navigation: any = useNavigation();
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
        {/* 📸 Fotoğraf Grid */}
        <View style={styles.photoGrid}>
          <View style={styles.mainPhotoContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
              }}
              style={styles.mainPhoto}
            />
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera-outline" size={16} color="#fff" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sidePhotos}>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <TouchableOpacity key={i} style={styles.addPhotoBox}>
                  <Ionicons name="add" size={20} color="#E56BFA" />
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
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

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    marginTop: 30,
  },
  mainPhotoContainer: {
    flex: 1.2,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 10,
  },
  mainPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  changePhotoButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changePhotoText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
  },
  sidePhotos: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  addPhotoBox: {
    width: '48%',
    height: 90,
    borderRadius: 14,
    backgroundColor: '#F9F3FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
