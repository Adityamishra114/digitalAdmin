import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCourseStudents,
  selectAllEnrolledCourses,
  selectCourseStudentStatus,
  createCourseEnrollment,
  fetchPurchasedEnrolledCourses,
  selectTotalFinalQuestions,
} from "../store/courseStudentSlice";
import FileUploadPreview from "./FileUploadPreview";
import QuizEditor from "./QuizEditor";
import {calculateDurationsAndCounts} from "../utils/enrolledCal"
const contentTypes = ["video", "pdf", "image", "audio", "test"];

const CourseEnrolledAdd = () => {
  const dispatch = useDispatch();
  const finalTestQuestions = useSelector(selectTotalFinalQuestions);
  const enrolledCourses = useSelector(selectAllEnrolledCourses);
  const status = useSelector(selectCourseStudentStatus);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [formData, setFormData] = useState({
    badge: "",
    level: "",
    tags: "",
    modules: [],
    totalHours: 0,
    watchedHours: 0,
    assessments: 0,
    assignments: 0,
    questions: 0,
  });

  const [openModules, setOpenModules] = useState([]);
  const [openTopics, setOpenTopics] = useState({});

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllCourseStudents());
    }
  }, [dispatch, status]);


const updateAndSetModules = (updatedModules) => {
  const {
    totalHours,
    watchedHours,
    assessments,
    assignments,
  } = calculateDurationsAndCounts(updatedModules);

  const totalQuestions = updatedModules.reduce((acc, mod) => {
    const topicQuestions = mod.topics.reduce((a, t) => {
      const contentQuestions = t.contents.reduce((c, cont) => {
        const count = Array.isArray(cont.questions) ? cont.questions.length : 0;
        return c + count;
      }, 0);
      return a + contentQuestions;
    }, 0);

    const finalTestQuestions = Array.isArray(mod.finalTest?.questions)
      ? mod.finalTest.questions.length
      : 0;

    return acc + topicQuestions + finalTestQuestions;
  }, 0);

  setFormData((prev) => ({
    ...prev,
    modules: updatedModules,
    totalHours,
    watchedHours,
    assessments,
    assignments,
    questions: totalQuestions,
  }));
};


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleModule = (index) => {
    setOpenModules((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleTopic = (mIndex, tIndex) => {
    const key = `${mIndex}-${tIndex}`;
    setOpenTopics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddModule = () => {
    const newModules = [
      ...formData.modules,
      {
        moduleTitle: "",
        description: "",
        completed: false,
        topics: [],
      },
    ];
    updateAndSetModules(newModules);
  };

  const handleRemoveModule = (mIndex) => {
    const updated = formData.modules.filter((_, i) => i !== mIndex);
    updateAndSetModules(updated);
  };

  const handleAddTopic = (moduleIndex) => {
    const updated = [...formData.modules];
    updated[moduleIndex].topics.push({
      topicTitle: "",
      completed: false,
      contents: [],
    });
    updateAndSetModules(updated);
  };

  const handleRemoveTopic = (mIndex, tIndex) => {
    const updated = [...formData.modules];
    updated[mIndex].topics.splice(tIndex, 1);
    updateAndSetModules(updated);
  };

  const handleAddContent = (moduleIndex, topicIndex) => {
    const updated = [...formData.modules];
    updated[moduleIndex].topics[topicIndex].contents.push({
      type: "video",
      name: "",
      duration: "",
      pages: "",
      url: "",
      completed: false,
      questions: [],
    });
    updateAndSetModules(updated);
  };

const handleCreateEnrollment = async () => {
  try {
    const finalTest = {
      title: "Final Assessment",
      questions: finalTestQuestions || [],
    };

    const payload = {
      courseId: selectedCourseId,
      badge: formData.badge,
      level: formData.level,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
      totalHours: formData.totalHours,
      watchedHours: formData.watchedHours,
      modules: formData.modules,
      finalTest, 
      questions: finalTestQuestions,
    };

    const result = await dispatch(createCourseEnrollment(payload));

    if (createCourseEnrollment.fulfilled.match(result)) {
      alert("Enrollment created successfully!");
      await dispatch(fetchPurchasedEnrolledCourses());
    } else {
      alert(result.payload || "Failed to create enrollment.");
    }
  } catch (error) {
    console.error("Create enrollment error:", error);
    alert("Unexpected error occurred.");
  }
};




  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Create Course Enrollment</h2>

      <select
        className="border px-3 py-2 rounded w-full max-w-md mb-6"
        value={selectedCourseId}
        onChange={(e) => setSelectedCourseId(e.target.value)}
      >
        <option value="">🎓 Select a Student Course</option>
        {enrolledCourses.map((course) => (
          <option key={course.courseId} value={course.courseId}>
            {course.title}
          </option>
        ))}
      </select>

      {selectedCourseId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Badge"
              className="border p-2 rounded"
              value={formData.badge}
              onChange={(e) => handleInputChange("badge", e.target.value)}
            />
            <input
              type="text"
              placeholder="Level"
              className="border p-2 rounded"
              value={formData.level}
              onChange={(e) => handleInputChange("level", e.target.value)}
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              className="border p-2 rounded col-span-full"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
            />
            <input
              type="text"
              readOnly
              className="border p-2 rounded bg-gray-100"
              value={`Total Hours: ${formData.totalHours}`}
            />
            <input
              type="text"
              readOnly
              className="border p-2 rounded bg-gray-100"
              value={`Watched Hours: ${formData.watchedHours}`}
            />
            <input
              type="text"
              readOnly
              className="border p-2 rounded bg-gray-100"
              value={`Assessments: ${formData.assessments}`}
            />
            <input
              type="text"
              readOnly
              className="border p-2 rounded bg-gray-100"
              value={`Assignments: ${formData.assignments}`}
            />
            <input
              type="text"
              readOnly
              className="border p-2 rounded bg-gray-100"
              value={`Questions: ${formData.questions}`}
            />
          </div>
          <button
            onClick={handleAddModule}
            className="text-primary underline mb-4"
          >
            ➕ Add Module
          </button>
          {formData.modules.map((module, mIndex) => (
            <div
              key={mIndex}
              className="border p-4 rounded bg-white mb-6 shadow-sm"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleModule(mIndex)}
              >
                <h3 className="text-lg font-medium text-gray-800">
                  📦 Module {mIndex + 1}: {module.moduleTitle || "Untitled"}
                </h3>
                <div className="flex gap-4 items-center">
                  <span className="text-sm text-gray-500">
                    {module.completed ? "✅ Completed" : "❌ Incomplete"}
                  </span>
                  <button
                    onClick={() => handleRemoveModule(mIndex)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {openModules.includes(mIndex) && (
                <>
                  <input
                    type="text"
                    placeholder="Module Title"
                    className="border p-2 rounded w-full mt-2"
                    value={module.moduleTitle}
                    onChange={(e) => {
                      const updated = [...formData.modules];
                      updated[mIndex].moduleTitle = e.target.value;
                      updateAndSetModules(updated);
                    }}
                  />
                  <textarea
                    placeholder="Module Description"
                    className="border p-2 rounded w-full mt-2"
                    value={module.description}
                    onChange={(e) => {
                      const updated = [...formData.modules];
                      updated[mIndex].description = e.target.value;
                      updateAndSetModules(updated);
                    }}
                  />
                  <button
                    onClick={() => handleAddTopic(mIndex)}
                    className="text-primary text-sm mt-2"
                  >
                    ➕ Add Topic
                  </button>

                  {module.topics.map((topic, tIndex) => {
                    const topicKey = `${mIndex}-${tIndex}`;
                    return (
                      <div
                        key={tIndex}
                        className="ml-4 mt-4 border-l pl-4 border-gray-300"
                      >
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleTopic(mIndex, tIndex)}
                        >
                          <h4 className="font-semibold">
                            🧩 Topic {tIndex + 1}:{" "}
                            {topic.topicTitle || "Untitled"}
                          </h4>
                          <div className="flex gap-4 items-center">
                            <span className="text-sm text-gray-500">
                              {topic.completed ? "✅" : "❌"}
                            </span>
                            <button
                              onClick={() => handleRemoveTopic(mIndex, tIndex)}
                              className="text-red-500 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {openTopics[topicKey] && (
                          <>
                            <input
                              type="text"
                              placeholder="Topic Title"
                              className="border p-2 rounded w-full mt-2"
                              value={topic.topicTitle}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIndex].topics[tIndex].topicTitle =
                                  e.target.value;
                                updateAndSetModules(updated);
                              }}
                            />
                            <button
                              onClick={() => handleAddContent(mIndex, tIndex)}
                              className="text-green-600 text-xs mt-2 underline"
                            >
                              ➕ Add Content
                            </button>

                            {topic.contents.map((content, cIndex) => (
                              <div
                                key={cIndex}
                                className="ml-4 mt-3 space-y-2 border-l pl-4"
                              >
                                <select
                                  value={content.type}
                                  onChange={(e) => {
                                    const updated = [...formData.modules];
                                    updated[mIndex].topics[tIndex].contents[
                                      cIndex
                                    ].type = e.target.value;
                                    updateAndSetModules(updated);
                                  }}
                                  className="border p-2 rounded w-full"
                                >
                                  {contentTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              <FileUploadPreview
  content={content}
  onChange={(updatedContent) => {
    const updated = [...formData.modules];
    updated[mIndex].topics[tIndex].contents[cIndex] = updatedContent;
    updateAndSetModules(updated);
  }}
  onRemove={() => {
    const updated = [...formData.modules];
    updated[mIndex].topics[tIndex].contents[cIndex].url = "";
    updated[mIndex].topics[tIndex].contents[cIndex].duration = "";
    updated[mIndex].topics[tIndex].contents[cIndex].pages = "";
    updateAndSetModules(updated);
  }}
/>
<QuizEditor
  questions={content.questions || []}
  onChange={(updatedQuestions) => {
    const updated = [...formData.modules];
    updated[mIndex].topics[tIndex].contents[cIndex].questions =
      updatedQuestions;
    updateAndSetModules(updated);
  }}
/>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          ))}

          <button
            onClick={handleCreateEnrollment}
            className="mt-6 ml-4 bg-primary hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          >
            ✅ Create Enrollment
          </button>
        </>
      )}
    </div>
  );
};

export default CourseEnrolledAdd;