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
  const nextValue = state.coins + action.payload;
  // Safety: Don't let coins go negative
  state.coins = nextValue < 0 ? 0 : nextValue; 
  setCoins(state.coins); 
},
deductCoins: (state, action: PayloadAction<number>) => {
  if (state.coins >= action.payload) {
    state.coins -= action.payload;
  }
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
  try {
    const storedCoins = await SecureStore.getItemAsync("coins");

    if (storedCoins === null) {
      // THIS IS THE MOMENT IT GETS STORED FOR THE FIRST TIME
      const welcomeAmount = 1000;
      await SecureStore.setItemAsync("coins", welcomeAmount.toString()); 
      dispatch(setInitialCoins(welcomeAmount));
    } else {
      // Returning user: Just load what was already there
      dispatch(setInitialCoins(parseInt(storedCoins)));
    }
  } catch (error) {
    dispatch(setInitialCoins(0));
  }
};

// Export actions
export const { addCoins, setInitialCoins, resetCoins ,deductCoins} = coinsSlice.actions;

// Export reducer
export default coinsSlice.reducer;
