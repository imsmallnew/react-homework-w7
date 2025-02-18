import { configureStore } from "@reduxjs/toolkit";
import toastReducer from "./toastSlice";
import loadingReducer from "./loadingSlice"

const store = configureStore({
    reducer: {
        toast: toastReducer,
        loading: loadingReducer,
    }
})

export default store;