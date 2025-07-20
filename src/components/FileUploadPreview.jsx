import React, { useRef } from "react";

const formatDuration = (seconds) => {
  const totalMin = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  if (totalMin < 60) {
    return `${totalMin} min${sec ? ` ${sec} sec` : ""}`;
  }
  const hr = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return `${hr} hr${min ? ` ${min} min` : ""}`;
};

const FileUploadPreview = ({ content, onChange, onRemove }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const updatedContent = { ...content, url: fileUrl };

    if (["video", "audio"].includes(content.type)) {
      const media = document.createElement(content.type);
      media.src = fileUrl;
      media.preload = "metadata";
      media.onloadedmetadata = () => {
        const seconds = media.duration || 0;
        const formatted = formatDuration(seconds);
        onChange({ ...updatedContent, duration: formatted });
      };
    } else {
      onChange(updatedContent);
    }
  };

  const handleManualPageInput = (e) => {
    const pages = parseInt(e.target.value, 10);
    if (!isNaN(pages)) {
      onChange({ ...content, pages });
    }
  };

  const fileAccept = {
    video: "video/*",
    audio: "audio/*",
    pdf: "application/pdf",
    image: "image/*"
  }[content.type] || "*";

  return (
    <div className="space-y-2">
      <input
        type="file"
        className="border p-2 rounded w-full"
        accept={fileAccept}
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {content.url && (
        <div>
          <label className="block text-sm font-semibold mb-1">Preview:</label>

          {content.type === "video" && (
            <video controls src={content.url} className="w-full rounded" />
          )}
          {content.type === "audio" && (
            <audio controls src={content.url} className="w-full" />
          )}
          {content.type === "image" && (
            <img src={content.url} alt="Preview" className="w-full rounded" />
          )}
          {content.type === "pdf" && (
            <>
              <iframe
                src={content.url}
                title="PDF Preview"
                className="w-full h-64 border rounded"
              ></iframe>

              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">
                  Enter PDF Page Count:
                </label>
                <input
                  type="number"
                  min="1"
                  className="border p-1 rounded w-24"
                  value={content.pages || ""}
                  onChange={handleManualPageInput}
                  placeholder="e.g. 10"
                />
              </div>
            </>
          )}

          {["video", "audio"].includes(content.type) && content.duration && (
            <p className="text-sm text-gray-600 mt-1">
              Duration: <strong>{content.duration}</strong>
            </p>
          )}

          <button
            onClick={onRemove}
            className="text-red-500 text-sm mt-1"
          >
            ❌ Remove File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploadPreview;
