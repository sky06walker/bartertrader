import { useState, useRef } from 'react';
import './ImageUploader.css';

export default function ImageUploader({ currentImage, onImageSelect }) {
  const [preview, setPreview] = useState(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleInputChange(e) {
    const file = e.target.files[0];
    handleFile(file);
  }

  function handleRemove() {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="image-uploader">
      {preview ? (
        <div className="image-uploader-preview">
          <img src={preview} alt="Item preview" />
          <button
            type="button"
            className="image-uploader-remove"
            onClick={handleRemove}
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`image-uploader-dropzone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="image-uploader-dropzone-content">
            <span className="image-uploader-icon">📸</span>
            <p className="image-uploader-text">
              Drag & drop a photo here, or <span className="image-uploader-link">browse</span>
            </p>
            <p className="image-uploader-hint">JPEG, PNG, WebP · Max 5MB</p>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
