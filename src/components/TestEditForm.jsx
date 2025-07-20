import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCourseStudents } from '../store/courseStudentSlice';

const TestEditForm = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courseStudent.enrolledCourses || []);

  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [testName, setTestName] = useState('Final Course Test');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', ''],
    answerIndex: [],
    type: 'single',
  });

  useEffect(() => {
    dispatch(fetchAllCourseStudents());
  }, [dispatch]);

  // Load test from selected course
  useEffect(() => {
    if (selectedCourseTitle && courses.length > 0) {
      const course = courses.find((c) => c.title === selectedCourseTitle);
      if (course) {
        const test = course.finalTest || {};
        setTestName(test.name || 'Final Course Test');
        setQuestions(test.questions || []);
        setSelectedQuestionIndex(0);
      }
    }
  }, [selectedCourseTitle, courses]);

  // Load selected question
  useEffect(() => {
    const q = questions[selectedQuestionIndex];
    if (q) {
      const answerIndexes = Array.isArray(q.answer)
        ? q.answer.map((ans) => q.options.indexOf(ans))
        : [q.options.indexOf(q.answer)];

      setNewQuestion({
        question: q.question || '',
        options: [...q.options],
        answerIndex: answerIndexes,
        type: q.type || 'single',
      });
    } else {
      setNewQuestion({
        question: '',
        options: ['', '', ''],
        answerIndex: [],
        type: 'single',
      });
    }
  }, [selectedQuestionIndex, questions]);

  const handleOptionChange = (index, value) => {
    const updated = [...newQuestion.options];
    updated[index] = value;
    setNewQuestion({ ...newQuestion, options: updated });
  };

  const handleAnswerChange = (index) => {
    if (newQuestion.type === 'single') {
      setNewQuestion({ ...newQuestion, answerIndex: [index] });
    } else {
      const setAnswers = new Set(newQuestion.answerIndex);
      setAnswers.has(index) ? setAnswers.delete(index) : setAnswers.add(index);
      setNewQuestion({ ...newQuestion, answerIndex: [...setAnswers] });
    }
  };

  const handleAddOption = () => {
    setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
    const updatedAnswers = newQuestion.answerIndex
      .filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i));

    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
      answerIndex: updatedAnswers,
    });
  };

  const handleSaveQuestion = () => {
    const { question, options, answerIndex, type } = newQuestion;
    const cleanedOptions = options.filter((opt) => opt.trim());

    if (!question.trim() || cleanedOptions.length < 2 || answerIndex.length === 0) {
      alert('Please fill all required fields.');
      return;
    }

    const answers = answerIndex.map((i) => cleanedOptions[i]);

    const updated = {
      question: question.trim(),
      options: cleanedOptions,
      answer: type === 'single' ? answers[0] : answers,
      selectedAnswer: '',
      isCorrect: false,
      type,
    };

    const updatedList = [...questions];
    updatedList[selectedQuestionIndex] = updated;
    setQuestions(updatedList);
  };

  const handleAddNewQuestion = () => {
    handleSaveQuestion();
    const newQ = {
      question: '',
      options: ['', '', ''],
      answer: '',
      selectedAnswer: '',
      isCorrect: false,
      type: 'single',
    };
    setQuestions([...questions, newQ]);
    setSelectedQuestionIndex(questions.length);
  };

  const handleSubmit = () => {
    if (!selectedCourseTitle || questions.length === 0) {
      alert('Course and questions are required.');
      return;
    }

    handleSaveQuestion();

    const courseObj = courses.find((c) => c.title === selectedCourseTitle);
    if (!courseObj) {
      alert('Invalid course selected');
      return;
    }

    const finalTest = {
      name: testName.trim(),
      type: 'test',
      completed: false,
      score: 0,
      questions,
    };

    const payload = {
      courseId: courseObj._id,
      finalTest,
    };

    if (onSubmit) onSubmit(payload);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white shadow-lg rounded-lg space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">Edit Final Test</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-1">Select Course</label>
          <select
            className="w-full border rounded p-2"
            value={selectedCourseTitle}
            onChange={(e) => setSelectedCourseTitle(e.target.value)}
          >
            <option value="">-- Select Course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course.title}>
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
          />
        </div>
      </div>

      {selectedCourseTitle && (
        <>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <label className="font-semibold">Question:</label>
            <select
              className="border p-2 rounded"
              value={selectedQuestionIndex}
              onChange={(e) => setSelectedQuestionIndex(Number(e.target.value))}
            >
              {questions.map((_, idx) => (
                <option key={idx} value={idx}>
                  Q{idx + 1}
                </option>
              ))}
            </select>
            <button onClick={handleAddNewQuestion} className="text-blue-600 underline">
              + Add New Question
            </button>
            <p className="text-gray-500">Total: {questions.length}</p>
          </div>

          <div className="space-y-4 mt-4">
            <h3 className="text-xl font-semibold">Edit Question</h3>

            <div className="flex gap-4 items-center">
              <label>Type:</label>
              <select
                value={newQuestion.type}
                className="border p-2 rounded"
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, type: e.target.value, answerIndex: [] })
                }
              >
                <option value="single">Single Select</option>
                <option value="multi">Multi Select</option>
              </select>
            </div>

            <textarea
              className="w-full border p-3 rounded"
              rows={3}
              placeholder="Enter question..."
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

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddOption}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded"
              >
                + Add Option
              </button>
              <button
                onClick={handleSaveQuestion}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Save Question
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-indigo-700 text-white py-3 rounded mt-6 text-lg"
          >
            Update Final Test
          </button>
        </>
      )}
    </div>
  );
};

export default TestEditForm;
