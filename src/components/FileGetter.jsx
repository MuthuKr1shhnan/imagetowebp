// 📦 Importing React hooks and other dependencies
import { useRef, useState } from "react";
import "../index.css";

import ParticlesBackground from "../ParticlesBackground";

// 🎯 Main component for file upload functionality
const FileGetter = ({
  acceptedFileTypes = ".pdf", // 📄 Allowed file types
  buttonText = "Select PDF file", // 🖱️ Button text
  multipleFiles = true, // ➕ Allow multiple files?
  onFileSelect, // 📞 Callback when files are selected
  children, // 👶 Child components to render when files are selected
}) => {
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const [files, setFiles] = useState([]);

  // 🖱️ Trigger file input click
  const handleFileClick = () => fileInputRef.current.click();

  // 📂 Add new files to state
  const addFiles = (newFiles) => {
    const selectedFiles = Array.from(newFiles);
    const updatedFiles = multipleFiles
      ? [...files, ...selectedFiles]
      : selectedFiles;
    if (onFileSelect) onFileSelect(updatedFiles);
    setFiles(updatedFiles);
  };

  const handleFileChange = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.remove("border-green-500", "border-4");
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.add("border-green-500", "border-4");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.remove("border-green-500", "border-4");
  };

  return (
    <section className='relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center px-4 py-10'>
      <ParticlesBackground />
      <h1 className='absolute md:left-10 left-5 top-10 text-white text-[24px] md:text-[32px] font-bold z-10'>
        Zero
      </h1>

      <div className='w-full sm:w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] p-6 bg-white/10 backdrop-blur-md shadow-lg rounded-xl flex flex-col'>
        <h2 className='text-2xl font-semibold text-center mb-6 text-white'>
          Image To Webp Converter
        </h2>

        {/* 📂 Show children if files are selected, otherwise show upload UI */}
        {files.length > 0 ? (
          <div className='w-full'>{children}</div>
        ) : (
          <>
            {/* 🖱️ Drag-and-drop zone */}
            <div
              className={`border-2 border-dashed border-gray-400 w-full rounded-xl p-8 text-center cursor-pointer transition-all duration-200 bg-black/30 `}
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <p className='text-gray-300 mb-2'>Drag & Drop your files here</p>
              <p className='text-gray-500'>or click to upload</p>

              <input
                type='file'
                accept={acceptedFileTypes}
                multiple={multipleFiles}
                ref={fileInputRef}
                onChange={handleFileChange}
                className='hidden'
              />

              <button
                className='inline-block mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition'
                onClick={handleFileClick}
              >
                {buttonText}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

// 🚀 Export the component
export default FileGetter;
