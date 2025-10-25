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
    modalTitle?: string;
    width?: any;
    height?: any;
    children?: React.ReactNode;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    animationType?: 'none' | 'slide' | 'fade';
    paddingTop?: number;
    closeButton?: boolean;
}

const CustomModal = ({
    visible,
    onClose,
    justifyContent,
    modalTitle,
    width = "100%",
    height = "100%",
    borderBottomLeftRadius,
    borderBottomRightRadius,
    children,
    animationType,
    paddingTop = 60,
    closeButton = true,
}: CustomModalProps) => {
    const { colors } = useTheme();
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const isTablet = Math.min(screenWidth, screenHeight) >= 600;
    const styles = getStyles(colors, isTablet);
    return (
        <Modal
            animationType={animationType ?? "slide"}
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View
                style={[
                    styles.overlay,
                    {
                        paddingTop,
                        justifyContent
                    },
                ]}
            >
                <View style={[styles.modalContainer, {
                    width,
                    height,
                    borderBottomLeftRadius,
                    borderBottomRightRadius,
                }]}>
                    <View style={[styles.modalHeader, { justifyContent: closeButton ? "space-between" : "center" }]}>
                        <CText style={styles.modalTitle}>{modalTitle}</CText>
                        {closeButton && (
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Entypo name="cross" size={isTablet ? 30 : 20} color={colors.WHITE_COLOR} />
                            </TouchableOpacity>
                        )}
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
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalContainer: {
        padding: 24,
        backgroundColor: colors.BACKGROUND_COLOR,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: isTablet ? 36 : 20,
        fontWeight: 'bold',
        color: colors.TEXT_MAIN_COLOR,
    },
    closeButton: {
        backgroundColor: colors.BLACK_COLOR,
        borderRadius: responsive(50),
        padding: responsive(4),
    },
});

export default CustomModal;
