import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const CourseCreateForm = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const type = watch("type");
  const [typeSelected, setTypeSelected] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [brochurePreview, setBrochurePreview] = useState(null);

  useEffect(() => {
    if (type) setTypeSelected(true);
  }, [type]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("previewVideo", file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBrochureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("downloadBrochure", file);
      setBrochurePreview({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  };

const buildFormData = (data) => {
  const formData = new FormData();

  const customSplit = (input) => {
    const result = [];
    let current = '';
    let depth = 0;

    for (let char of input) {
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
  for (const key in data) {
    if (typeof data[key] === "string" || typeof data[key] === "number") {
      formData.append(key, data[key]);
    }
  }
  ["whatYouWillLearn", "topics", "includes", "requirements"].forEach((field) => {
    if (data[field]) {
      let items;

      try {
        const parsed = JSON.parse(data[field]);
        if (Array.isArray(parsed)) {
          items = parsed;
        } else {
          items = customSplit(data[field]);
        }
      } catch {
        items = customSplit(data[field]);
      }

      formData.set(field, JSON.stringify(items)); 
    }
  });

  if (data.previewVideo) formData.append("previewVideo", data.previewVideo);
  if (data.image) formData.append("image", data.image);
  if (data.downloadBrochure)
    formData.append("downloadBrochure", data.downloadBrochure);

  return formData;
};


  const onFormSubmit = (data) => {
    const formData = buildFormData(data);
    onSubmit(formData);
  };

  return (
    <div className="max-w-5xl mx-auto p-10 bg-white shadow-xl rounded-2xl border">
      <h2 className="text-3xl font-bold mb-8">📘 Create New Course</h2>
      <form onSubmit={handleSubmit(onFormSubmit)} encType="multipart/form-data" className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Course Type</label>
          <select
            {...register("type", { required: true })}
            className="w-full border px-3 py-2 rounded-md"
            defaultValue=""
          >
            <option value="" disabled>
              Select type
            </option>
            <option value="Student">Student</option>
            <option value="Business">Business</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">Required</p>
          )}
        </div>

        {typeSelected && (
          <>
            <div>
              <label className="block mb-1 font-semibold">Title</label>
              <input
                {...register("title", { required: true })}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Subtitle</label>
              <input
                {...register("subtitle", { required: true })}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Course Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border px-3 py-2 rounded-md"
                required
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Course Preview"
                  className="mt-2 w-64 h-auto rounded-md border"
                />
              )}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Category</label>
              <input
                {...register("category", { required: true })}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            {type === "Student" && (
              <>
                <div>
                  <label className="block mb-1 font-semibold">
                    Preview Video
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="w-full border px-3 py-2 rounded-md"
                    required
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
                  <label className="block mb-1 font-semibold">
                    What You Will Learn
                  </label>
                  <input
                    {...register("whatYouWillLearn", { required: true })}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1 font-semibold">Price</label>
                    <input
                      type="number"
                      {...register("price", { required: true })}
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      {...register("salePrice")}
                      className="w-full border px-3 py-2 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Topics</label>
                  <input
                    {...register("topics", { required: true })}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    Requirements
                  </label>
                  <input
                    {...register("requirements", { required: true })}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
              </>
            )}

            {type === "Business" && (
              <div>
                <label className="block mb-1 font-semibold">
                  Brochure (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleBrochureChange}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                />
                {brochurePreview && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      📄 {brochurePreview.name}
                    </p>
                    <a
                      href={brochurePreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      🔗 Open Preview
                    </a>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block mb-1 font-semibold">Includes</label>
              <input
                {...register("includes", { required: true })}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">
                Course Description
              </label>
              <textarea
                {...register("description", { required: true })}
                rows={5}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            <div>
              <button
                type="submit"
                className="bg-primary hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md"
              >
                ➕ Create Course
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default CourseCreateForm;
