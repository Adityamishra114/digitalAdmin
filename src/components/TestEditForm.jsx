import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addFinalTestToCourse, fetchAllCourseStudents } from '../store/courseStudentSlice';

const TestEditForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  useEffect(() => {
    const course = courses.find((c) => c.title === selectedCourseTitle);
    if (course) {
      const test = course.finalTest || {};
      setTestName(test.name || 'Final Course Test');
      setQuestions(test.questions || []);
      setSelectedQuestionIndex(0);
    }
  }, [selectedCourseTitle, courses]);

  useEffect(() => {
    const q = questions[selectedQuestionIndex];
    if (q && q.options) {
      const answerIndexes = Array.isArray(q.answer)
        ? q.answer.map((ans) => q.options.indexOf(ans)).filter((i) => i !== -1)
        : [q.options.indexOf(q.answer)].filter((i) => i !== -1);

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
    setNewQuestion({ ...newQuestion, options: updatedOptions, answerIndex: updatedAnswers });
  };

  const isValidQuestion = (q) => {
    return (
      q &&
      q.question?.trim() &&
      Array.isArray(q.options) &&
      q.options.filter((opt) => opt.trim()).length >= 2 &&
      (Array.isArray(q.answer) ? q.answer.length : q.answer?.trim?.())
    );
  };

  const handleSaveQuestion = async (addNewAfter = false) => {
    const { question, options, answerIndex, type } = newQuestion;
    const cleanedOptions = options.map((opt) => opt.trim()).filter(Boolean);

    if (!question.trim() || cleanedOptions.length < 2 || answerIndex.length === 0) {
      alert('⚠️ Please fill all required fields before saving.');
      return;
    }

    const answers = answerIndex.map((i) => cleanedOptions[i]);

    const updatedQuestion = {
      question: question.trim(),
      options: cleanedOptions,
      answer: type === 'single' ? answers[0] : answers,
      selectedAnswer: '',
      isCorrect: false,
      type,
    };

    const course = courses.find((c) => c.title === selectedCourseTitle);
    const courseId = course?.courseId;
    if (!courseId) return;

    const existingTest = course.finalTest || {
      name: testName.trim(),
      type: 'test',
      completed: false,
      score: 0,
      questions: [],
    };

    const updatedQuestions = [...existingTest.questions];
    updatedQuestions[selectedQuestionIndex] = updatedQuestion;

    const filteredQuestions = updatedQuestions.filter(isValidQuestion);

    const finalTest = {
      ...existingTest,
      name: testName.trim(),
      questions: filteredQuestions.map((q) => ({
        ...q,
        multiSelect: q.type === 'multi',
        selectedAnswer: '',
        isCorrect: false,
      })),
    };

    try {
      const result = await dispatch(addFinalTestToCourse({ courseId, finalTest }));
      if (addFinalTestToCourse.fulfilled.match(result)) {
        await dispatch(fetchAllCourseStudents());
        const refreshedCourse = (await courses)?.find((c) => c.title === selectedCourseTitle);
        setQuestions(refreshedCourse?.finalTest?.questions || []);
        if (addNewAfter) {
          const newQ = {
            question: '',
            options: ['', '', ''],
            answer: '',
            selectedAnswer: '',
            isCorrect: false,
            type: 'single',
          };
          setNewQuestion(newQ);
          setQuestions((prev) => [...prev, newQ]);
          setSelectedQuestionIndex((prev) => prev + 1);
        }
      } else {
        alert(result.payload || '❌ Failed to save question.');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      alert('Unexpected error occurred.');
    }
  };

  const handleAddNewQuestion = async () => {
    await handleSaveQuestion(true);
  };

  const handleRemoveQuestion = () => {
    const updated = [...questions];
    updated.splice(selectedQuestionIndex, 1);
    setQuestions(updated);
    setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1));
  };

  const handleSubmit = async () => {
    await handleSaveQuestion(false);

    const course = courses.find((c) => c.title === selectedCourseTitle);
    const courseId = course?.courseId;
    if (!courseId || !selectedCourseTitle || questions.length === 0) {
      alert('⚠️ Course and at least one question are required.');
      return;
    }

    const filteredQuestions = questions.filter(isValidQuestion);

    if (filteredQuestions.length === 0) {
      alert('❌ No valid questions to save.');
      return;
    }

    const finalTest = {
      name: testName.trim(),
      type: 'test',
      completed: false,
      score: 0,
      questions: filteredQuestions.map((q) => ({
        ...q,
        multiSelect: q.type === 'multi',
        selectedAnswer: '',
        isCorrect: false,
      })),
    };

    try {
      const result = await dispatch(addFinalTestToCourse({ courseId, finalTest }));
      if (addFinalTestToCourse.fulfilled.match(result)) {
        alert('✅ Final test saved successfully.');
        setQuestions([]);
        setTestName('');
        setSelectedCourseTitle('');
        setSelectedQuestionIndex(0);
        navigate('/admin/test/list');
      } else {
        alert(result.payload || '❌ Failed to save final test.');
      }
    } catch (err) {
      console.error('❌ Submission failed:', err);
      alert('Unexpected error occurred.');
    }
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
              <option key={course.courseId} value={course.title}>
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
          <div className="flex items-center gap-4 mt-6 flex-wrap">
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
            {questions.length > 0 && (
              <button onClick={handleRemoveQuestion} className="text-red-600 underline ml-2">
                Remove This Question
              </button>
            )}
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
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
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
                      checked={Array.isArray(newQuestion.answerIndex) && newQuestion.answerIndex.includes(idx)}
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
                onClick={() => handleSaveQuestion(true)}
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
