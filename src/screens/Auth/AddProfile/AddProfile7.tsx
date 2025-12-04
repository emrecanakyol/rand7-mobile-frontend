import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../utils/colors";
import { responsive } from "../../../utils/responsive";
import CText from "../../../components/CText/CText";
import CButton from "../../../components/CButton";
import { ADD_PROFILE_8 } from "../../../navigators/Stack";
import CustomBackButton from "../../../components/CBackButton";
import { categorizedHobbies } from "../../../constants/constant";
import { useTranslation } from "react-i18next";

const AddProfile7 = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string[]>([]);
    const maxSelection = 10;

    const toggle = (hobbyKey: string) => {
        setSelected((prev) => {
            if (prev.includes(hobbyKey)) return prev.filter((x) => x !== hobbyKey);
            if (prev.length >= maxSelection) return prev;
            return [...prev, hobbyKey];
        });
    };

    const next = () =>
        navigation.navigate(ADD_PROFILE_8, {
            ...route.params,
            hobbies: selected, // Artık key’ler gidiyor: ["music", "reading", ...]
        });

    const styles = getStyles(colors);

    return (
        <ScrollView>
            <View style={styles.container}>
                <CustomBackButton />

                <View>
                    <CText style={styles.title}>
                        {t("interests_title")}
                    </CText>
                    <CText style={styles.subtitle}>
                        {t("interests_subtitle")}
                    </CText>
                </View>

                {Object.entries(categorizedHobbies).map(([categoryKey, hobbies]) => (
                    <View key={categoryKey} style={styles.categoryContainer}>
                        {/* Kategori başlığı */}
                        <CText style={styles.categoryTitle}>
                            {t(`cat_${categoryKey}`)}
                        </CText>

                        <View style={styles.hobbiesContainer}>
                            {(hobbies as string[]).map((hobbyKey) => {
                                const isSelected = selected.includes(hobbyKey);
                                return (
                                    <CButton
                                        key={hobbyKey}
                                        title={t(`hobby_${hobbyKey}`)}
                                        onPress={() => toggle(hobbyKey)}
                                        backgroundColor={
                                            isSelected ? colors.BLACK_COLOR : colors.WHITE_COLOR
                                        }
                                        textColor={
                                            isSelected ? colors.WHITE_COLOR : colors.TEXT_MAIN_COLOR
                                        }
                                        style={styles.hobbyButton}
                                    />
                                );
                            })}
                        </View>
                    </View>
                ))}

                <View style={styles.btnContainer}>
                    <CText style={styles.progressText}>
                        {selected.length}/{maxSelection}
                    </CText>

                    <CButton
                        title={t("next")}
                        disabled={selected.length === 0}
                        onPress={next}
                        style={styles.btnStyle}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
            padding: responsive(20),
            justifyContent: "space-between",
        },
        title: {
            fontSize: responsive(22),
            fontWeight: "700",
            color: colors.TEXT_MAIN_COLOR,
            marginTop: responsive(30),
        },
        subtitle: {
            fontSize: responsive(15),
            color: colors.TEXT_SECONDARY_COLOR,
            marginTop: responsive(6),
            marginBottom: responsive(30),
        },
        categoryContainer: {
            marginBottom: responsive(25),
        },
        categoryTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: colors.TEXT_MAIN_COLOR,
            marginBottom: responsive(10),
        },
        hobbiesContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            gap: responsive(10),
        },
        hobbyButton: {
            borderRadius: responsive(25),
            marginVertical: responsive(5),
        },
        btnContainer: {
            marginTop: responsive(50),
            marginBottom: responsive(10),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        progressText: {
            textAlign: "center",
            fontSize: 20,
            fontWeight: "600",
            color: colors.TEXT_MAIN_COLOR,
        },
        btnStyle: {
            width: responsive(80),
        },
    });

export default AddProfile7;
