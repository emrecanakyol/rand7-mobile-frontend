import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import LottieView from 'lottie-react-native';

interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
}

const Loading: React.FC<LoadingOverlayProps> = ({ visible, title }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const styles = getStyles(colors, isDarkMode);

  return (
    <View style={styles.overlay}>
      {/* <ActivityIndicator size="large" color={colors.DARK_GRAY} /> */}
      <LottieView
        source={require("../../assets/lottie/loading-three-dots.json")}
        style={styles.lottie}
        autoPlay
        loop
      />
      <Text style={styles.message}>
        {title || t('loading')}
      </Text>
    </View>
  );
};

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'transparent',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.DARK_GRAY,
    fontWeight: "400",
  },
  lottie: {
    width: 70,
    height: 70,
    alignItems: "center",
  },
});

export default Loading;
