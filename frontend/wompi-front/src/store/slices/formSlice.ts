import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// All inputs in the checkout form live here.
export type FormValues = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
};

// Optional error messages for each input.
export type FormErrors = {
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
};

// Full state for the form section.
export type FormState = {
  values: FormValues;
  errors: FormErrors;
  isSheetOpen: boolean;
};

// Default values when the app starts.
const initialState: FormState = {
  values: {
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  },
  errors: {},
  isSheetOpen: false,
};

// Slice = state + actions that update that state.
const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setField(
      state,
      action: PayloadAction<{ field: keyof FormValues; value: string }>
    ) {
      // Update one input as the user types.
      state.values[action.payload.field] = action.payload.value;
    },
    setErrors(state, action: PayloadAction<FormErrors>) {
      // Save all validation errors at once.
      state.errors = action.payload;
    },
    clearErrors(state) {
      // Clear all error messages.
      state.errors = {};
    },
    clearFieldError(state, action: PayloadAction<keyof FormValues>) {
      // Clear the error for one input.
      delete state.errors[action.payload];
    },
    setSheetOpen(state, action: PayloadAction<boolean>) {
      // Open/close the bottom sheet.
      state.isSheetOpen = action.payload;
    },
    resetForm(state) {
      // Reset everything to the defaults.
      state.values = initialState.values;
      state.errors = {};
      state.isSheetOpen = false;
    },
  },
});

export const {
  setField,
  setErrors,
  clearErrors,
  clearFieldError,
  setSheetOpen,
  resetForm,
} = formSlice.actions;

export default formSlice.reducer;
