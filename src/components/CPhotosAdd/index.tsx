import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { useTheme } from "../../utils/colors";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ImagePicker from "react-native-image-crop-picker";
import { responsive } from "../../utils/responsive";
import Entypo from "react-native-vector-icons/Entypo";
import { useTranslation } from "react-i18next";
import CText from "../CText/CText";
import Icon from "react-native-vector-icons/Feather";

interface CPhotosAddProps {
  index: number;
  imgSource?: any;
  photos: string[];
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  setPhotos: (photos: string[]) => void;
  width?: number;
  height?: number;
  borderWidth?: number;
  borderRadius?: number;
  imageBorderRadius?: number;
}

const CPhotosAdd: React.FC<CPhotosAddProps> = ({
  index,
  imgSource,
  photos,
  setPhotos,
  borderWidth,
  resizeMode,
  width = 100,
  height = 100,
  borderRadius = 14,
  imageBorderRadius = 14,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isTablet = Math.min(screenWidth, screenHeight) >= 600;
  const styles = getStyles(colors);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (photos[index]) {
      setSelectedPhoto(photos[index]);
    }
  }, [photos, index]);

  const selectImages = async () => {
    try {
      const response = await ImagePicker.openPicker({
        mediaType: "photo",
        multiple: false,
        compressImageQuality: 0.5,
        height: 1600,
        width: 1200,
        cropping: true,
        cropperToolbarTitle: t("edit"),
        includeBase64: false,
      });

      if (response) {
        const uri = response.path;
        const updated = [...photos];
        updated[index] = uri;
        setPhotos(updated);
      }
    } catch (error) {
      console.log("Error selecting image:", error);
    }
  };

  const takePhoto = async () => {
    try {
      const response = await ImagePicker.openCamera({
        mediaType: "photo",
        multiple: false,
        compressImageQuality: 0.5,
        height: 1600,
        width: 1200,
        cropping: true,
        cropperToolbarTitle: t("edit"),
        includeBase64: false,
      });

      if (response) {
        const uri = response.path;
        const updated = [...photos];
        updated[index] = uri;
        setPhotos(updated);
      }
    } catch (error) {
      console.log("Error taking photo:", error);
    }
  };

  const showAlert = () => {
    Alert.alert(
      t("photo"),
      t("photo_alert_message"),
      [
        { text: t("select_from_gallery"), onPress: selectImages },
        { text: t("camera"), onPress: takePhoto },
        { text: t("cancel"), onPress: () => { }, style: "cancel" },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.imageWrapper,
          {
            width,
            height,
            borderRadius,
            borderWidth,
            borderColor: colors.GRAY_COLOR,
          },
        ]}
      >
        {selectedPhoto ? (
          <>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(true)}
              style={{ width: "100%", height: "100%" }}
            >
              <Image
                source={{ uri: selectedPhoto }}
                style={[
                  styles.image,
                  {
                    borderRadius: imageBorderRadius,
                    resizeMode: resizeMode
                  },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.cameraButton,
                { backgroundColor: colors.BLACK_COLOR },
              ]}
              activeOpacity={0.7}
              onPress={showAlert}
            >
              <MaterialIcons name="camera-alt" size={isTablet ? 24 : 20} color={colors.WHITE_COLOR} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={showAlert}
          >
            <Icon name="plus" size={20} color={colors.GRAY_COLOR} />
            <CText style={styles.addText}>{t("add")}</CText>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={styles.modalContainer}
        >
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Entypo name="cross" size={20} color={colors.WHITE_COLOR} />
          </TouchableOpacity>
          <Image
            source={selectedPhoto ? { uri: selectedPhoto } : imgSource}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
    },
    imageWrapper: {
      backgroundColor: colors.LIGHT_GRAY,
      borderWidth: 4,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    addText: {
      marginTop: 4,
      color: colors.GRAY_COLOR,
      fontWeight: "500",
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    cameraButton: {
      position: "absolute",
      bottom: 5,
      right: 5,
      padding: 5,
      borderRadius: 20,
    },
    modalImage: {
      width: 300,
      height: 300,
      borderRadius: 12,
      marginBottom: 16,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    closeButton: {
      position: 'absolute',
      top: responsive(40),
      right: responsive(30),
      zIndex: 2,
      backgroundColor: colors.BLACK_COLOR,
      borderRadius: responsive(30),
      padding: responsive(4),
    },
  });

export default CPhotosAdd;
