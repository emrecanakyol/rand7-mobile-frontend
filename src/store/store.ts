import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "./reducer/authReducer";
import thunk from "redux-thunk";
import themeReducer from "./reducer/themeReducer";
import premiumDataReducer from "./reducer/premiumDataReducer";

const authPersistConfig = {
    key: "auth",
    storage: AsyncStorage,
};

const themePersistConfig = {
    key: "theme",
    storage: AsyncStorage,
};

const premiumDataPersistConfig = {
    key: "premiumData",
    storage: AsyncStorage,
};

const authPersistedReducer = persistReducer(authPersistConfig, authReducer);
const themePersistedReducer = persistReducer(themePersistConfig, themeReducer);
const premiumDataPersistedReducer = persistReducer(premiumDataPersistConfig, premiumDataReducer);

const store = configureStore({
    reducer: {
        auth: authPersistedReducer,
        theme: themePersistedReducer,
        premiumData: premiumDataPersistedReducer,
    },
    // middleware: [thunk],
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            thunk: true,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default store;
