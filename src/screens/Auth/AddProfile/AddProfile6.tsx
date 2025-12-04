import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../utils/colors";
import { responsive } from "../../../utils/responsive";
import CButton from "../../../components/CButton";
import CText from "../../../components/CText/CText";
import CustomBackButton from "../../../components/CBackButton";
import { ADD_PROFILE_7 } from "../../../navigators/Stack";
import { useTranslation } from "react-i18next";

const AddProfile6 = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [relationshipType, setRelationshipType] = useState<string | null>(null);

    const next = () =>
        navigation.navigate(ADD_PROFILE_7, {
            ...route.params,
            relationshipType,
        });

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View>
                <CustomBackButton />

                <CText style={styles.title}>{t("relationship_question_title")}</CText>

                <CText style={styles.description}>
                    {t("relationship_question_description")}
                </CText>

                <CButton
                    title={t("relationship_long")}
                    onPress={() => setRelationshipType("long")}
                    backgroundColor={relationshipType === "long" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={relationshipType === "long" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />

                <CButton
                    title={t("relationship_short")}
                    onPress={() => setRelationshipType("short")}
                    backgroundColor={relationshipType === "short" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={relationshipType === "short" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />

                <CButton
                    title={t("relationship_friendship")}
                    onPress={() => setRelationshipType("friendship")}
                    backgroundColor={relationshipType === "friendship" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={relationshipType === "friendship" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />

                <CButton
                    title={t("relationship_chat")}
                    onPress={() => setRelationshipType("chat")}
                    backgroundColor={relationshipType === "chat" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={relationshipType === "chat" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />
            </View>

            <View style={styles.btnContainer}>
                <CButton
                    title={t("next")}
                    disabled={!relationshipType}
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

export default AddProfile6;
