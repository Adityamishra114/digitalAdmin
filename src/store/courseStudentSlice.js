import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../config";

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

export const addFinalTestToCourse = createAsyncThunk(
  "courseStudent/addFinalTest",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/courseStudent/finalTest", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add final test");
    }
  }
);

export const fetchAllCourseStudents = createAsyncThunk(
  "courseStudent/fetchAll",
  async ({ page = 1, limit = 10, courseId } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (courseId) params.append("courseId", courseId);
      const res = await axiosInstance.get(`/courseStudent/all?${params.toString()}`);
      return { ...res.data, page, limit };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch enrolled courses");
    }
  }
);

export const updateCourseEnrollment = createAsyncThunk(
  "courseStudent/update",
  async ({ courseId, enrolledCourses }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/courseStudent/enrolled/${courseId}`, { enrolledCourses },  {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update enrollment");
    }
  }
);

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
        enrolledCourses: data,
        totalFinalQuestions,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch purchased courses");
    }
  }
);

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
  studentCourseList: [],
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
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Final Test
      .addCase(addFinalTestToCourse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addFinalTestToCourse.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage = action.payload.message || "Final test added successfully";
        state.error = null;

        const updatedCourse = action.payload.updatedCourse;
        const index = state.enrolledCourses.findIndex(
          (c) => c.courseId === updatedCourse?.courseId
        );
        if (index !== -1) {
          state.enrolledCourses[index] = updatedCourse;
        }
      })
      .addCase(addFinalTestToCourse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Other thunks...

      .addCase(fetchAllCourseStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllCourseStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enrolledCourses = action.payload.enrolledCourses || [];
        state.studentCourseList = action.payload.studentCourses || [];
        state.totalEnrolledCourses = action.payload.summary?.totalEnrolledCourses || 0;
        state.totalEnrolledUsers = action.payload.summary?.totalEnrolledUsers || 0;
        state.totalUniqueCourses = action.payload.summary?.totalUniqueCourses || 0;
        state.totalFinalQuestions = action.payload.totalFinalQuestions || 0;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.limit;
        state.totalPages = Math.ceil(
          (action.payload.summary?.totalEnrolledCourses || 0) / action.payload.limit
        );
        state.error = null;
      })
      .addCase(fetchAllCourseStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

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

      .addCase(updateCourseEnrollment.fulfilled, (state, action) => {
  state.status = "succeeded";
  const updated = action.payload.data; 
  const idx = state.purchasedCourses.findIndex(c => c.courseId === updated.courseId);
  if (idx !== -1) state.purchasedCourses[idx] = updated;
})
      .addCase(updateCourseEnrollment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

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

      .addCase(fetchPurchasedEnrolledCourses.fulfilled, (state, action) => {
        state.purchasedCourses = action.payload.enrolledCourses || [];
        state.totalFinalQuestions = action.payload.totalFinalQuestions || 0;
      })

      .addCase(fetchCourseResume.fulfilled, (state, action) => {
        state.resumeMap[action.payload.courseId] = action.payload.resume;
      })
      .addCase(updateCourseResume.fulfilled, (state, action) => {
        state.resumeMap[action.payload.courseId] = action.payload.resume;
      })

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

// ✅ Export actions and reducer
export const { clearEnrolledCourses } = courseStudentSlice.actions;
export default courseStudentSlice.reducer;

// ✅ Selectors
export const selectAllEnrolledCourses = (state) => state.courseStudent.enrolledCourses;
export const selectPurchasedCourses = (state) => state.courseStudent.purchasedCourses;
export const selectStudentCourseList = (state) => state.courseStudent.studentCourseList;
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
export const selectTotalFinalQuestions = (state) => state.courseStudent.totalFinalQuestions;
