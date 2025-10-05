import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { responsive } from '../../utils/responsive';
import { useTheme } from '../../utils/colors';
import CText from '../CText/CText';
import Entypo from 'react-native-vector-icons/Entypo';

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    justifyContent?: 'flex-start' | 'center' | 'flex-end';
    modalTitle: string;
    width: any;
    height: any;
    children?: React.ReactNode;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    animationType?: 'none' | 'slide' | 'fade';
}

const CustomModal = ({
    visible,
    onClose,
    justifyContent,
    modalTitle,
    width,
    height,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    children,
    animationType
}: CustomModalProps) => {
    const { colors } = useTheme();
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const isTablet = Math.min(screenWidth, screenHeight) >= 600;
    const styles = getStyles(colors, isTablet);
    return (
        <Modal
            animationType={animationType ?? "fade"}
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { justifyContent }]}>
                <View style={[styles.modalContainer, {
                    width,
                    height,
                    borderBottomLeftRadius,
                    borderBottomRightRadius,
                }]}>
                    <View style={styles.modalHeader}>
                        <CText style={styles.modalTitle}>{modalTitle}</CText>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Entypo name="cross" size={isTablet ? 30 : 20} color={colors.WHITE_COLOR} />
                        </TouchableOpacity>
                    </View>

                    {children}
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        padding: responsive(20),
        backgroundColor: colors.BACKGROUND_COLOR,
        borderTopLeftRadius: responsive(15),
        borderTopRightRadius: responsive(15),
    },
    modalHeader: {
        marginBottom: responsive(20),
    },
    modalTitle: {
        marginTop: responsive(15),
        fontSize: isTablet ? 36 : 20,
        fontWeight: 'bold',
        color: colors.TEXT_MAIN_COLOR,
        borderBottomWidth: 0.5,
        borderColor: colors.GRAY_COLOR,
        paddingBottom: responsive(25),
    },
    closeButton: {
        position: 'absolute',
        top: responsive(12),
        right: responsive(0),
        backgroundColor: colors.BLACK_COLOR,
        borderRadius: responsive(50),
        padding: responsive(4),
    },
});

export default CustomModal;
