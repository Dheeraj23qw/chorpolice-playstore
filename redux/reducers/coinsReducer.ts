import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store"; // Import SecureStore

// Async functions to get and set coins using SecureStore
const getCoins = async () => {
  try {
    const coins = await SecureStore.getItemAsync("coins");
    return coins !== null ? parseInt(coins) : 0; // Return 0 if coins not found
  } catch (error) {
    console.error("Error fetching coins from SecureStore:", error);
    return 0;
  }
};

const setCoins = async (coins: number) => {
  try {
    await SecureStore.setItemAsync("coins", coins.toString());
  } catch (error) {
    console.error("Error saving coins to SecureStore:", error);
  }
};

// Coins state interface
interface CoinsState {
  coins: number;
}

const initialState: CoinsState = {
  coins: 0, // Default state as 0 initially
};

// Create a slice for managing coins
const coinsSlice = createSlice({
  name: "coins",
  initialState,
  reducers: {
    // Action to set initial coins value from SecureStore
    setInitialCoins: (state, action: PayloadAction<number>) => {
      state.coins = action.payload; 
    },

    // Action to add coins (and persist the updated value to SecureStore)
    addCoins: (state, action: PayloadAction<number>) => {
      state.coins += action.payload;
      setCoins(state.coins); // Persist the updated coin value to SecureStore
    },

    // Action to reset coins to 0 (or any value)
    resetCoins: (state) => {
      state.coins = 0;
      setCoins(state.coins); // Persist the reset coin value to SecureStore
    },
  },
});

// Async initialization for the initialState of coins
export const initializeCoins = () => async (dispatch: any) => {
  const coins = await getCoins(); // Fetch the coins asynchronously
  dispatch(setInitialCoins(coins)); // Dispatch to set the initial coins state
};

// Export actions
export const { addCoins, setInitialCoins, resetCoins } = coinsSlice.actions;

// Export reducer
export default coinsSlice.reducer;
