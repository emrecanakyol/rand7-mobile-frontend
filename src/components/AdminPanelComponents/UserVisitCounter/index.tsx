import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import auth from '@react-native-firebase/auth';

const UserVisitsCounter = () => {

    // Veriler günlük olarak kaydediliyor.
    // Her gün sadece 1 cihaz counter +1 arttırabiliyor
    const handleSave = async () => {
        const userId = auth().currentUser?.uid;
        const today = new Date().toLocaleDateString('tr-TR').split('.').reverse().join('-'); // yyyy-mm-dd
        const deviceId = await DeviceInfo.getUniqueId();

        if (userId) {
            try {
                const docRef = firestore()
                    .collection('adminPanel')
                    .doc("userVisits")
                    .collection("daily")
                    .doc(today)
                const doc: any = await docRef.get();
                let data = doc.exists ? doc.data() : null;
                let devices = data?.devices || [];
                let count = data?.count || 0;

                if (devices.includes(deviceId)) {
                    console.log('Uyarı', 'Bu cihaz bugün zaten kayıt yaptı.');
                    return;
                }

                await docRef.set(
                    {
                        createdAt: firestore.FieldValue.serverTimestamp(),
                        count: count + 1,
                        devices: [...devices, deviceId],
                    },
                    { merge: true },
                );
                /* console.log('Başarılı', 'Kayıt başarıyla güncellendi.'); */
            } catch (error) {
                console.log('Hata', 'Kayıt sırasında bir hata oluştu.');
            }
        } else {
            console.log('Hata', 'Kullanıcı giriş yapmamış.');
        }
    };

    useEffect(() => {
        handleSave()
    }, [])

    return null
};

export default UserVisitsCounter;
