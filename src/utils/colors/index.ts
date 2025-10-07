import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const useTheme = () => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

    const colors = {
        BACKGROUND_COLOR: isDarkMode ? "#0B0E11" : '#F7F7F0',
        TEXT_MAIN_COLOR: isDarkMode ? '#FFF' : "#0B0E11",
        TEXT_DESCRIPTION_COLOR: isDarkMode ? '#B0B0B0' : '#525252',
        STROKE_COLOR: isDarkMode ? '#333' : '#E8E8E8',
        WHITE_COLOR: isDarkMode ? "#0B0E11" : '#FFF',
        BLACK_COLOR: isDarkMode ? "#FFF" : "#0B0E11",

        GREEN_COLOR: "#8F985F",
        RED_COLOR: "#E82251",
        GRAY_COLOR: "#B0B0B0",
        DARK_GRAY: "#808080",
        LIGHT_GRAY: "#F2F2F7",
        YELLOW_COLOR: "#F5C326",
        BLUE_COLOR: "#0e82ff",
        ORANGE_COLOR: "#FF9103",
        ORANGE_COLOR2: '#FFA726',
    };

    return { colors, isDarkMode };
};
