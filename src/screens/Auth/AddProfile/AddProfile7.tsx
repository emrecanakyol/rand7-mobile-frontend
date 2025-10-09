import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../utils/colors";
import { responsive } from "../../../utils/responsive";
import CText from "../../../components/CText/CText";
import CButton from "../../../components/CButton";
import { ADD_PROFILE_8 } from "../../../navigators/Stack";
import CustomBackButton from "../../../components/CBackButton";

const hobbiesList = [
    "🎮 Oyun",
    "💃 Dans",
    "💬 Dil",
    "🎵 Müzik",
    "🎬 Film",
    "📸 Fotoğraf",
    "🏛 Mimari",
    "👗 Moda",
    "📚 Kitap",
    "✍️ Yazmak",
    "🌿 Doğa",
    "🎨 Resim",
    "⚽ Futbol",
    "🙂 İnsanlar",
    "🐼 Hayvanlar",
    "💪 Spor & Fitness",
];

const AddProfile7 = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const [selected, setSelected] = useState<string[]>([]);
    const maxSelection = 5;

    const toggle = (item: string) => {
        setSelected((prev) => {
            if (prev.includes(item)) return prev.filter((x) => x !== item);
            if (prev.length >= maxSelection) return prev;
            return [...prev, item];
        });
    };

    const next = () =>
        navigation.navigate(ADD_PROFILE_8, { ...route.params, hobbies: selected });

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <CustomBackButton />

            <CText style={styles.title}>En fazla 5 ilgi alanı seç</CText>
            <CText style={styles.subtitle}>
                Seni daha iyi tanımamız için ilgi alanlarını seç.
            </CText>

            <ScrollView
                contentContainerStyle={styles.hobbiesContainer}
                showsVerticalScrollIndicator={false}
            >
                {hobbiesList.map((hobby) => {
                    const isSelected = selected.includes(hobby);
                    return (
                        <CButton
                            key={hobby}
                            title={hobby}
                            onPress={() => toggle(hobby)}
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
            </ScrollView>

            <View style={styles.footer}>
                <CText style={styles.progressText}>
                    {selected.length}/{maxSelection}
                </CText>

                <CButton
                    title="İleri"
                    disabled={selected.length === 0}
                    onPress={next}
                    style={styles.nextButton}
                />
            </View>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
            padding: responsive(20),
        },
        title: {
            fontSize: responsive(22),
            fontWeight: "700",
            color: colors.TEXT_MAIN_COLOR,
            textAlign: "center",
            marginTop: responsive(30),
        },
        subtitle: {
            fontSize: responsive(15),
            color: colors.TEXT_SECONDARY_COLOR,
            textAlign: "center",
            marginTop: responsive(6),
            marginBottom: responsive(20),
        },
        hobbiesContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: responsive(10),
            paddingBottom: responsive(100),
        },
        hobbyButton: {
            borderRadius: responsive(25),
            marginVertical: responsive(10),
        },
        footer: {
            position: "absolute",
            bottom: responsive(30),
            left: responsive(20),
            right: responsive(20),
            alignItems: "center",
        },
        progressText: {
            textAlign: "center",
            fontSize: responsive(16),
            fontWeight: "600",
            color: colors.TEXT_MAIN_COLOR,
            marginBottom: responsive(10),
        },
        nextButton: {
            width: "100%",
        },
    });

export default AddProfile7;
