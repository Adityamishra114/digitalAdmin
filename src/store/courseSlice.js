import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { axiosInstance } from "../config";

// 🔄 Fetch all courses
export const fetchCourses = createAsyncThunk(
  "course/fetchCourses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/courses/courseAll", { params });
      return {
        courses: res.data.courses,
        count: res.data.count,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch courses");
    }
  }
);

// 🔍 Fetch course by ID
export const fetchCourseById = createAsyncThunk(
  "course/fetchCourseById",
  async (courseId, { getState, rejectWithValue }) => {
    try {
      const existing = getState().course.selectedCourse;
      if (existing && String(existing.courseId) === String(courseId)) {
        return existing;
      }

      const res = await axiosInstance.get(`/courses/${courseId}`);
      return res.data?.course || rejectWithValue("Course not found");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch course");
    }
  }
);

// ✅ Create a new course
export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/courses/create", formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create course");
    }
  }
);

// ✏️ Edit existing course
export const editCourse = createAsyncThunk(
  "course/editCourse",
  async ({ courseId, formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/courses/edit/${courseId}`, formData,);
      return res.data.course;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to edit course");
    }
  }
);

// ❌ Delete course
export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/courses/${courseId}`);
      return courseId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete course");
    }
  }
);

// 🧩 Initial State
const initialState = {
  courses: [],
  selectedCourse: null,
  status: "idle",
  error: null,
  totalCount: 0,
  pagination: {
    currentPage: 1,
    perPage: 10,
  },
};

// 🚀 Slice Definition
const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetSelectedCourse(state) {
      state.selectedCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Courses
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courses = action.payload.courses;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.selectedCourse = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.selectedCourse = null;
      })

      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.status = "creating";
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.status = "created";
        state.courses.unshift(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Edit Course
      .addCase(editCourse.pending, (state) => {
        state.status = "updating";
        state.error = null;
      })
      .addCase(editCourse.fulfilled, (state, action) => {
        state.status = "updated";
        const updatedCourse = action.payload;

        // Update course in list
        const index = state.courses.findIndex(
          (c) => c.courseId === updatedCourse.courseId
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }

        // Update selectedCourse if matched
        if (
          state.selectedCourse &&
          state.selectedCourse.courseId === updatedCourse.courseId
        ) {
          state.selectedCourse = updatedCourse;
        }
      })
      .addCase(editCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.status = "deleting";
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.status = "deleted";
        const deletedId = action.payload;
        state.courses = state.courses.filter(c => c.courseId !== deletedId);

        if (
          state.selectedCourse &&
          state.selectedCourse.courseId === deletedId
        ) {
          state.selectedCourse = null;
        }

        state.totalCount -= 1;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// 📤 Actions
export const { setPagination, resetSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;

// 📌 Selectors
export const selectCourses = (state) => state.course.courses;
export const selectSelectedCourse = (state) => state.course.selectedCourse;
export const selectCourseStatus = (state) => state.course.status;
export const selectCourseError = (state) => state.course.error;
export const selectTotalCourses = (state) => state.course.totalCount;
export const selectCoursePagination = (state) =>
  state.courseStudent?.pagination;

export const selectTotalHours = createSelector([selectCourses], (courses) =>
  courses.reduce((sum, course) => sum + (course.totalHours || 0), 0)
);

export const selectTotalModules = createSelector([selectCourses], (courses) =>
  courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0)
);

export const selectTotalLessons = createSelector([selectCourses], (courses) =>
  courses.reduce(
    (sum, course) =>
      sum +
      (Array.isArray(course.modules)
        ? course.modules.reduce(
            (mSum, mod) =>
              mSum + (Array.isArray(mod.lessons) ? mod.lessons.length : 0),
            0
          )
        : 0),
    0
  )
);

export const selectLevels = createSelector([selectCourses], (courses) =>
  Array.from(new Set(courses.map((course) => course.level).filter(Boolean)))
);
