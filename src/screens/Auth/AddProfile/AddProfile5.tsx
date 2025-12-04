import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../utils/colors";
import { responsive } from "../../../utils/responsive";
import CButton from "../../../components/CButton";
import CText from "../../../components/CText/CText";
import { ADD_PROFILE_6 } from "../../../navigators/Stack";
import CustomBackButton from "../../../components/CBackButton";
import { useTranslation } from "react-i18next";

const AddProfile5 = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [lookingFor, setLookingFor] = useState<string | null>(null);

    const next = () =>
        navigation.navigate(ADD_PROFILE_6, {
            ...route.params,
            lookingFor,
        });

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View>
                <CustomBackButton />

                <CText style={styles.title}>{t("looking_for_title")}</CText>

                <CText style={styles.description}>
                    {t("looking_for_description")}
                </CText>

                <CButton
                    title={t("male")}
                    onPress={() => setLookingFor("male")}
                    backgroundColor={lookingFor === "male" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={lookingFor === "male" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />

                <CButton
                    title={t("female")}
                    onPress={() => setLookingFor("female")}
                    backgroundColor={lookingFor === "female" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={lookingFor === "female" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />

                <CButton
                    title={t("both")}
                    onPress={() => setLookingFor("both")}
                    backgroundColor={lookingFor === "both" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={lookingFor === "both" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />
            </View>

            <View style={styles.btnContainer}>
                <CButton
                    title={t("next")}
                    disabled={!lookingFor}
                    onPress={next}
                    style={styles.btnStyle}
                />
            </View>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: responsive(20),
            backgroundColor: colors.BACKGROUND_COLOR,
            justifyContent: "space-between",
        },
        title: {
            fontSize: responsive(28),
            fontWeight: "700",
            color: colors.TEXT_MAIN_COLOR,
            marginTop: responsive(50),
            marginBottom: responsive(8),
        },
        description: {
            fontSize: responsive(16),
            color: colors.GRAY_COLOR,
            marginBottom: responsive(25),
        },
        optionButton: {
            marginBottom: responsive(10),
        },
        btnContainer: {
            marginTop: responsive(50),
            marginBottom: responsive(10),
            alignItems: "flex-end",
        },
        btnStyle: {
            width: responsive(80),
        },
    });

export default AddProfile5;
