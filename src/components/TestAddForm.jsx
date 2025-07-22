import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFinalTestToCourse, fetchAllCourseStudents,selectStudentCourseList } from '../store/courseStudentSlice';
import { useNavigate } from 'react-router-dom';

const TestAddForm = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectStudentCourseList);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [testName, setTestName] = useState('Final Course Test');
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', ''],
    answerIndex: [],
    type: 'single',
  });

  useEffect(() => {
    dispatch(fetchAllCourseStudents());
  }, [dispatch]);

  const selectedCourseTitle = courses.find(c => c._id === selectedCourse)?.title || '';

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleAnswerChange = (index) => {
    if (newQuestion.type === 'single') {
      setNewQuestion((prev) => ({ ...prev, answerIndex: [index] }));
    } else {
      const updated = new Set(newQuestion.answerIndex);
      updated.has(index) ? updated.delete(index) : updated.add(index);
      setNewQuestion((prev) => ({ ...prev, answerIndex: Array.from(updated) }));
    }
  };

  const handleAddOption = () => {
    setNewQuestion((prev) => ({ ...prev, options: [...prev.options, ''] }));
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
    const updatedAnswers = newQuestion.answerIndex
      .filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i));
    setNewQuestion((prev) => ({
      ...prev,
      options: updatedOptions,
      answerIndex: updatedAnswers,
    }));
  };

const handleAddQuestion = () => {
  if (!newQuestion.question.trim() || newQuestion.options.some((opt) => !opt.trim())) {
    alert("All fields must be filled");
    return;
  }

  const correctAnswers =
    newQuestion.type === "multi"
      ? newQuestion.answerIndex
      : [newQuestion.answerIndex[0]];

  const questionToAdd = {
    question: newQuestion.question,
    options: newQuestion.options,
    answer: correctAnswers.map((i) => newQuestion.options[i]),
    type: newQuestion.type,
  };

  setQuestions([...questions, questionToAdd]);

  // Reset
  setNewQuestion({
    question: "",
    options: ["", ""],
    answerIndex: [],
    type: "single",
  });
};



const handleSubmit = async () => {
  if (!selectedCourse || questions.length === 0) {
    alert("Please select a course and add at least one question.");
    return;
  }

  const selectedCourseData = courses.find(
    (c) => c.courseId === selectedCourse || c._id === selectedCourse
  );

  if (!selectedCourseData) {
    alert("Invalid course selected.");
    return;
  }

  const finalTest = {
    name: testName.trim() || "Final Test",
    type: "test",
    completed: false,
    score: 0,
    questions: questions.map((q) => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      selectedAnswer: "",
      multiSelect: q.type === "multi",
      isCorrect: false,
    })),
  };

  try {
    const result = await dispatch(
      addFinalTestToCourse({
        courseId: selectedCourseData.courseId || selectedCourseData._id,
        finalTest,
      })
    );

    if (addFinalTestToCourse.fulfilled.match(result)) {
      alert("✅ Final test questions added!");
      setQuestions([]);
      setTestName("");
      setSelectedCourse("");
      navigate("/admin/test/list");
    } else {
      alert(result.payload || "❌ Failed to add test questions.");
    }
  } catch (err) {
    console.error("❌ Submission error:", err);
    alert("❌ Unexpected error occurred.");
  }
};


  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white shadow-lg rounded-lg space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Final Test {selectedCourseTitle && `- ${selectedCourseTitle}`}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-1">Select Course</label>
          <select
            className="w-full border rounded p-2"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Select Course --</option>
           {Array.isArray(courses) && courses.map((course) => (
  <option key={course.courseId} value={course.courseId}>
    {course.title}
  </option>
))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Test Title</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g. Final Course Test"
          />
        </div>
      </div>
      {selectedCourse && (
        <>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Add Question</h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="font-semibold">Type:</label>
              <select
                className="border rounded p-2"
                value={newQuestion.type}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    type: e.target.value,
                    answerIndex: [],
                  }))
                }
              >
                <option value="single">Single Select</option>
                <option value="multi">Multi Select</option>
              </select>
            </div>

            <textarea
              className="w-full border rounded p-3 h-24"
              placeholder="Enter question here..."
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion((prev) => ({ ...prev, question: e.target.value }))
              }
            />

            <div className="space-y-2">
              {newQuestion.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    className="flex-1 border rounded p-2"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type={newQuestion.type === 'single' ? 'radio' : 'checkbox'}
                      checked={newQuestion.answerIndex.includes(idx)}
                      onChange={() => handleAnswerChange(idx)}
                    />
                    Correct
                  </label>
                  {newQuestion.options.length > 2 && (
                    <button
                      className="text-red-600 text-xl font-bold"
                      onClick={() => handleRemoveOption(idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={handleAddOption}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded"
              >
                + Add Option
              </button>
              <button
                onClick={handleAddQuestion}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Add Question
              </button>
            </div>
          </div>
          {questions.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Questions Added</h4>
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="border border-gray-300 rounded p-4 mb-3 bg-gray-50 shadow-sm"
                >
                  <p className="font-semibold">Q{i + 1}: {q.question}</p>
                  <p>
                    <span className="font-medium">Type:</span>{' '}
                    {q.type === 'multi' ? 'Multiple Select' : 'Single Select'}
                  </p>
                  <p><span className="font-medium">Options:</span> {q.options.join(', ')}</p>
                  <p><span className="font-medium">Answer:</span> {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-indigo-700 text-white py-3 rounded text-lg font-semibold mt-4"
          >
            Submit Final Test
          </button>
        </>
      )}
    </div>
  );
};

export default TestAddForm;
