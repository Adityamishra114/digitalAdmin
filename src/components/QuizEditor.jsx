import React from "react";

const QuizEditor = ({ questions = [], onChange }) => {
  const handleUpdate = (updatedQuestions) => {
    onChange(updatedQuestions);
  };

  const handleAddQuestion = () => {
    handleUpdate([
      ...questions,
      {
        question: "",
        options: ["", ""],
        multiSelect: false,
        answer: "",
      },
    ]);
  };

  const handleRemoveQuestion = (qIndex) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    handleUpdate(updated);
  };

  const updateQuestion = (qIndex, updatedData) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], ...updatedData };
    handleUpdate(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    handleUpdate(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    handleUpdate(updated);
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    handleUpdate(updated);
  };

  const updateAnswer = (qIndex, value, isMulti, option) => {
    const updated = [...questions];
    if (!isMulti) {
      updated[qIndex].answer = value;
    } else {
      const current = updated[qIndex].answer || [];
      const exists = current.includes(option);
      updated[qIndex].answer = exists
        ? current.filter((o) => o !== option)
        : [...current, option];
    }
    handleUpdate(updated);
  };

  return (
    <div>
      <button
        onClick={handleAddQuestion}
        className="text-blue-600 text-xs mt-2 underline"
      >
        ➕ Add Question
      </button>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="border p-2 rounded mt-2">
          <div className="flex justify-between items-center">
            <h5 className="font-semibold">Question {qIndex + 1}</h5>
            <button
              onClick={() => handleRemoveQuestion(qIndex)}
              className="text-red-500 text-sm"
            >
              ❌ Remove Question
            </button>
          </div>

          <input
            type="text"
            placeholder="Question Text"
            className="border p-2 rounded w-full mb-2"
            value={q.question}
            onChange={(e) =>
              updateQuestion(qIndex, { question: e.target.value })
            }
          />

          <label className="text-sm flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={q.multiSelect}
              onChange={(e) =>
                updateQuestion(qIndex, {
                  multiSelect: e.target.checked,
                  answer: e.target.checked ? [] : "",
                })
              }
            />
            Multi-select
          </label>

          {q.options.map((opt, oIndex) => (
            <div key={oIndex} className="flex gap-2 mb-1">
              <input
                type="text"
                placeholder={`Option ${oIndex + 1}`}
                className="border p-2 rounded w-full"
                value={opt}
                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
              />
              {q.options.length > 2 && (
                <button
                  onClick={() => removeOption(qIndex, oIndex)}
                  className="text-red-500 text-sm"
                >
                  ❌
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => addOption(qIndex)}
            className="text-xs text-green-600 mt-1"
          >
            ➕ Add Option
          </button>

          <div className="mt-2">
            <label className="text-sm block mb-1">Answer:</label>
            {!q.multiSelect ? (
              <select
                className="border p-2 rounded w-full"
                value={q.answer || ""}
                onChange={(e) => updateAnswer(qIndex, e.target.value, false)}
              >
                <option value="">Select one</option>
                {q.options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-1">
                {q.options.map((opt, i) => (
                  <label key={i} className="block">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={q.answer?.includes(opt)}
                      onChange={(e) =>
                        updateAnswer(qIndex, null, true, opt)
                      }
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizEditor;
