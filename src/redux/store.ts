import { configureStore } from "@reduxjs/toolkit";
import MatricsSlice from "./slices/metrics/MetricsSlice";
import userReducer from "./slices/profile/userSlice";
import authReducer from "./slices/login/loginSlice";
import signUpReducer from "./slices/signUp/signUpSlice";
import feedUsageReducer from "./slices/dataEntry/feedUsageSlice";
import environmentReducer from "./slices/dataEntry/environmentSlice";
import eggProductionReducer from "./slices/dataEntry/eggProductionSlice";
import mortalityRateReducer from "./slices/dataEntry/mortalityRateSlice";


export const store = configureStore({
  reducer: {
    Matrics: MatricsSlice,
    user: userReducer,
    auth: authReducer,
    signUp: signUpReducer,
    feedUsage: feedUsageReducer, 
    environment: environmentReducer, 
    eggProduction: eggProductionReducer, 
    mortalityRate: mortalityRateReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;