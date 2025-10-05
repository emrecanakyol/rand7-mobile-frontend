import { createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

const colorScheme = Appearance.getColorScheme();

const initialState = {
    // isDarkMode: colorScheme === "light",
    isDarkMode: false, //Dark modu kapattık ki uygulama her açıldığında light modda açılsın
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.isDarkMode = !state.isDarkMode;
        },
        setDarkMode: (state, action) => {
            state.isDarkMode = action.payload;
        },
    },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
