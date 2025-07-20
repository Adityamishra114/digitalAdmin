import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  deleteCourse,
  selectCourses,
  selectCourseStatus,
  selectTotalCourses,
  selectCoursePagination,
  setPagination,
} from "../store/courseSlice";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const courses = useSelector(selectCourses);
  const status = useSelector(selectCourseStatus);
  const totalCourses = useSelector(selectTotalCourses);
  const pagination = useSelector(selectCoursePagination) || {
    currentPage: 1,
    perPage: 10,
  };

  const [typeFilter, setTypeFilter] = useState("Student");

  const { currentPage, perPage } = pagination;
  const totalPages = Math.ceil(totalCourses / perPage);

  useEffect(() => {
    dispatch(fetchCourses({ page: currentPage, perPage, type: typeFilter }));
  }, [dispatch, currentPage, perPage, typeFilter]);

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    await dispatch(deleteCourse(courseId));
    const remainingCount = totalCourses - 1;
    const lastPage = Math.max(1, Math.ceil(remainingCount / perPage));

    dispatch(setPagination({ currentPage: lastPage }));
    dispatch(fetchCourses({ page: lastPage, perPage, type: typeFilter }));
  };

  const handlePageChange = (page) => {
    dispatch(setPagination({ currentPage: page }));
  };

  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    dispatch(setPagination({ currentPage: 1 }));
  };

  const handleEdit = (courseId) => {
   navigate(`/admin/courses/edit/${courseId}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl text-primary font-semibold mb-4">
        Courses ({typeFilter})
      </h2>

      <div className="mb-4">
        <select
          className="border rounded px-3 py-2"
          value={typeFilter}
          onChange={handleTypeChange}
        >
          <option value="Student">Student</option>
          <option value="Business">Business</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border rounded-lg">
          <thead className="bg-gray-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Title</th>
              {typeFilter === "Student" ? (
                <>
                  <th className="px-4 py-2 border">Price</th>
                  <th className="px-4 py-2 border">Sale Price</th>
                </>
              ) : (
                <th className="px-4 py-2 border">Category</th>
              )}
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" ? (
              <tr>
                <td colSpan={typeFilter === "Student" ? 6 : 5} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={typeFilter === "Student" ? 6 : 5} className="text-center py-4">
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((course, index) => (
                <tr key={course.courseId} className="text-sm border-b hover:bg-gray-50">
                  <td className="px-4 py-2 border">{index + 1 + (currentPage - 1) * perPage}</td>
                  <td className="px-4 py-2 border">
                    <img
                      src={course.image || "/placeholder.png"}
                      alt={course.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2 border">{course.title}</td>
                  {typeFilter === "Student" ? (
                    <>
                      <td className="px-4 py-2 border">₹{course.price || "-"}</td>
                      <td className="px-4 py-2 border">₹{course.salePrice || "-"}</td>
                    </>
                  ) : (
                    <td className="px-4 py-2 border">{course.category || "-"}</td>
                  )}
                  <td className="px-4 py-2 border text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEdit(course.courseId)} title="Edit">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(course.courseId)} title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded ${
                  page === currentPage ? "bg-primary text-white" : "bg-white"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseList;
