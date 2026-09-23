import { configureStore } from "@reduxjs/toolkit";
import ProductSlice from './Slices/ProductSlice'
const store = configureStore({
    reducer: {
        Products: ProductSlice
    }
})
export default store