import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../utils/colors";
import { responsive } from "../../../utils/responsive";
import CButton from "../../../components/CButton";
import CText from "../../../components/CText/CText";
import CustomBackButton from "../../../components/CBackButton";
import { ADD_PROFILE_4 } from "../../../navigators/Stack";
import CDropdown from "../../../components/CDropdown";
import { useTranslation } from "react-i18next";

const AddProfile3 = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [height, setHeight] = useState<string>("");

    const heights = Array.from({ length: 81 }, (_, i) => {
        const rawValue = 140 + i;
        const meters = (rawValue / 100).toFixed(2); // 1.40, 1.75 vb.
        return { label: `${meters} cm`, value: `${rawValue}` };
    });

    const next = () =>
        navigation.navigate(ADD_PROFILE_4, {
            ...route.params,
            height,
        });

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View>
                <CustomBackButton />

                <CText style={styles.title}>{t("height_question_title")}</CText>

                <CText style={styles.description}>
                    {t("height_question_description")}
                </CText>

                <CDropdown
                    data={heights}
                    value={height}
                    onChange={(item) => setHeight(item.value)}
                    placeholder={t("select_height")}
                    containerStyle={styles.dropdownContainer}
                />
            </View>

            <View style={styles.btnContainer}>
                <CButton
                    title={t("next")}
                    disabled={!height}
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
        dropdownContainer: {
            marginBottom: responsive(15),
        },
        btnContainer: {
            alignItems: "flex-end",
            marginBottom: responsive(10),
        },
        btnStyle: {
            width: responsive(80),
        },
    });

export default AddProfile3;
