import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice"
import ownerSlice from "./ownerSlice"
import mapSlice from "./mapSlice"
export const store=configureStore({
    reducer:{
        user:userSlice,
        owner:ownerSlice,
        map:mapSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Socket.io instance is non-serializable — ignore it
                ignoredPaths: ['user.socket'],
                ignoredActions: ['user/setSocket'],
            },
        }),
})