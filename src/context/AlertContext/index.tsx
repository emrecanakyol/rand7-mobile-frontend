import React, { createContext, useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../utils/colors';
import CModal from '../../components/CModal';
import CText from '../../components/CText/CText';

type AlertButton = {
    text: string;
    onPress?: () => void;
    type?: 'default' | 'cancel' | 'destructive';
};

type AlertOptions = {
    title: string;
    message?: string;
    buttons: AlertButton[];
    layout?: 'row' | 'column';
};

interface AlertContextProps {
    showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextProps | null>(null);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { colors } = useTheme();
    const [alertData, setAlertData] = useState<AlertOptions | null>(null);
    const [visible, setVisible] = useState(false);

    const showAlert = (options: AlertOptions) => {
        setAlertData(options);
        setVisible(true);
    };

    const closeAlert = () => {
        setVisible(false);
        setAlertData(null);
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}

            {alertData && (
                <CModal
                    visible={visible}
                    onClose={closeAlert}
                    justifyContent="center"
                    width="90%"
                    height={325}
                    borderBottomLeftRadius={30}
                    borderBottomRightRadius={30}
                    closeButton={false}
                    animationType="none"
                >
                    <View style={styles.content}>
                        <CText style={styles.title}>{alertData.title}</CText>

                        {alertData.message && (
                            <CText style={styles.message}>
                                {alertData.message}
                            </CText>
                        )}

                        <View
                            style={[
                                styles.buttons,
                                { flexDirection: alertData.layout ?? 'row' },
                            ]}
                        >
                            {alertData.buttons.map((btn, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        alertData.layout !== 'column' && { flex: 1 },
                                        btn.type === 'destructive' && { backgroundColor: colors.RED_COLOR },
                                        btn.type === 'cancel' && { backgroundColor: colors.BLACK_COLOR },
                                    ]}
                                    onPress={() => {
                                        closeAlert();
                                        btn.onPress?.();
                                    }}
                                >
                                    <CText style={styles.buttonText}>{btn.text}</CText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </CModal>
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return ctx;
};

const styles = StyleSheet.create({
    content: {
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
    },
    buttons: {
        width: '100%',
        marginTop: 16,
        gap: 10,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#000',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
