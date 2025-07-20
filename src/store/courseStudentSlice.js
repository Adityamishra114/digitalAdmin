import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../config";

// ✅ Create course enrollment
export const createCourseEnrollment = createAsyncThunk(
  "courseStudent/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/courseStudent/create", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create enrollment");
    }
  }
);

// ✅ Fetch all enrolled courses (admin) with pagination
export const fetchAllCourseStudents = createAsyncThunk(
  "courseStudent/fetchAll",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/courseStudent/all?page=${page}&limit=${limit}`);
      return { ...res.data, page, limit };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch enrolled courses");
    }
  }
);

// ✅ Update course enrollment
export const updateCourseEnrollment = createAsyncThunk(
  "courseStudent/update",
  async ({ id, enrolledCourses }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/courseStudent/${id}`, { enrolledCourses });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update enrollment");
    }
  }
);

// ✅ Delete course enrollment
export const deleteCourseEnrollment = createAsyncThunk(
  "courseStudent/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/courseStudent/${id}`);
      return { ...res.data, id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete enrollment");
    }
  }
);

// ✅ Fetch user purchased courses
export const fetchPurchasedEnrolledCourses = createAsyncThunk(
  "courseStudent/fetchPurchased",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/courseStudent/getCourseByUser");
      const data = res.data;
      const totalFinalQuestions = data.reduce((acc, course) => {
        const finalTestQuestions = Array.isArray(course.finalTest?.questions)
          ? course.finalTest.questions.length
          : 0;
        return acc + finalTestQuestions;
      }, 0);

      return {
        courses: data,
        totalFinalQuestions,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch purchased courses");
    }
  }
);


// ✅ Fetch resume data
export const fetchCourseResume = createAsyncThunk(
  "courseStudent/fetchResume",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/courseStudent/${courseId}`);
      return { courseId, resume: res.data.resume };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch resume data");
    }
  }
);

// ✅ Update resume
export const updateCourseResume = createAsyncThunk(
  "courseStudent/updateResume",
  async ({ courseId, lastWatched, watchedHours }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/courseStudent/${courseId}`, {
        lastWatched,
        watchedHours,
      });
      return { courseId, resume: res.data.resume };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update resume");
    }
  }
);

// ✅ Update watched hours
export const updateWatchedHours = createAsyncThunk(
  "courseStudent/updateWatchedHours",
  async ({ id, courseId, watchedHours }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/courseStudent/progress/${id}`, {
        courseId,
        watchedHours,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update watched hours");
    }
  }
);

// ✅ Initial State
const initialState = {
  enrolledCourses: [],
  purchasedCourses: [],
  resumeMap: {},
   totalFinalQuestions: 0,
  totalEnrolledCourses: 0,
  totalEnrolledUsers: 0,
  totalUniqueCourses: 0,
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  status: "idle",
  error: null,
  successMessage: null,
};

const courseStudentSlice = createSlice({
  name: "courseStudent",
  initialState,
  reducers: {
    clearEnrolledCourses: (state) => {
      state.enrolledCourses = [];
      state.totalEnrolledCourses = 0;
      state.totalEnrolledUsers = 0;
      state.totalUniqueCourses = 0;
      state.resumeMap = {};
      state.currentPage = 1;
      state.totalPages = 1;
      state.status = "idle";
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH with pagination
      .addCase(fetchAllCourseStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllCourseStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enrolledCourses = action.payload.enrolledCourses || [];
        state.totalEnrolledCourses = action.payload.summary.totalEnrolledCourses || 0;
        state.totalEnrolledUsers = action.payload.summary.totalEnrolledUsers || 0;
        state.totalUniqueCourses = action.payload.summary.totalUniqueCourses || 0;
        state.totalFinalQuestions = action.payload.totalFinalQuestions || 0;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.limit;
        state.totalPages = Math.ceil(
          (action.payload.summary.totalEnrolledCourses || 0) / action.payload.limit
        );
        state.error = null;
      })
      .addCase(fetchAllCourseStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // CREATE
      .addCase(createCourseEnrollment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCourseEnrollment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enrolledCourses.push(...(action.payload.enrolledCourses || []));
        state.successMessage = "Enrollment created successfully";
        state.error = null;
      })
      .addCase(createCourseEnrollment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCourseEnrollment.fulfilled, (state) => {
        state.status = "succeeded";
        state.successMessage = "Enrollment updated successfully";
        state.error = null;
      })
      .addCase(updateCourseEnrollment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCourseEnrollment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage = "Enrollment deleted successfully";
        state.enrolledCourses = state.enrolledCourses.filter(
          (course) => course._id !== action.payload.id
        );
        state.error = null;
      })
      .addCase(deleteCourseEnrollment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // PURCHASED
      .addCase(fetchPurchasedEnrolledCourses.fulfilled, (state, action) => {
        state.purchasedCourses = action.payload.enrolledCourses || [];
      })

      // RESUME
      .addCase(fetchCourseResume.fulfilled, (state, action) => {
        state.resumeMap[action.payload.courseId] = action.payload.resume;
      })
      .addCase(updateCourseResume.fulfilled, (state, action) => {
        state.resumeMap[action.payload.courseId] = action.payload.resume;
      })

      // WATCHED HOURS
      .addCase(updateWatchedHours.fulfilled, (state, action) => {
        const updatedCourse = action.payload;
        const index = state.enrolledCourses.findIndex(
          (c) => c.courseId === updatedCourse.courseId
        );
        if (index !== -1) {
          state.enrolledCourses[index] = updatedCourse;
        }
      });
  },
});

export const { clearEnrolledCourses } = courseStudentSlice.actions;
export default courseStudentSlice.reducer;

// ✅ Selectors
export const selectAllEnrolledCourses = (state) => state.courseStudent.enrolledCourses;
export const selectPurchasedCourses = (state) => state.courseStudent.purchasedCourses;
export const selectResumeForCourse = (courseId) => (state) =>
  state.courseStudent.resumeMap[courseId] || null;
export const selectCourseStudentStatus = (state) => state.courseStudent.status;
export const selectCourseStudentError = (state) => state.courseStudent.error;
export const selectCourseStudentSuccess = (state) => state.courseStudent.successMessage;
export const selectTotalEnrolledCourses = (state) => state.courseStudent.totalEnrolledCourses;
export const selectTotalEnrolledUsers = (state) => state.courseStudent.totalEnrolledUsers;
export const selectTotalUniqueCourses = (state) => state.courseStudent.totalUniqueCourses;
export const selectCurrentPage = (state) => state.courseStudent.currentPage;
export const selectTotalPages = (state) => state.courseStudent.totalPages;
export const selectEnrolledCourses = (state) => state.courseStudent.courses;
export const selectTotalFinalQuestions = (state) => state.courseStudent.totalFinalQuestions;
