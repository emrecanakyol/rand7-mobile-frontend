import { View, StyleSheet, Alert, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'
import DetailHeaders from '../../../../components/DetailHeaders'
import { useTheme } from '../../../../utils/colors'
import CButton from '../../../../components/CButton'
import { responsive } from '../../../../utils/responsive'
import CTextInput from '../../../../components/CTextInput'
import { useTranslation } from 'react-i18next'
import { ToastError, ToastSuccess } from '../../../../utils/toast'

const AddHelp = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();
    const [contactEmail, setContactEmail] = useState<string>('');
    const [documentId, setDocumentId] = useState<string | null>(null);

    const fetchHelp = async () => {
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
                setDocumentId(doc.id);
            }
        } catch (error) {
            console.log('Veri getirme hatası:', error);
        }
    };

    useEffect(() => {
        fetchHelp();
    }, []);

    const handleAddOrUpdateHelp = async () => {
        if (!contactEmail.trim()) {
            ToastError(t('warning'), t('fill_all_fields'));
            return;
        }

        try {
            if (documentId) {
                // ✏️ Güncelle
                await firestore().collection('helps').doc(documentId).update({
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    contactEmail: contactEmail.trim(),
                });
                ToastSuccess(t('success'), t('help_update_success'));
            } else {
                // ➕ Yeni ekle
                const docRef = await firestore().collection('helps').add({
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    contactEmail: contactEmail.trim(),
                });
                setDocumentId(docRef.id);
                ToastSuccess(t('success'), t('help_add_success'));
            }
        } catch (error) {
            console.log('Veri kaydetme/güncelleme hatası:', error);
            ToastError(t('error'), t('help_save_error'));
        }
    };

    return (
        <View style={styles.container}>
            <DetailHeaders title={t('add_help_title')} />
            <ScrollView contentContainerStyle={styles.content}>
                <CTextInput
                    required
                    label={t('contact_developer')}
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    placeholder={t('contact_email_placeholder')}
                    maxLength={200}
                />
                <CButton
                    title={documentId ? t('update') : t('save')}
                    onPress={handleAddOrUpdateHelp}
                />
            </ScrollView>
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    content: {
        padding: responsive(16),
    },
});

export default AddHelp;
