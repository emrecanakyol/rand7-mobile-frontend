// reducer/userDataReducer.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserDataState {
    userData: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserDataState = {
    userData: null,
    loading: false,
    error: null,
};

const userDataSlice = createSlice({
    name: "userData",
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<any>) => {
            state.userData = action.payload;
            state.loading = false;
            state.error = null;
        },
        clearUserData: (state) => {
            state.userData = null;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setUserData, clearUserData, setLoading, setError } = userDataSlice.actions;
export default userDataSlice.reducer;
