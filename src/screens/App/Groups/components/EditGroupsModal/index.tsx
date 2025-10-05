import React, { useState, useEffect } from 'react';
import { responsive } from '../../../../../utils/responsive';
import CModal from '../../../../../components/CModal';
import CTextInput from '../../../../../components/CTextInput';
import CButton from '../../../../../components/CButton';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ToastError, ToastSuccess } from '../../../../../utils/toast';
import { View, StyleSheet, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../../../utils/colors';
import CText from '../../../../../components/CText/CText';
import CPhotosAdd from '../../../../../components/CPhotosAdd';
import images from '../../../../../assets/image/images';
import storage from '@react-native-firebase/storage';
import { useTranslation } from 'react-i18next';
import CDropdown from '../../../../../components/CDropdown';

interface EditGroupsModalProps {
    isVisible: boolean;
    onClose: () => void;
    onGroupUpdated: () => void;
    editingGroup: { id: string; name: string } | null;
}

const EditGroupsModal: React.FC<EditGroupsModalProps> = ({
    isVisible,
    onClose,
    onGroupUpdated,
    editingGroup
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors);
    const [editGroupName, setEditGroupName] = useState(editingGroup?.name || '');
    const [editLoading, setEditLoading] = useState(false);
    const [dropdownGroups, setDropdownGroups] = useState<{ label: string; value: string }[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isSubGroup, setIsSubGroup] = useState(false);
    const [groupInfoLoading, setGroupInfoLoading] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);

    const fetchGroupInfo = async () => {
        if (!editingGroup) return;
        setGroupInfoLoading(true);
        const userId = auth().currentUser?.uid;
        if (!userId) {
            setTimeout(() => setGroupInfoLoading(false), 1000);
            return;
        }
        const doc = await firestore()
            .collection('users')
            .doc(userId)
            .collection('groups')
            .doc(editingGroup.id)
            .get();
        const data = doc.data();
        const parentId = data?.parentGroupId || null;

        setIsSubGroup(!!parentId);
        setSelectedGroupId(parentId);
        // Eğer ana grup ise alt grupları, alt grup ise ana grupları getir
        if (!parentId) {
            // Ana grup: alt grupları getir
            const snapshot = await firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .where('parentGroupId', '==', editingGroup.id)
                .get();
            setDropdownGroups(snapshot.docs.map(doc => ({ label: doc.data().groupName, value: doc.id })));
        } else {
            // Alt grup: ana grupları getir
            const snapshot = await firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .where('parentGroupId', '==', null)
                .get();
            setDropdownGroups(snapshot.docs
                .filter(doc => doc.id !== editingGroup.id) // kendisi hariç
                .map(doc => ({ label: doc.data().groupName, value: doc.id })));
        }
        setTimeout(() => setGroupInfoLoading(false), 1000);
    };

    useEffect(() => {
        if (editingGroup) {
            setEditGroupName(editingGroup.name);
            fetchGroupInfo();
            fetchGroupPhotos();
        }
    }, [editingGroup]);

    // Grup fotoğraflarını Firestore'dan çek
    const fetchGroupPhotos = async () => {
        if (!editingGroup) return;
        const userId = auth().currentUser?.uid;
        if (!userId) return;
        const doc = await firestore()
            .collection('users')
            .doc(userId)
            .collection('groups')
            .doc(editingGroup.id)
            .get();
        const data = doc.data();
        setPhotos(data?.photos || []);
    };

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

    const handleUpdateGroup = async () => {
        if (!editingGroup || editGroupName.trim() === '') {
            ToastError(t('error'), t('provide_group_name'));
            return;
        }
        setEditLoading(true);
        try {
            const userId = auth().currentUser?.uid;
            if (!userId) {
                ToastError(t('error'), t('user_not_logged_in'));
                return;
            }
            const updateData: any = { groupName: editGroupName };
            if (isSubGroup) {
                updateData.parentGroupId = selectedGroupId || null;
            }
            // Fotoğrafları yükle ve güncelle
            const uploadedPhotoUrls = await uploadPhotos();
            updateData.photos = uploadedPhotoUrls;
            await firestore()
                .collection('users')
                .doc(userId)
                .collection('groups')
                .doc(editingGroup.id)
                .update(updateData);
            ToastSuccess(t('success'), t('group_updated_successfully'));
            onClose();
            onGroupUpdated();
        } catch (error) {
            ToastError(t('error'), t('failed_to_update_group'));
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <CModal
            visible={isVisible}
            onClose={onClose}
            modalTitle={t('edit_group')}
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
                        value={editGroupName}
                        onChangeText={setEditGroupName}
                        placeholder={t('enter_group_name')}
                        maxLength={60}
                    />
                </View>
            </View>
            {editingGroup && isSubGroup && (
                <View style={styles.divider}>
                    <CText style={styles.toggleLabel}>{t('select_parent_group')}</CText>
                    {groupInfoLoading ? (
                        <ActivityIndicator size="large" color={colors.DARK_GRAY} />
                    ) : (
                        <CDropdown
                            data={dropdownGroups}
                            value={selectedGroupId ?? ""}
                            onChange={item => setSelectedGroupId(item.value)}
                            placeholder={t('select_parent_group')}
                        />
                    )}
                </View>
            )}
            <CButton
                title={t('update_group')}
                onPress={handleUpdateGroup}
                loading={editLoading}
            />
        </CModal>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    placeholderStyle: {
        fontSize: 16,
        color: colors.TEXT_DESCRIPTION_COLOR,
    },
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

export default EditGroupsModal; 