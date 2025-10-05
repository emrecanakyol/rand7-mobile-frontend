import React, { useState } from "react";
import { View, StyleSheet, Image, Modal, TouchableOpacity, Pressable, Text, Dimensions } from "react-native";
import { useTheme } from "../../utils/colors";
import { responsive } from "../../utils/responsive";
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Entypo from "react-native-vector-icons/Entypo";

interface CImageProps {
    imgSource: any;
    width?: number;
    height?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    imageBorderRadius?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    disablePress?: boolean;
}

const CImage: React.FC<CImageProps> = ({
    imgSource,
    width,
    height,
    borderRadius,
    imageBorderRadius,
    borderWidth,
    borderColor,
    resizeMode,
    disablePress,
}) => {
    const { colors } = useTheme();
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const isTablet = Math.min(screenWidth, screenHeight) >= 600;
    const styles = getStyles(colors);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View
            style={[
                styles.imageContainer,
                {
                    width: width ? width : responsive(100),
                    height: height ? height : responsive(100),
                    borderRadius: borderRadius ? borderRadius : responsive(7),
                },
            ]}
        >
            {loading && (
                <SkeletonPlaceholder
                    borderRadius={imageBorderRadius ? imageBorderRadius : responsive(7)}
                    speed={1000}
                >
                    <SkeletonPlaceholder.Item
                        width={width ? width : responsive(100)}
                        height={height ? height : responsive(100)}
                        borderRadius={imageBorderRadius ? imageBorderRadius : responsive(7)}
                        borderColor={borderColor ? borderColor : "#fff"}
                        borderWidth={borderWidth ? borderWidth : 0}
                    />
                </SkeletonPlaceholder>
            )}
            <TouchableOpacity
                disabled={disablePress}
                activeOpacity={0.8}
                style={{ position: 'absolute', top: 0, left: 0 }}
                onPress={() => setModalVisible(true)}
            >
                <Image
                    source={imgSource}
                    style={[
                        {
                            borderRadius: imageBorderRadius ? imageBorderRadius : responsive(7),
                            borderWidth: borderWidth ? borderWidth : 0,
                            borderColor: borderColor ? borderColor : "#fff",
                            width: width ? width : responsive(100),
                            height: height ? height : responsive(100),
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        },
                    ]}
                    resizeMode={resizeMode ? resizeMode : 'contain'}
                    onLoadEnd={() => setLoading(false)}
                />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View
                    style={styles.modalContainer}
                >
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Entypo name="cross" size={isTablet ? 30 : 20} color={colors.WHITE_COLOR} />
                    </TouchableOpacity>

                    <Image
                        source={imgSource}
                        style={{
                            width: responsive(300),
                            height: responsive(300),
                            borderRadius: responsive(7),
                        }}
                        resizeMode={resizeMode ? resizeMode : 'contain'}
                    />
                </View>
            </Modal>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        imageContainer: {
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
        },
        modalContainer: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        closeButton: {
            position: 'absolute',
            top: responsive(60),
            right: responsive(30),
            zIndex: 2,
            backgroundColor: colors.BLACK_COLOR,
            borderRadius: responsive(30),
            padding: responsive(4),
            marginTop: responsive(10),
        },
    });

export default CImage; 