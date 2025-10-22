import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../utils/colors";
import { responsive } from "../../../utils/responsive";
import CText from "../../../components/CText/CText";
import CButton from "../../../components/CButton";
import { ADD_PROFILE_8 } from "../../../navigators/Stack";
import CustomBackButton from "../../../components/CBackButton";
import { categorizedHobbies } from "../../../constants/constant";

const AddProfile7 = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const [selected, setSelected] = useState<string[]>([]);
    const maxSelection = 10;

    const toggle = (item: string) => {
        setSelected((prev) => {
            if (prev.includes(item)) return prev.filter((x) => x !== item);
            if (prev.length >= maxSelection) return prev;
            return [...prev, item];
        });
    };

    const next = () =>
        navigation.navigate(ADD_PROFILE_8, {
            ...route.params,
            hobbies: selected
        });

    const styles = getStyles(colors);

    return (
        <ScrollView >
            <View style={styles.container}>

                <CustomBackButton />

                <View>
                    <CText style={styles.title}>İlgi alanlarını seçebilirsin</CText>
                    <CText style={styles.subtitle}>
                        Neleri sevdiğini bilmek, seni tanımanın en güzel yolu. Hadi, ilgi alanlarını seç ve hikayeni başlat.
                    </CText>
                </View>

                {Object.entries(categorizedHobbies).map(([category, hobbies]) => (
                    <View key={category} style={styles.categoryContainer}>
                        <CText style={styles.categoryTitle}>{category}</CText>

                        <View style={styles.hobbiesContainer}>
                            {hobbies.map((hobby) => {
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
                        </View>
                    </View>
                ))}

                <View style={styles.btnContainer}>
                    <CText style={styles.progressText}>
                        {selected.length}/{maxSelection}
                    </CText>

                    <CButton
                        title="İleri"
                        disabled={selected.length === 0}
                        onPress={next}
                        style={styles.btnStyle}
                    />
                </View>

            </View >
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
        inContainer: {
            backgroundColor: "red",
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
