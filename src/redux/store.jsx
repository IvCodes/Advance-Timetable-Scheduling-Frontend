import { configureStore } from "@reduxjs/toolkit"; 
import logger from "redux-logger";
import authReducer from " features/authentication/auth.slice";

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(logger),
      devTools: import.meta.env.VITE_NODE_ENV !== "production",
    });

    export default store;