import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAllCourseStudents,
  deleteCourseEnrollment,
  selectAllEnrolledCourses,
  selectCourseStudentStatus,
} from "../store/courseStudentSlice";
import { Pencil, Trash2 } from "lucide-react";

const PAGE_SIZE = 10;

const CourseEnrolledList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const enrolledCourses = useSelector(selectAllEnrolledCourses);
  const status = useSelector(selectCourseStudentStatus);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllCourseStudents());
  }, [dispatch]);

  const handleDelete = async (enrollmentId) => {
    if (window.confirm("Are you sure you want to delete this enrollment?")) {
      await dispatch(deleteCourseEnrollment(enrollmentId));
      dispatch(fetchAllCourseStudents()); 
    }
  };

  const handleEdit = (courseId) => {
    navigate(`/admin/CourseStudent/edit/${courseId}`);
  };

  const paginatedData = enrolledCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPages = Math.ceil(enrolledCourses.length / PAGE_SIZE);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Enrolled Courses</h2>

      {status === "loading" ? (
        <p className="text-center">Loading...</p>
      ) : enrolledCourses.length === 0 ? (
        <p className="text-center">No enrollments found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Image</th>
                  <th className="px-4 py-2 border">Title</th>
                  <th className="px-4 py-2 border">Total Hours</th>
                  <th className="px-4 py-2 border">Level</th>
                  <th className="px-4 py-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((enrollment, index) => {
                  const courseId = enrollment?.courseId;
                  return (
                    <tr key={courseId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <img
                          src={enrollment?.image || "/default-course.jpg"}
                          alt={enrollment?.title || "Untitled"}
                          className="w-14 h-14 object-cover rounded mx-auto"
                        />
                      </td>
                      <td className="px-4 py-2 border">{enrollment?.title || "Untitled"}</td>
                      <td className="px-4 py-2 border">
                        {enrollment?.totalHours ? `${enrollment.totalHours} hrs` : "N/A"}
                      </td>
                      <td className="px-4 py-2 border">{enrollment?.level || "N/A"}</td>
                      <td className="px-4 py-2 border text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(courseId)}
                            title="Edit"
                            className="hover:scale-105 transition-transform"
                          >
                            <Pencil className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(courseId)}
                            title="Delete"
                            className="hover:scale-105 transition-transform"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseEnrolledList;
