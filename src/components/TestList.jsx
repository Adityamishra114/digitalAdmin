import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCourseStudents,
  deleteCourseEnrollment,
  selectAllEnrolledCourses,
  selectCourseStudentStatus,
  selectCourseStudentError,
  selectCourseStudentSuccess,
} from "../store/courseStudentSlice";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TestList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const courses = useSelector(selectAllEnrolledCourses);
  const status = useSelector(selectCourseStudentStatus);
  const error = useSelector(selectCourseStudentError);
  const successMessage = useSelector(selectCourseStudentSuccess);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAllCourseStudents());
  }, [dispatch]);

  const paginatedCourses = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(courses.length / itemsPerPage);

const handleEdit = (item) => {
  navigate(`/admin/tests/edit/${item.id}`);
};
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this enrollment?")) {
      dispatch(deleteCourseEnrollment(id)).then(() => {
        dispatch(fetchAllCourseStudents());
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Course Test List
      </h1>

      {status === "loading" && (
        <div className="text-center text-gray-600 py-6">Loading...</div>
      )}

      {error && (
        <div className="text-center text-red-500 py-2">Error: {error}</div>
      )}

      {successMessage && (
        <div className="text-center text-green-600 py-2">{successMessage}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white rounded shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-left">#</th>
              <th className="p-3 border text-left">Image</th>
              <th className="p-3 border text-left">Course Title</th>
              <th className="p-3 border text-left">Total Questions</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="p-3 border">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-3 border">
                    <img
                      src={item?.image || "/placeholder.jpg"}
                      alt={item?.title || "Course Image"}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="p-3 border">
                    {item?.title || "N/A"}
                  </td>
                  <td className="p-3 border">
                    {item.finalTest?.questions?.length ?? 0}
                  </td>
                  <td className="p-3 border">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        title="Edit"
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No course tests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestList;