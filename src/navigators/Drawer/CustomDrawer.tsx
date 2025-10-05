import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ImageBackground, Platform, Dimensions } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useTheme } from "../../utils/colors";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import firestore from '@react-native-firebase/firestore';
import auth from "@react-native-firebase/auth";
import { responsive } from "../../utils/responsive";
import CText from "../../components/CText/CText";
import { EDIT_PROFILE, ONEBOARDINGONE } from "../Stack";
import { signOut } from "../../store/services/authServices";
import images from '../../assets/image/images';
import CButton from "../../components/CButton";
import Icon from 'react-native-vector-icons/MaterialIcons';
import CImage from "../../components/CImage";
import { ADMIN } from "../../utils/constants/Admin";
import { useTranslation } from 'react-i18next';

// CustomDrawerItem.js
export const CustomDrawerItem = ({
    label,
    focused,
    onPress,
    rightArrow,
}: any) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: responsive(15),
                paddingHorizontal: responsive(20),
                height: "auto",
            }}
        >
            <CText
                style={{
                    flex: 1,
                    fontWeight: "500",
                }}
            >
                {label}
            </CText>
            <View>{rightArrow}</View>
        </TouchableOpacity>
    );
};

const CustomDrawer = (props: any) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const [data, setData] = useState<any>(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const editOnPress = () => {
        navigation.navigate(EDIT_PROFILE);
    };

    const handleSignOut = async () => {
        try {
            await signOut(dispatch);
            await navigation.navigate(ONEBOARDINGONE);
        } catch (error) {
            console.log('Sign Out Error:', error);
        }
    };

    const fetchUserDatas = async () => {
        const user = auth().currentUser;
        const userId = user?.uid;
        if (userId) {
            try {
                const userDoc: any = await firestore().collection("users").doc(userId).get();
                if (userDoc.exists) {
                    const userData: any = userDoc.data();
                    setData(userData);
                }
                // Eğer email ile giriş yapıldı ise 
                // Firestore email ile onaylanmış olan auth email farklıysa firestoredeki emaili güncelle. Kısaca emailler farlı ise sadece firestorede güncelliyor.
                // Değiştirdiği yeni emaili onaylamadan (verification olmadan) zaten giriş yapamaz.
                if (auth().currentUser?.providerData[0].providerId !== "phone") {
                    if (data?.email !== user?.email) {
                        await firestore()
                            .collection('users')
                            .doc(userId)
                            .set({
                                email: user.email,
                            }, { merge: true });
                        // güncel veri tekrar çek
                        const updatedDoc = await firestore().collection("users").doc(userId).get();
                        setData(updatedDoc.data());
                    }
                }
            } catch (error) {
                console.log("Error fetching user data: ", error);
            }
        } else {
            console.log("User not logged in");
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserDatas();
        }, [])
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.BACKGROUND_COLOR }}>
            <ImageBackground
                source={images.defaultDrawerBackground}
                style={styles.flexOneView}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.profilePictureView}>
                    <CImage
                        imgSource={
                            data?.photos && data.photos.length > 0
                                ? { uri: data.photos[data.photos.length - 1] }
                                : images.defaultProfilePhoto
                        }
                        width={isTablet ? responsive(60) : responsive(80)}
                        height={isTablet ? responsive(60) : responsive(80)}
                        borderRadius={responsive(100)}
                        imageBorderRadius={responsive(100)}
                        borderWidth={responsive(3)}
                    />
                </View>
                <View style={styles.nameFlexView}>
                    <View style={styles.nameView}>
                        <CText style={styles.name}>
                            {data?.firstName} {data?.lastName}
                        </CText>
                        <CText style={styles.numberText}>
                            {data?.phoneNumber}
                            {data?.email}
                        </CText>
                    </View>
                    <TouchableOpacity style={styles.editView} onPress={editOnPress}>
                        <Icon name="edit" size={24} color={"#fff"} />
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            {/*  drawer items */}
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.contentContainerStyle}
            >
                <View>
                    <CustomDrawerItem
                        label={props.state.routeNames[0]}
                        focused={props.state.index === 0}
                        onPress={() => props.navigation.navigate(props.state.routeNames[0])}
                        rightArrow={<Icon name="chevron-right" size={24} color={colors.TEXT_MAIN_COLOR} />}
                    />
                    <CustomDrawerItem
                        label={props.state.routeNames[1]}
                        focused={props.state.index === 1}
                        onPress={() => props.navigation.navigate(props.state.routeNames[1])}
                        rightArrow={<Icon name="chevron-right" size={24} color={colors.TEXT_MAIN_COLOR} />}
                    />
                    <CustomDrawerItem
                        label={props.state.routeNames[2]}
                        focused={props.state.index === 2}
                        onPress={() => props.navigation.navigate(props.state.routeNames[2])}
                        rightArrow={<Icon name="chevron-right" size={24} color={colors.TEXT_MAIN_COLOR} />}
                    />
                    <CustomDrawerItem
                        label={props.state.routeNames[3]}
                        focused={props.state.index === 3}
                        onPress={() => props.navigation.navigate(props.state.routeNames[3])}
                        rightArrow={<Icon name="chevron-right" size={24} color={colors.TEXT_MAIN_COLOR} />}
                    />
                    <CustomDrawerItem
                        label={props.state.routeNames[4]}
                        focused={props.state.index === 4}
                        onPress={() => props.navigation.navigate(props.state.routeNames[4])}
                        rightArrow={<Icon name="chevron-right" size={24} color={colors.TEXT_MAIN_COLOR} />}
                    />
                    {ADMIN && (
                        // <CustomDrawerItem
                        //     label={props.state.routeNames[5]}
                        //     focused={props.state.index === 5}
                        //     onPress={() => props.navigation.navigate(props.state.routeNames[5])}
                        //     rightArrow={<Icon name="chevron-right" size={24} color={colors.TEXT_MAIN_COLOR} />}
                        // />
                        <></>
                    )}
                </View>

                <View>
                    <CButton
                        title={t('sign_out')}
                        onPress={() => {
                            Alert.alert(
                                t('sign_out'),
                                t('sign_out_confirm'),
                                [
                                    {
                                        text: t('cancel'),
                                        style: "cancel"
                                    },
                                    {
                                        text: t('yes'),
                                        onPress: handleSignOut,
                                        style: "destructive"
                                    }
                                ]
                            );
                        }}
                    />
                    <CText style={styles.versionText}>{"© remindernotifications"}</CText>
                </View>

            </DrawerContentScrollView>

        </View>
    );
};

export default CustomDrawer;

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    contentContainerStyle: {
        flex: 1,
        justifyContent: "space-between"
    },
    flexOneView: {
        padding: responsive(20),
        paddingTop: Platform.OS === "ios" ? responsive(50) : responsive(20),
    },
    backgroundImage: {
        resizeMode: "cover",
    },
    img: {
        height: responsive(80),
        width: responsive(80),
        borderColor: colors.WHITE_COLOR,
        borderWidth: responsive(3),
        borderRadius: responsive(100),
    },
    profilePictureView: {
        marginTop: isTablet ? 0 : responsive(38),
    },
    nameFlexView: {
        flexDirection: "row",
        marginVertical: responsive(15),
    },
    nameView: {
        flex: 1,
    },
    editView: {
        alignSelf: "center",
    },
    name: {
        marginBottom: responsive(2),
        color: "#fff",
    },
    numberText: {
        fontWeight: "500",
        color: "#fff",
    },
    versionText: {
        color: colors.TEXT_MAIN_COLOR,
        fontSize: isTablet ? 16 : 14,
        alignSelf: "center",
    }
});
