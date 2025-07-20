import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchPurchasedEnrolledCourses,
  selectPurchasedCourses,
  updateCourseEnrollment,
} from "../store/courseStudentSlice";
import FileUploadPreview from "./FileUploadPreview";
import QuizEditor from "./QuizEditor";

const CourseEnrolledEdit = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const enrolledCourses = useSelector(selectPurchasedCourses);
  const [formData, setFormData] = useState(null);
  const [openModules, setOpenModules] = useState([]);
  const [openTopics, setOpenTopics] = useState({});
  const contentTypes = ["video", "pdf", "image", "audio", "test"];

  useEffect(() => {
  if (courseId) {
    dispatch(fetchPurchasedEnrolledCourses());
  }
}, [dispatch, courseId]);

useEffect(() => {
  if (!courseId || !enrolledCourses?.length) return;

  const selected = enrolledCourses.find((c) => c.courseId === courseId);
  console.log(selected)
  if (selected) {
    setFormData({
      ...selected,
      tags: selected.tags?.join(", ") || "",
    });
  }
}, [enrolledCourses, courseId]);

  // if (!formData) return <div className="p-6">Loading course data...</div>;

  const updateAndSetModules = (updatedModules) => {
    const totalHours = updatedModules.reduce((sum, m) => sum + Number(m.duration || 0), 0);
    const watchedHours = updatedModules.reduce((sum, m) => sum + Number(m.watched || 0), 0);
    const assessments = updatedModules.reduce((sum, m) => sum + (m.assessments || 0), 0);
    const assignments = updatedModules.reduce((sum, m) => sum + (m.assignments || 0), 0);
    const questions = updatedModules.reduce(
      (sum, m) =>
        sum +
        m.topics?.reduce(
          (qSum, t) =>
            qSum +
            t.contents?.reduce((cSum, c) => cSum + (c.questions?.length || 0), 0),
          0
        ),
      0
    );
    setFormData((prev) => ({
      ...prev,
      modules: updatedModules,
      totalHours,
      watchedHours,
      assessments,
      assignments,
      questions,
    }));
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
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

  const handleUpdateEnrollment = async () => {
    const payload = {
      id: formData.id,
      enrolledCourses: {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      },
    };
    await dispatch(updateCourseEnrollment(payload));
    await dispatch(fetchPurchasedEnrolledCourses(courseId));
    alert("Enrollment updated!");
  };

  const addModule = () => {
    const newModules = [
      ...(formData?.modules || []),
      { moduleTitle: "", description: "", topics: [] },
    ];
    updateAndSetModules(newModules);
  };

  const removeModule = (mIndex) => {
    const newModules = formData.modules.filter((_, i) => i !== mIndex);
    updateAndSetModules(newModules);
  };

  const addTopic = (mIndex) => {
    const newModules = [...formData.modules];
    newModules[mIndex].topics = newModules[mIndex].topics || [];
    newModules[mIndex].topics.push({ topicTitle: "", contents: [] });
    updateAndSetModules(newModules);
  };

  const removeTopic = (mIndex, tIndex) => {
    const newModules = [...formData.modules];
    newModules[mIndex].topics = newModules[mIndex].topics.filter((_, i) => i !== tIndex);
    updateAndSetModules(newModules);
  };

  const addContent = (mIndex, tIndex) => {
    const newModules = [...formData.modules];
    newModules[mIndex].topics[tIndex].contents = newModules[mIndex].topics[tIndex].contents || [];
    newModules[mIndex].topics[tIndex].contents.push({
      type: "video",
      url: "",
      duration: "",
      title: "",
      questions: [],
    });
    updateAndSetModules(newModules);
  };

  const removeContent = (mIndex, tIndex, cIndex) => {
    const newModules = [...formData.modules];
    newModules[mIndex].topics[tIndex].contents = newModules[mIndex].topics[tIndex].contents.filter((_, i) => i !== cIndex);
    updateAndSetModules(newModules);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Edit Course Enrollment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Badge"
          className="border p-2 rounded"
          value={formData?.badge}
          onChange={(e) => handleInputChange("badge", e.target.value)}
        />
        <input
          type="text"
          placeholder="Level"
          className="border p-2 rounded"
          value={formData?.level}
          onChange={(e) => handleInputChange("level", e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          className="border p-2 rounded col-span-full"
          value={formData?.tags}
          onChange={(e) => handleInputChange("tags", e.target.value)}
        />
        <input
          type="text"
          readOnly
          className="border p-2 rounded bg-gray-100"
          value={`Total Hours: ${formData?.totalHours}`}
        />
        <input
          type="text"
          readOnly
          className="border p-2 rounded bg-gray-100"
          value={`Watched Hours: ${formData?.watchedHours}`}
        />
        <input
          type="text"
          readOnly
          className="border p-2 rounded bg-gray-100"
          value={`Assessments: ${formData?.assessments}`}
        />
        <input
          type="text"
          readOnly
          className="border p-2 rounded bg-gray-100"
          value={`Assignments: ${formData?.assignments}`}
        />
        <input
          type="text"
          readOnly
          className="border p-2 rounded bg-gray-100"
          value={`Questions: ${formData?.questions}`}
        />
      </div>

      {formData?.modules.map((module, mIndex) => (
        <div key={mIndex} className="border p-4 rounded bg-white mb-6 shadow-sm">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleModule(mIndex)}>
            <h3 className="text-lg font-medium text-gray-800">
              📦 Module {mIndex + 1}: {module.moduleTitle || "Untitled"}
            </h3>
            <button onClick={() => removeModule(mIndex)} className="text-sm text-red-600">🗑 Remove</button>
          </div>

          {openModules?.includes(mIndex) && (
            <>
              <input
                type="text"
                placeholder="Module Title"
                className="border p-2 rounded w-full mt-2"
                value={module?.moduleTitle}
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
              {module.topics.map((topic, tIndex) => {
                const topicKey = `${mIndex}-${tIndex}`;
                return (
                  <div key={tIndex} className="ml-4 mt-4 border-l pl-4 border-gray-300">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleTopic(mIndex, tIndex)}>
                      <h4 className="font-semibold">
                        🧩 Topic {tIndex + 1}: {topic.topicTitle || "Untitled"}
                      </h4>
                      <button onClick={() => removeTopic(mIndex, tIndex)} className="text-xs text-red-500">🗑 Remove</button>
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
                            updated[mIndex].topics[tIndex].topicTitle = e.target.value;
                            updateAndSetModules(updated);
                          }}
                        />
                        {topic.contents.map((content, cIndex) => (
                          <div key={cIndex} className="ml-4 mt-3 space-y-2 border-l pl-4">
                            <select
                              value={content.type}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIndex].topics[tIndex].contents[cIndex].type = e.target.value;
                                updateAndSetModules(updated);
                              }}
                              className="border p-2 rounded w-full"
                            >
                              {contentTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>

                            <FileUploadPreview
                              content={content}
                              onChange={(updatedContent) => {
                                const updated = [...formData.modules];
                                updated[mIndex].topics[tIndex].contents[cIndex] = updatedContent;
                                updateAndSetModules(updated);
                              }}
                              onRemove={() => removeContent(mIndex, tIndex, cIndex)}
                            />

                            <QuizEditor
                              questions={content.questions || []}
                              onChange={(updatedQuestions) => {
                                const updated = [...formData.modules];
                                updated[mIndex].topics[tIndex].contents[cIndex].questions = updatedQuestions;
                                updateAndSetModules(updated);
                              }}
                            />
                          </div>
                        ))}
                        <button onClick={() => addContent(mIndex, tIndex)} className="text-xs mt-2 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded">➕ Add Content</button>
                      </>
                    )}
                  </div>
                );
              })}
              <button onClick={() => addTopic(mIndex)} className="text-sm mt-2 bg-green-100 hover:bg-green-200 px-2 py-1 rounded">➕ Add Topic</button>
            </>
          )}
        </div>
      ))}

      <button onClick={addModule} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded mb-4">
        ➕ Add Module
      </button>

      <button onClick={handleUpdateEnrollment} className="mt-6 ml-5 bg-primary hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded">
        💾 Update Enrollment
      </button>
    </div>
  );
};

export default CourseEnrolledEdit;
