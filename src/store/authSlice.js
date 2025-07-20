import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../config";

const initialAuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
  status: "idle",
  error: null,
  currentAction: null,
};

export const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

export const signin = createAsyncThunk(
  "auth/signin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/user/login",
        { email, password },
        { withCredentials: true }
      );

      const { success, user, token, message } = res.data;

      if (!success || !user || !token) {
        return rejectWithValue(message || "Login failed");
      }

      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Signin failed");
    }
  }
);
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/user/me", {
        withCredentials: true,
      });

      const { success, user, message } = res.data;

      if (!success || !user) {
        return rejectWithValue(message || "User not found");
      }

      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Load failed");
    }
  }
);
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/user/update-profile", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success && res.data.user) {
        return res.data.user;
      }
      return rejectWithValue(res.data.message || "Update failed");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/user/logout", {}, { withCredentials: true });
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    setAuthStatusIdle(state) {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(signin.rejected, (state, action) => {
        state.error = action.payload;
        state.status = "failed";
        state.isLoggedIn = false;
        state.user = null;
      })
      .addCase(loadUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isLoggedIn = false;
        state.user = null;
      })
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.token = null;
        state.status = "idle";
        state.error = null;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state, action) => {
          state.status = "loading";
          state.error = null;
          state.currentAction = action.type.split("/")[1];
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected"),
        (state) => {
          state.status = "idle";
          state.currentAction = null;
        }
      );
  },
});

export const { logout, clearError, setAuthStatusIdle } = authSlice.actions;
export default authSlice.reducer;
