import { useState, useRef } from "react";
import JSZip from "jszip";
import ParticlesBackground from "./ParticlesBackground";

export default function ImageToWebp() {
  const [files, setFiles] = useState([]);
  const dropRef = useRef(null);

  const handleFile = (fileList) => {
    if (!fileList) return;

    const newFiles = [];
    Array.from(fileList).forEach((file) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            const webpUrl = URL.createObjectURL(blob);
            newFiles.push({
              name: file.name,
              src: img.src,
              webp: webpUrl,
              originalSize: (file.size / 1024).toFixed(2) + " KB",
              convertedSize: (blob.size / 1024).toFixed(2) + " KB",
            });
            setFiles((prev) => [...prev, ...newFiles]);
          },
          "image/webp",
          0.9
        );
      };
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.classList.remove("border-green-500", "border-4");
    handleFile(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("border-green-500", "border-4");
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove("border-green-500", "border-4");
  };

  // 🔥 ZIP DOWNLOAD
  const downloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder("converted");

    for (const file of files) {
      const response = await fetch(file.webp);
      const blob = await response.blob();
      const baseName = file.name.split(".")[0];
      folder.file(`${baseName}.webp`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "converted_images.zip";
    link.click();
  };

  return (
    <section className='relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center px-4 py-10'>
      <ParticlesBackground />
      <h1 className='absolute md:left-10 left-5 top-10 text-white text-[24px] md:text-[32px] font-bold z-10'>
        Zero
      </h1>
      <div className='w-full sm:w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] p-6 bg-white/10 backdrop-blur-md shadow-lg rounded-xl flex flex-col'>
        <h2 className='text-2xl font-semibold text-center mb-6 text-white'>
          Image to WebP Converter
        </h2>

        {/* UPLOAD BOX */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className='w-full border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 bg-black/30'
        >
          <p className='text-gray-300 mb-2'>Drag & Drop your images here</p>
          <p className='text-gray-500'>or click to upload</p>

          <input
            type='file'
            accept='image/*'
            className='hidden'
            id='fileUpload'
            multiple
            onChange={(e) => handleFile(e.target.files)}
          />

          <label
            htmlFor='fileUpload'
            className='inline-block mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition'
          >
            Choose Images
          </label>
        </div>

        {/* FILE LIST */}
        {files.length > 0 && (
          <div className='mt-6 bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto'>
            {files.map((file, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between text-sm text-gray-300 border-b border-gray-700 py-2'
              >
                <span className='truncate w-[40%]'>{file.name}</span>
                <span className='w-[20%] text-gray-400'>
                  {file.originalSize}
                </span>
                <span className='w-[20%] text-green-400'>
                  {file.convertedSize}
                </span>
                <a
                  href={file.webp}
                  download={`${file.name.split(".")[0]}.webp`}
                  className='text-blue-400 hover:underline'
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}

        {/* DOWNLOAD ALL */}
        {files.length > 0 && (
          <button
            onClick={downloadAll}
            className='mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition'
          >
            Download All as ZIP
          </button>
        )}
      </div>
    </section>
  );
}
