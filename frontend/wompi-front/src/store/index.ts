import { configureStore } from '@reduxjs/toolkit'
import checkoutReducer from './slices/checkoutSlice'
import formReducer from './slices/formSlice'
import wompiReducer from './slices/wompiSlice'

// The Redux store is the main box that holds all app state.
export const store = configureStore({
  reducer: {
    checkout: checkoutReducer,
    form: formReducer,
    wompi: wompiReducer,
  },
})

// Helpful TypeScript types for state + dispatch.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
