import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PremiumData {
    id: string;
    createdAt: any;
    purchaseToken: string;
    isPremium: boolean;
}

interface PremiumDataState {
    premiumDataList: PremiumData | null;
}

const initialState: PremiumDataState = {
    premiumDataList: null,
};

const premiumDataSlice = createSlice({
    name: 'premiumData',
    initialState,
    reducers: {
        setPremiumDataList: (state, action: PayloadAction<PremiumData>) => {
            state.premiumDataList = action.payload;
        },
        clearPremiumData: (state) => {
            state.premiumDataList = null;
        },
    },
});

export const { setPremiumDataList, clearPremiumData } = premiumDataSlice.actions;
export default premiumDataSlice.reducer;
