import { configureStore, applyMiddleware } from "@reduxjs/toolkit";
import logger from "redux-logger";
import authReducer from "../features/authentication/auth.slice";
import usersReducer from "../features/admin/UserManagement/users.slice";
import dataReducer from "../features/admin/DataManagement/data.slice";
import sidebarReducer from "../components/sidebar/sidebar.slice";
import timetableReducer from "../features/admin/Timetable/timetable.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    data: dataReducer,
    sidebar: sidebarReducer,
    timetable: timetableReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(logger),
  devTools: process.env.NODE_ENV !== "production",
});
export default store;
