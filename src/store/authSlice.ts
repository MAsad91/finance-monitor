import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi, User, LoginCredentials, RegisterData } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // Start as false, will be set to true when checking session or performing auth actions
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    const result = await authApi.login(credentials);
    if (result.error) {
      return rejectWithValue(result.error);
    }
    // API returns { success: true, user: {...} }
    return result.data as any;
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    const result = await authApi.register(data);
    if (result.error) {
      return rejectWithValue(result.error);
    }
    // API returns { success: true, message: "..." }
    return result.data as any;
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    const result = await authApi.logout();
    if (result.error) {
      return rejectWithValue(result.error);
    }
    return result.data;
  }
);

export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    const result = await authApi.getSession();
    if (result.error) {
      return rejectWithValue(result.error);
    }
    // API returns { user: {...} }
    return result.data as any;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        if (payload?.user) {
          state.user = payload.user;
          state.isAuthenticated = true;
        } else if (payload?.success && payload?.user) {
          state.user = payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        if (payload?.user) {
          state.user = payload.user;
          state.isAuthenticated = true;
        } else if (payload?.success) {
          // Registration successful, but user will be set after auto-login
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-token");
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Session
    builder
      .addCase(checkSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        // Clear auth token from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-token");
          // Don't redirect here - let the layout components handle redirects
          // This prevents redirect loops and allows showing loaders
        }
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;

