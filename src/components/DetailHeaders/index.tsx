import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import { responsive } from "../../utils/responsive";
import { useTheme } from "../../utils/colors";
import CText from "../CText/CText";
import CustomBackButton from "../CBackButton";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ADMIN } from "../../constants/Admin";

interface DetailHeadersProps {
    title: string;
    rightIconOnPress?: () => void;
    showRightIcon?: boolean;
    rightIconName?: string;
}

const DetailHeaders = ({
    title,
    rightIconOnPress,
    showRightIcon = false,
    rightIconName,
}: DetailHeadersProps) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    return (
        <View style={styles.header}>
            <CustomBackButton />
            <CText style={styles.headerTitle}>{title}</CText>
            {showRightIcon && rightIconName ? (
                <View style={styles.btnContainer}>
                    {/* Admin özellikleri buraya ekle */}
                    {ADMIN && (
                        <TouchableOpacity
                            style={styles.rightIconButton}
                            onPress={rightIconOnPress}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name={rightIconName} size={isTablet ? 32 : 22} color={colors.BACKGROUND_COLOR} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View style={{ width: 28 }} />
            )}
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center',
        padding: responsive(20),
        borderBottomWidth: 1,
        borderBottomColor: colors.LIGHT_GRAY,
        backgroundColor: colors.WHITE_COLOR,
        shadowColor: colors.BLACK_COLOR,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    btnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsive(10),
    },
    headerTitle: {
        fontSize: isTablet ? 30 : 18,
        fontWeight: '600',
        marginLeft: responsive(8),
        color: colors.BLACK_COLOR,
    },
    rightIconButton: {
        backgroundColor: colors.BLACK_COLOR,
        borderRadius: responsive(50),
        width: isTablet ? responsive(20) : responsive(25),
        height: isTablet ? responsive(20) : responsive(25),
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default DetailHeaders; 