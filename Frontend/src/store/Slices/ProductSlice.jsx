import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
export const fetchProducts=createAsyncThunk(
   "products/fetchProducts",async function(){
   const res=await axios.get('http://localhost:5000/api/products')
    console.log(res.data)
       return res.data
      
   }
)
const ProductSlice=createSlice({
    name:'Products',
    initialState:{
        items:[],
        error:'',
        loading:false
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchProducts.pending,(state,action)=>{
            state.loading=true
        })
         builder.addCase(fetchProducts.fulfilled,(state,action)=>{
            state.loading=false
            state.items=action.payload.products
        })
         builder.addCase(fetchProducts.rejected,(state,action)=>{
            state.loading=false
            state.error="Failed to Fetch"
        })
    }
})

export default ProductSlice.reducer