import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoading: false,
    loadingText: ""
};

const loadingSlice = createSlice({
    name: "loading",
    initialState,
    reducers: {
        showLoading(state, action) {
            state.isLoading = true;
            state.loadingText = action.payload || "Loading...";
        },
        hideLoading(state) {
            state.isLoading = false;
            state.loadingText = "";
        }
    }
});

export const { showLoading, hideLoading } = loadingSlice.actions;
export default loadingSlice.reducer;