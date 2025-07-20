import React from "react";
import { useDispatch } from "react-redux";
import CourseCreateForm from "../components/CourseCreateForm.jsx";
import {createCourse} from "../store/courseSlice.js"
import { useNavigate } from "react-router-dom";

const CourseAddForm = () => {
  const dispatch = useDispatch();

const navigate = useNavigate();

const handleCreateCourse = async (formData) => {
  try {
    console.log("Creating course with data:", formData);
    await dispatch(createCourse(formData)).unwrap();
    console.log("✅ Course created successfully!");
    navigate("/admin/courses/list"); 
  } catch (err) {
    console.error("❌ Course creation failed:", err);
  }
};

  return (
    <div className="p-6">
      <CourseCreateForm onSubmit={handleCreateCourse} />
    </div>
  );
};

export default CourseAddForm;
