import { useState } from "react";
import { StyleSheet, View } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import CButton from "../../../components/CButton";
import { DRAWER } from "../../../navigators/Stack";
import { responsive } from "../../../utils/responsive";
import { useTheme } from "../../../utils/colors";
import CustomBackButton from "../../../components/CBackButton";
import CText from "../../../components/CText/CText";
import CTextInput from "../../../components/CTextInput";

const AddProfile8 = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [about, setAbout] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        photos,
        firstName,
        lastName,
        birthDate,
        gender,
        height,
        country,
        city,
        lookingFor,
        relationshipType,
        hobbies,
    } = route.params;

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
                            photos: uploadedPhotoUrls,
                            birthDate: birthDate ? firestore.Timestamp.fromDate(birthDate) : null,
                            firstName,
                            lastName,
                            gender,
                            height,
                            country,
                            city,
                            lookingFor,
                            relationshipType,
                            hobbies,
                            about,
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

    return (
        <View style={styles.container}>
            <View>
                <CustomBackButton />

                <CText style={styles.title}>Bize biraz kendinden bahset</CText>
                <CText style={styles.description}>
                    Profilinde kısa bir açıklama ekleyerek diğer kullanıcıların seni tanımasını sağla.
                </CText>

                <CTextInput
                    value={about}
                    onChangeText={setAbout}
                    multiline
                    maxLength={1500}
                    placeholder="Örneğin: Seyahat etmeyi, müzik dinlemeyi ve yeni insanlarla tanışmayı seviyorum."
                    style={styles.textInput}
                />
            </View>

            <View style={styles.footer}>
                <CButton
                    title="Kaydet"
                    onPress={saveOnPress}
                    loading={loading}
                    disabled={!about}
                    style={styles.saveButton}
                />
            </View>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
            padding: responsive(20),
            justifyContent: "space-between",
        },
        title: {
            fontSize: responsive(26),
            fontWeight: "700",
            color: colors.TEXT_MAIN_COLOR,
            marginTop: responsive(50),
            marginBottom: responsive(8),
        },
        description: {
            fontSize: responsive(15),
            color: colors.GRAY_COLOR,
            marginBottom: responsive(20),
        },
        textInput: {
            minHeight: responsive(120),
        },
        footer: {
            marginBottom: responsive(10),
            alignItems: "flex-end",
        },
        saveButton: {
            width: responsive(100),
        },
    });

export default AddProfile8;