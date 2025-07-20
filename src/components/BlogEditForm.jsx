import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogById, updateBlog } from "../store/blogSlice";
import { tagMap } from "../utils/tagMap";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] + (parts[1]?.[0] || "")).toUpperCase();
};

const BlogEditForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add this line
  const { id } = useParams();
  const { selectedBlog, status, error } = useSelector((state) => state.blog);
  const [formData, setFormData] = useState(null);
  const [expandedBlocks, setExpandedBlocks] = useState([]);

  useEffect(() => {
    if (id) dispatch(fetchBlogById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedBlog?._id === id) {
      setFormData({
        ...selectedBlog,
        tags: selectedBlog.tags?.join(", ") || "",
        imageFile: null,
        imageFilePreview: null,
        preview: selectedBlog.coverImage, // <-- use coverImage from DB
        authorImageFile: null,
        authorImageFilePreview: null,
        authorName: selectedBlog.author?.name || "",
        authorImagePreview: selectedBlog.author?.image || "",
        content:
          selectedBlog.content?.map((block) => ({
            ...block,
            file: null,
            filePreview: block.type === "image" ? block.value : null, // image from DB
          })) || [],
      });
      setExpandedBlocks(selectedBlog.content?.map(() => true) || []);
    }
  }, [selectedBlog, id]);

  // Helper for cover image preview
  const getCoverPreview = () => {
    if (formData?.imageFile && formData.imageFilePreview) {
      return formData.imageFilePreview; // New file preview
    }
    return formData?.preview || ""; // DB image URL
  };

  // Helper for author image preview
  const getAuthorPreview = () => {
    if (formData?.authorImageFile && formData.authorImageFilePreview) {
      return formData.authorImageFilePreview;
    }
    return formData?.authorImagePreview || "";
  };

  // Helper for content image preview
  const getContentBlockPreview = (block) => {
    if (block.file && block.filePreview) {
      return block.filePreview;
    }
    return block.filePreview || ""; // Backend image URL
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.length) {
      const file = files[0];
      const previewURL = URL.createObjectURL(file);
      if (name === "imageFile") {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imageFilePreview: previewURL,
        }));
      } else if (name === "authorImageFile") {
        setFormData((prev) => ({
          ...prev,
          authorImageFile: file,
          authorImageFilePreview: previewURL,
        }));
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;

    const hasNewCover = !!formData.imageFile;
    const hasNewAuthorImage = !!formData.authorImageFile;
    const hasNewContentImages = formData.content.some(
      (block) => block.type === "image" && block.file
    );

    if (hasNewCover || hasNewAuthorImage || hasNewContentImages) {
      const form = new FormData();
      form.append("title", formData.title.trim());
      form.append("excerpt", formData.excerpt.trim());
      form.append("category", formData.category);
      form.append("tags", formData.tags);

      if (formData.imageFile) form.append("blogImage", formData.imageFile);
      if (formData.authorImageFile)
        form.append("blogAImages", formData.authorImageFile);

      // Dynamic content images
      const contentBlocks = formData.content.map((block, index) => {
        const contentBlock = {
          type: block.type,
          value: block.type === "image" ? "" : block.value,
        };
        if (block.type === "image" && block.file) {
          form.append(`content-image-${index}`, block.file);
          contentBlock.attrs = { localId: index };
        }
        return contentBlock;
      });

      form.append("content", JSON.stringify(contentBlocks));
      form.append("_id", formData._id);

      try {
        await dispatch(updateBlog({ id: formData._id, data: form })).unwrap();
        dispatch(fetchBlogById(formData._id)); // reload updated blog from DB
        alert("Blog updated successfully!");
        navigate("/admin/blogs/list"); // <-- Navigate after success
      } catch (err) {
        console.error("Update failed:", err);
      }
    } else {
      // No new files, send as JSON
      const authorImage =
        formData.authorImagePreview || getInitials(formData.authorName);

      const contentBlocks = formData.content.map((block) =>
        block.type === "image" && block.filePreview
          ? { type: "image", value: block.filePreview }
          : { type: block.type, value: block.value }
      );

      const blogPayload = {
        _id: formData._id,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        category: formData.category,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        img: formData.preview,
        content: contentBlocks.filter((block) => block.value),
        author: {
          name: formData.authorName.trim(),
          image: authorImage,
        },
        updatedAt: new Date().toISOString(),
      };

      try {
        await dispatch(
          updateBlog({ id: formData._id, data: blogPayload })
        ).unwrap();
        alert("Blog updated successfully!");
        dispatch(fetchBlogById(formData._id)); // <-- reload updated blog from DB
      } catch (err) {
        console.error("Update failed:", err);
      }
    }
  };

  if (status === "loading" || !formData) {
    return <div className="text-center p-6">Loading blog...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6">
        <h2 className="text-2xl font-bold text-center">Edit Blog</h2>

        {/* Cover Image */}
        <div>
          <label className="font-semibold block mb-1">Cover Image</label>
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleChange}
          />
          {getCoverPreview() && (
            <img
              src={getCoverPreview()}
              alt="preview"
              className="w-full h-60 object-cover mt-2 rounded"
            />
          )}
        </div>

        {/* Title and Excerpt */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        {/* Category and Tags */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Category</label>
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
            <label className="font-semibold block mb-1">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        {/* Content Blocks */}
        <div>
          <label className="block font-semibold mb-2">Content Blocks</label>
          {formData.content.map((block, index) => (
            <div key={index} className="border rounded-lg mb-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedBlocks((prev) =>
                    prev.map((open, i) => (i === index ? !open : open))
                  )
                }
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 font-medium text-left"
              >
                <span>{`${block.type.toUpperCase()} Block ${index + 1}`}</span>
                <span>{expandedBlocks[index] ? "−" : "+"}</span>
              </button>
              {expandedBlocks[index] && (
                <div className="p-4 bg-white border-t space-y-3">
                  <select
                    value={block.type}
                    onChange={(e) =>
                      handleContentChange(index, "type", e.target.value)
                    }
                    className="w-full mb-2 border rounded p-2"
                  >
                    {Object.keys(tagMap).map((tag) => (
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
                        className="w-full border rounded p-2"
                      />
                      {getContentBlockPreview(block) && (
                        <img
                          src={getContentBlockPreview(block)}
                          className="mt-2 h-40 w-full object-cover rounded"
                        />
                      )}
                    </>
                  ) : (
                    <textarea
                      value={block.value}
                      onChange={(e) =>
                        handleContentChange(index, "value", e.target.value)
                      }
                      rows="2"
                      className="w-full border rounded p-2"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeContentBlock(index)}
                    className="text-red-600 mt-2 text-sm"
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
            + Add Block
          </button>
        </div>

        {/* Author Info */}
        <div className="grid sm:grid-cols-2 gap-4">
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
            <label className="block font-semibold mb-1">Author Image</label>
            <input
              type="file"
              name="authorImageFile"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
            {getAuthorPreview() ? (
              <img
                src={getAuthorPreview()}
                alt="author"
                className="mt-2 h-16 w-16 object-cover rounded-full border"
              />
            ) : (
              <div className="mt-2 h-16 w-16 bg-gray-200 text-gray-600 flex items-center justify-center rounded-full font-bold text-xl">
                {getInitials(formData.authorName)}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-700 text-white py-3 rounded text-lg font-semibold"
          >
            Update Blog
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default BlogEditForm;
