import { configureStore } from "@reduxjs/toolkit";
import toastReducer from "./toastSlice";
import loadingReducer from "./loadingSlice";
import cartReducer from "./cartSlice";

const store = configureStore({
    reducer: {
        toast: toastReducer,
        loading: loadingReducer,
        cart: cartReducer,
    }
})

export default store;