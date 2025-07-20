import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCourseById,
  editCourse,
  selectCourseStatus,
  selectSelectedCourse,
} from "../store/courseSlice";

const CourseEditForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const status = useSelector(selectCourseStatus);
  const course = useSelector(selectSelectedCourse);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const type = watch("type");

  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [brochurePreview, setBrochurePreview] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);

  useEffect(() => {
    dispatch(fetchCourseById(courseId));
  }, [dispatch, courseId]);

  useEffect(() => {
    if (course) {
      reset({
        ...course,
        whatYouWillLearn: (course.whatYouWillLearn || []).join(", "),
        topics: (course.topics || []).join(", "),
        includes: (course.includes || []).join(", "),
        requirements: (course.requirements || []).join(", "),
      });

      // Load previews from DB URLs
      setImagePreview(course.image || null);
      setVideoPreview(course.previewVideo || null);
      setBrochurePreview(course.downloadBrochure || null);
    }
  }, [course, reset]);

const customSplit = (input) => {
  const result = [];
  let current = '';
  let depth = 0;

  for (const char of input) {
    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      if (char === '(') depth++;
      if (char === ')') depth--;
      current += char;
    }
  }

  if (current) result.push(current.trim());
  return result.filter(Boolean);
};
const preparePayload = (data, imageFile, videoFile, brochureFile, course = {}) => {
  const fieldsToSplit = ["whatYouWillLearn", "topics", "includes", "requirements"];
  const payload = { ...data };
  fieldsToSplit.forEach((field) => {
    const value = data[field];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        payload[field] = Array.isArray(parsed) ? parsed : customSplit(value);
      } catch {
        payload[field] = customSplit(value);
      }
    }
  });

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    const finalValue = Array.isArray(value) ? JSON.stringify(value) : value;
    formData.append(key, finalValue);
  });
  if (imageFile) {
    formData.append("image", imageFile);
    if (course.image) {
      formData.append("oldImageUrl", course.image);
    }
  }
  if (videoFile) {
    formData.append("previewVideo", videoFile);
    if (course.previewVideo) {
      formData.append("oldVideoUrl", course.previewVideo);
    }
  }
  if (brochureFile) {
    formData.append("downloadBrochure", brochureFile);
    if (course.downloadBrochure) {
      formData.append("oldBrochureUrl", course.downloadBrochure);
    }
  }

  return formData;
};

  const onSubmit = async (data) => {
    try {
      const formData = preparePayload(data);
      await dispatch(editCourse({ courseId, formData })).unwrap();
      navigate("/admin/courses/list");
    } catch (err) {
      console.error("Failed to update course:", err);
    }
  };

  if (!course) return <div className="text-center py-10">Loading course data...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-10 bg-white shadow-xl rounded-2xl border border-gray-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">✏️ Edit Course ({course.title})</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {type && (
          <>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Title</label>
              <input
                {...register("title", { required: true })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
                placeholder="Course Title"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Subtitle</label>
              <input
                {...register("subtitle")}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Course Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Course preview"
                  className="mt-2 w-64 h-auto rounded-md border"
                />
              )}
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Category</label>
              <input
                {...register("category")}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            {type === "Student" && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Preview Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setVideoFile(file);
                      setVideoPreview(URL.createObjectURL(file));
                    }}
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  />
                  {videoPreview && (
                    <video
                      src={videoPreview}
                      controls
                      className="mt-2 w-full rounded-md border"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    What You Will Learn
                  </label>
                  <input
                    {...register("whatYouWillLearn")}
                    placeholder="Comma-separated list"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      {...register("price")}
                      className="w-full border border-gray-300 px-3 py-2 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Sale Price</label>
                    <input
                      type="number"
                      {...register("salePrice")}
                      className="w-full border border-gray-300 px-3 py-2 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Topics</label>
                  <input
                    {...register("topics")}
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Requirements</label>
                  <input
                    {...register("requirements")}
                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  />
                </div>
              </>
            )}
            {type === "Business" && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Brochure (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setBrochureFile(file);
                    setBrochurePreview({ name: file.name, url: URL.createObjectURL(file) });
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                />
                {brochurePreview && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      📄 {brochurePreview.name || brochurePreview.split("/").pop()}
                    </p>
                    <a
                      href={brochurePreview.url || brochurePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      🔗 Open Brochure
                    </a>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Includes</label>
              <input
                {...register("includes")}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={status === "updating"}
                className={`bg-primary hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md ${
                  status === "updating" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                💾 {status === "updating" ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default CourseEditForm;
