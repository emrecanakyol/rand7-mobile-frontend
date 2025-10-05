import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ToastError, ToastSuccess } from '../../../../../utils/toast';
import CModal from '../../../../../components/CModal';
import { responsive } from '../../../../../utils/responsive';
import CTextInput from '../../../../../components/CTextInput';
import CButton from '../../../../../components/CButton';
import { Platform, StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';
import { useTheme } from '../../../../../utils/colors';
import CText from '../../../../../components/CText/CText';
import CPhotosAdd from '../../../../../components/CPhotosAdd';
import images from '../../../../../assets/image/images';
import storage from '@react-native-firebase/storage';
import { useTranslation } from 'react-i18next';
import CDropdown from '../../../../../components/CDropdown';

interface AddGroupsModalProps {
    isVisible: boolean;
    onClose: () => void;
    onGroupCreated: () => void;
}

const AddGroupsModal: React.FC<AddGroupsModalProps> = ({ isVisible, onClose, onGroupCreated }) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors);
    const [groupName, setGroupName] = useState(__DEV__ ? "Doğum Günleri" : "");
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<{ label: string; value: string }[]>([]);
    const [parentGroupId, setParentGroupId] = useState<string | null>(null);
    const [groupsLoading, setGroupsLoading] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const { t } = useTranslation();

    // Modal açıldığında kullanıcının oluşturduğu tüm grupları Dropdwon için getir
    const fetchGroups = async () => {
        const userId = auth().currentUser?.uid;
        setGroupsLoading(true);
        if (!userId) {
            setTimeout(() => setGroupsLoading(false), 1000);
            return;
        }
        try {
            const snapshot = await firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .get();
            const groupList = snapshot.docs
                .filter(doc => !doc.data().parentGroupId) // Sadece ana gruplar
                .map(doc => ({
                    label: doc.data().groupName,
                    value: doc.id,
                }));
            setGroups(groupList);
        } catch (error) {
            // Hata durumunda grupları boş bırak
            setGroups([]);
        } finally {
            setTimeout(() => setGroupsLoading(false), 1000);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [isVisible]);

    // Fotoğrafları Firebase Storage'a yükle
    const uploadPhotos = async () => {
        const userId = auth().currentUser?.uid;
        if (!userId) {
            console.log('User not logged in');
            return [];
        }
        const uploadedPhotoUrls = [];
        for (const photo of photos) {
            // Eğer zaten bir URL ise tekrar yükleme
            if (photo.startsWith('http')) {
                uploadedPhotoUrls.push(photo);
                continue;
            }
            const storageRef = storage().ref(
                `users/group-photos/${userId}/${Date.now()}-${Math.random()}`,
            );
            await storageRef.putFile(photo);
            const downloadURL = await storageRef.getDownloadURL();
            uploadedPhotoUrls.push(downloadURL);
        }
        return uploadedPhotoUrls;
    };

    const handleCreateGroup = async () => {
        const userId = auth().currentUser?.uid;

        if (!userId || groupName.trim() === '') {
            ToastError(t('error'), t('provide_group_name'));
            return;
        }
        setLoading(true);

        try {
            const uploadedPhotoUrls = await uploadPhotos();
            const groupRef = firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .doc();

            await groupRef.set({
                createdAt: firestore.FieldValue.serverTimestamp(),
                userId,
                groupName,
                parentGroupId: parentGroupId || null,
                photos: uploadedPhotoUrls, // Fotoğraf opsiyonel, boş olabilir
            });

            setGroupName('');
            setParentGroupId(null);
            setPhotos([]);
            onClose();
            onGroupCreated();
            ToastSuccess(t('success'), t('group_created_successfully'));

        } catch (error) {
            console.log('Error creating group: ', error);
            ToastError(t('error'), t('error_creating_group'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <CModal
            visible={isVisible}
            onClose={onClose}
            modalTitle={t('new_group')}
            width={"100%"}
            height={Platform.OS === "ios" ? "93%" : "99%"}
            justifyContent={"flex-end"}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
        >
            <View style={{ flexDirection: "row", gap: responsive(10) }}>
                <CPhotosAdd
                    width={isTablet ? responsive(65) : responsive(85)}
                    height={isTablet ? responsive(65) : responsive(85)}
                    imageBorderRadius={5}
                    borderRadius={10}
                    imgSource={images.defaultPhoto}
                    photos={photos}
                    setPhotos={setPhotos}
                />
                <View style={{ flex: 1, marginTop: responsive(5) }}>
                    <CTextInput
                        required
                        label={t('group_name')}
                        value={groupName}
                        onChangeText={setGroupName}
                        placeholder={t('enter_group_name')}
                        maxLength={60}
                    />
                </View>
            </View>

            {groups.length > 0 && (
                <View style={styles.divider}>
                    <CText style={styles.toggleLabel}>{t('select_parent_group')}</CText>
                    {groupsLoading ? (
                        <ActivityIndicator size="large" color={colors.DARK_GRAY} />
                    ) : (
                        <CDropdown
                            data={groups}
                            value={parentGroupId ?? ''}
                            onChange={(item) => setParentGroupId(item.value)}
                            placeholder={t('select_parent_group_optional')}
                        />
                    )}
                </View>
            )}
            <CButton
                title={t('create_group')}
                onPress={handleCreateGroup}
                loading={loading}
            />
        </CModal>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    divider: {
        paddingVertical: responsive(10),
        marginVertical: responsive(10),
        borderTopWidth: 1,
        borderColor: colors.STROKE_COLOR,
    },
    toggleLabel: {
        fontWeight: '600',
        color: colors.TEXT_MAIN_COLOR,
        marginBottom: responsive(7),
    },
});
export default AddGroupsModal; 