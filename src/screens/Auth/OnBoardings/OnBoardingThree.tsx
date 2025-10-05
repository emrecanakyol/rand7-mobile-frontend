import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { useTheme } from '../../../utils/colors';
import { responsive } from '../../../utils/responsive';
import images from '../../../assets/image/images';
import { useNavigation } from '@react-navigation/native';
import { EMAIL_LOGIN, ONEBOARDINGOTHREE } from '../../../navigators/Stack';
import CText from '../../../components/CText/CText';
import CImage from '../../../components/CImage';
import { useTranslation } from 'react-i18next';

const OnBoardingThree = () => {
    const navigation: any = useNavigation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <View style={styles.inContainer}>

                <View style={styles.logoContainer}>
                    <CImage
                        imgSource={images.logoBlack}
                        width={responsive(40)}
                        height={responsive(40)}
                        borderRadius={responsive(10)}
                        imageBorderRadius={responsive(10)}
                        disablePress={true}
                    />
                    <View>
                        <CText style={styles.logoTitle}>Reminder</CText>
                        <CText style={styles.logoTitle}>Notifications</CText>
                    </View>
                </View>

                <View style={styles.titleContainer}>
                    <CText style={styles.title}>{t('onboarding3_title')}</CText>
                    <CText>{t('onboarding3_description')}</CText>
                </View>

                <View style={{ flex: 1, justifyContent: "center" }}>
                    <View style={styles.contentPhotoContainer}>
                        <CImage
                            imgSource={isTablet ? images.onBoardingThreeTablet : images.onBoardingThree}
                            width={responsive(385)}
                            height={responsive(350)}
                            resizeMode="cover"
                            disablePress={true}
                        />
                    </View>
                </View>

                <View style={styles.btnContainer}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <CText style={styles.backBtnText}>{t('back')}</CText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate(EMAIL_LOGIN)}>
                        <CText style={styles.nextBtnText}>{t('login')}</CText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    inContainer: {
        flexGrow: 1,
        padding: responsive(20),
        justifyContent: "space-between",
    },
    dropdown: {
        height: responsive(50),
        borderColor: colors.GRAY_COLOR,
        borderWidth: 1,
        borderRadius: responsive(8),
        paddingHorizontal: responsive(8),
        marginTop: responsive(5),
    },
    logoContainer: {
        gap: responsive(10),
        height: responsive(40),
        flexDirection: "row",
        alignItems: "center",
    },
    logoTitle: {
        fontWeight: "600",
        color: colors.BLACK_COLOR,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: colors.TEXT_MAIN_COLOR,
    },
    titleContainer: {
        gap: responsive(10),
        marginVertical: responsive(20),
    },
    contentPhotoContainer: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: responsive(7),
    },
    btnContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: responsive(10),
    },
    nextBtn: {
        padding: isTablet ? responsive(10) : responsive(13),
        borderRadius: responsive(7),
        alignItems: "center",
        justifyContent: "center",
        width: responsive(190),
        backgroundColor: colors.BLACK_COLOR,
    },
    nextBtnText: {
        color: colors.WHITE_COLOR,
        fontWeight: "600",
    },
    backBtn: {
        borderWidth: 1.5,
        borderColor: colors.BLACK_COLOR,
        padding: isTablet ? responsive(10) : responsive(13),
        borderRadius: responsive(7),
        alignItems: "center",
        justifyContent: "center",
        width: responsive(190),
    },
    backBtnText: {
        color: colors.TEXT_MAIN_COLOR,
        fontWeight: "600",
    },

});

export default OnBoardingThree