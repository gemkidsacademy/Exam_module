// src/components/UploadWord_ImageOptions.jsx

export default function UploadWord_ImageOptions() {
  return (
    <div>
      <h3>Upload Image-Based Questions</h3>
      <p>
        Use this option only when answer choices are images.
        For standard questions, use the Standard Upload.
      </p>

      {/* Replace this with your actual upload UI */}
      <input type="file" accept=".doc,.docx" />
      <button>Upload Word File</button>
    </div>
  );
}
