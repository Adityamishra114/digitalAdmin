import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBlog, setBlogStatusIdle } from "../store/blogSlice";
import { tagMap } from "../utils/tagMap";
import { useNavigate } from "react-router-dom"; // <-- Add this

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] + (parts[1]?.[0] || "")).toUpperCase();
};

const BlogAddForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // <-- Add this
  const { status, error } = useSelector((state) => state.blog);

  const [formData, setFormData] = useState({
    imageFile: null,
    preview: null,
    title: "",
    excerpt: "",
    category: "Design",
    tags: "",
    content: [{ type: "text", value: "", file: null, filePreview: null }],
    authorName: "Admin",
    authorImageFile: null,
    authorImagePreview: null,
  });

  const [expandedBlocks, setExpandedBlocks] = useState([true]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === "succeeded" && submitted) {
      setFormData({
        imageFile: null,
        preview: null,
        title: "",
        excerpt: "",
        category: "Design",
        tags: "",
        content: [{ type: "text", value: "", file: null, filePreview: null }],
        authorName: "Admin",
        authorImageFile: null,
        authorImagePreview: null,
      });
      setExpandedBlocks([true]);
      setSubmitted(false);
      navigate("/admin/blogs/list");
      dispatch(setBlogStatusIdle());
    }
  }, [status, submitted, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (submitted) setSubmitted(false);

    if (name === "imageFile" && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        preview: URL.createObjectURL(file),
      }));
    } else if (name === "authorImageFile" && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        authorImageFile: file,
        authorImagePreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (index, field, value) => {
    const updated = [...formData.content];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, content: updated }));
  };

  const handleContentFileChange = (index, file) => {
    const updated = [...formData.content];
    updated[index].file = file;
    updated[index].filePreview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, content: updated }));
  };

  const toggleAccordion = (index) => {
    setExpandedBlocks((prev) =>
      prev.map((open, i) => (i === index ? !open : open))
    );
  };

  const addContentBlock = () => {
    setFormData((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        { type: "text", value: "", file: null, filePreview: null },
      ],
    }));
    setExpandedBlocks((prev) => [...prev, true]);
  };

  const removeContentBlock = (index) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }));
    setExpandedBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const form = new FormData();
    form.append("title", formData.title.trim());
    form.append("excerpt", formData.excerpt.trim());
    form.append("category", formData.category);
    form.append("tags", formData.tags);
    form.append("authorName", formData.authorName.trim());

    if (formData.imageFile) form.append("blogImage", formData.imageFile);
    if (formData.authorImageFile)
      form.append("blogAImages", formData.authorImageFile);

    // Build content blocks and append images dynamically
    const contentBlocks = formData.content.map((block, index) => {
      const contentBlock = {
        type: block.type,
        value: block.type === "image" ? "" : block.value,
      };

      if (block.type === "image" && block.file) {
        // Use index as localId for matching
        form.append(`content-image-${index}`, block.file);
        contentBlock.attrs = { localId: index };
      }

      return contentBlock;
    });

    form.append("content", JSON.stringify(contentBlocks));
    dispatch(createBlog(form));
  };

  const tagOptions = Object.keys(tagMap);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white shadow-lg rounded-lg space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Create New Blog
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Cover Image</label>
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {formData.preview && (
            <img
              src={formData.preview}
              alt="Cover Preview"
              className="mt-3 w-full h-64 object-cover rounded border"
            />
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              className="w-full border rounded p-2"
              rows="3"
              required
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="Design">Design</option>
              <option value="Development">Development</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2">Content Blocks</label>
          {formData.content.map((block, index) => (
            <div
              key={index}
              className="mb-4 border rounded-lg overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 font-medium text-left"
              >
                <span>{`${block.type.toUpperCase()} Block ${index + 1}`}</span>
                <span>{expandedBlocks[index] ? "−" : "+"}</span>
              </button>

              {expandedBlocks[index] && (
                <div className="p-4 bg-white border-t space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <select
                      value={block.type}
                      onChange={(e) =>
                        handleContentChange(index, "type", e.target.value)
                      }
                      className="sm:col-span-3 border rounded p-2"
                    >
                      {tagOptions.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag.toUpperCase()}
                        </option>
                      ))}
                    </select>

                    {block.type === "image" ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleContentFileChange(index, e.target.files[0])
                          }
                          className="sm:col-span-6 border rounded p-2"
                        />
                        {block.filePreview && (
                          <img
                            src={block.filePreview}
                            alt="Preview"
                            className="sm:col-span-3 w-full h-24 object-cover rounded border"
                          />
                        )}
                      </>
                    ) : (
                      <textarea
                        value={block.value}
                        onChange={(e) =>
                          handleContentChange(index, "value", e.target.value)
                        }
                        className="sm:col-span-9 border rounded p-2"
                        placeholder={`Enter ${block.type.toUpperCase()} content...`}
                        rows={2}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeContentBlock(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove Block
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addContentBlock}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded"
          >
            + Add Content Block
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Author Name</label>
            <input
              type="text"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Author Image Upload (optional)
            </label>
            <input
              type="file"
              name="authorImageFile"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
            {formData.authorImagePreview ? (
              <img
                src={formData.authorImagePreview}
                alt="Author Preview"
                className="mt-2 h-16 w-16 object-cover rounded-full border"
              />
            ) : (
              <div className="mt-2 h-16 w-16 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold text-xl border">
                {getInitials(formData.authorName)}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className={`w-full py-3 rounded text-lg font-semibold transition ${
              status === "loading" && submitted
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            disabled={status === "loading" && submitted}
          >
            {status === "loading" && submitted
              ? "Creating Blog..."
              : "Create Blog"}
          </button>

          {status === "succeeded" && submitted && (
            <p className="text-green-600 mt-2 text-sm font-medium">
              ✅ Blog created successfully!
            </p>
          )}

          {status === "failed" && error && submitted && (
            <p className="text-red-600 mt-2 text-sm font-medium">❌ {error}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default BlogAddForm;
