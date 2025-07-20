import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBlogs, deleteBlog } from "../store/blogSlice";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

const BlogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { blogs, status, error } = useSelector((state) => state.blog);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 10;

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleEdit = (_id) => {
    navigate(`/admin/blogs/edit/${_id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      await dispatch(deleteBlog(id));
      dispatch(fetchBlogs());
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Blog List</h2>
      {status === "loading" ? (
        <p className="text-center mt-4">Loading blogs...</p>
      ) : error ? (
        <p className="text-center text-red-600 mt-4">Error: {error}</p>
      ) : blogs.length === 0 ? (
        <p className="text-center text-gray-600">No blogs available.</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Image</th>
                  <th className="px-4 py-2 border">Title</th>
                  <th className="px-4 py-2 border">Updated</th>
                  <th className="px-4 py-2 border">Author</th>
                  <th className="px-4 py-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBlogs.map((blog, index) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-2 border">
                      <img
                        src={
                          blog.coverImage && blog.coverImage.startsWith("http")
                            ? blog.coverImage
                            : "/no-image.png"
                        }
                        alt={blog.title}
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 border">{blog.title}</td>
                    <td className="px-4 py-2 border">
                      {formatDate(blog.updatedAt || blog.date)}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center gap-2">
                        {blog.author?.image ? (
                          <img
                            src={blog.author.image}
                            alt={blog.author.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300" />
                        )}
                        <span>{blog.author?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(blog._id)}
                          title="Edit"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded border ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogList;
