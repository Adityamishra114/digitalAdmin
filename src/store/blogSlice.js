import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../config";

// Initial state
const initialBlogState = {
  blogs: [],
  selectedBlog: null,
  status: "idle",
  error: null,
  currentAction: null,
};

// ────── Thunks ──────

// GET all blogs
export const fetchBlogs = createAsyncThunk("blog/fetchBlogs", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/blogs/blogsAll");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch blogs");
  }
});

// GET single blog by ID
export const fetchBlogById = createAsyncThunk("blog/fetchBlogById", async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/blogs/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch blog");
  }
});

// POST new blog
export const createBlog = createAsyncThunk("blog/createBlog", async (blogData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/blogs/create", blogData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create blog");
  }
});

// PUT update blog
export const updateBlog = createAsyncThunk(
  "blog/updateBlog",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/blogs/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update blog");
    }
  }
);

// DELETE blog
export const deleteBlog = createAsyncThunk("blog/deleteBlog", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/blogs/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete blog");
  }
});

// POST comment
export const addComment = createAsyncThunk(
  "blog/addComment",
  async ({ blogId, name, email, text, rating }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/blogs/${blogId}/comment`, {
        name,
        email,
        text,
        rating,
      });
      return { blogId, comments: res.data.comments };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add comment");
    }
  }
);

// ────── Slice ──────

const blogSlice = createSlice({
  name: "blog",
  initialState: initialBlogState,
  reducers: {
    clearBlogError(state) {
      state.error = null;
    },
    clearSelectedBlog(state) {
      state.selectedBlog = null;
    },
    setBlogStatusIdle(state) {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // GET all
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogs = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // GET one
.addCase(fetchBlogById.fulfilled, (state, action) => {
  const existingIndex = state.blogs.findIndex(b => b._id === action.payload._id);
  if (existingIndex !== -1) {
    state.blogs[existingIndex] = action.payload;
  } else {
    state.blogs.push(action.payload);
  }
  state.selectedBlog = action.payload;
  state.status = "succeeded";
})
      // CREATE
      .addCase(createBlog.fulfilled, (state, action) => {
        state.blogs.unshift(action.payload);
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        if (state.selectedBlog?._id === action.payload._id) {
          state.selectedBlog = action.payload;
        }
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b._id !== action.payload);
        if (state.selectedBlog?._id === action.payload) {
          state.selectedBlog = null;
        }
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // COMMENT
      .addCase(addComment.fulfilled, (state, action) => {
        const { blogId, comments } = action.payload;
        const index = state.blogs.findIndex((b) => b._id === blogId);
        if (index !== -1) {
          state.blogs[index].comments = comments;
        }
        if (state.selectedBlog?._id === blogId) {
          state.selectedBlog.comments = comments;
        }
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // PENDING
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state, action) => {
          state.status = "loading";
          state.error = null;
          state.currentAction = action.type.split("/")[1];
        }
      )

      // Reset currentAction
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected"),
        (state) => {
          state.currentAction = null;
        }
      );
  },
});

// Export actions
export const { clearBlogError, clearSelectedBlog, setBlogStatusIdle } = blogSlice.actions;

// Export reducer
export default blogSlice.reducer;
