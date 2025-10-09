import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../utils/colors";
import { responsive } from "../../../utils/responsive";
import CButton from "../../../components/CButton";
import CText from "../../../components/CText/CText";
import { ADD_PROFILE_3 } from "../../../navigators/Stack";
import CustomBackButton from "../../../components/CBackButton";

const AddProfile2 = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const { photos, firstName, lastName, birthDate } = route.params;
    const [gender, setGender] = useState<string | null>(null);

    const next = () =>
        navigation.navigate(ADD_PROFILE_3, {
            photos,
            firstName,
            lastName,
            birthDate,
            gender,
        });

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View>
                <CustomBackButton />

                <CText style={styles.title}>Seni en iyi hangi seçenek tanımlar?</CText>

                <CText style={styles.description}>
                    Lütfen seni en iyi tanımlayan seçeneği belirle. Bu bilgi profilinizin doğru şekilde oluşturulmasına yardımcı olur.
                </CText>

                <CButton
                    title="Erkek"
                    onPress={() => setGender("male")}
                    backgroundColor={gender === "male" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={gender === "male" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />

                <CButton
                    title="Kadın"
                    onPress={() => setGender("female")}
                    backgroundColor={gender === "female" ? colors.BLACK_COLOR : colors.WHITE_COLOR}
                    textColor={gender === "female" ? colors.WHITE_COLOR : colors.BLACK_COLOR}
                    style={styles.optionButton}
                />
            </View>

            <View style={styles.btnContainer}>
                <CButton
                    title="İleri"
                    disabled={!gender}
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
            justifyContent: "space-between", // üstte içerik, altta footer
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
        }
    });

export default AddProfile2;
