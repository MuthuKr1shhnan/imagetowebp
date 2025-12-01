import { useState, useRef } from "react";

export default function ImageToWebp() {
  const [preview, setPreview] = useState(null);
  const [webp, setWebp] = useState(null);
  const dropRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

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
          setWebp(webpUrl);
        },
        "image/webp",
        0.9
      );
    };

    setPreview(img.src);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.classList.remove("border-green-500", "border-4");
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("border-green-500", "border-4");
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove("border-green-500", "border-4");
  };

  return (
    <section className='w-full min-h-screen bg-black flex items-center justify-center px-4 py-10'>
      <h1 className='absolute md:left-10 left-5 top-10 -translate-y-1/2 text-white text-[24px] md:text-[32px] leading-.5 tracking-5 font-bold'>
        Zero
      </h1>

      <div className='w-full sm:w-[90%] md:w-[70%] lg:w-[45%] xl:w-[35%] p-6 bg-[#1a1a1a] shadow-lg shadow-black/50 rounded-xl'>
        <h2 className='text-2xl font-semibold text-center mb-4 text-white'>
          Image to WebP Converter
        </h2>

        {/* Upload Box */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className='w-full border-2 border-dashed border-gray-600 rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200'
        >
          <p className='text-gray-300 mb-2 text-sm sm:text-base'>
            Drag & Drop your image here
          </p>
          <p className='text-gray-500 text-sm sm:text-base'>
            or click to upload
          </p>

          <input
            type='file'
            accept='image/*'
            className='hidden'
            id='fileUpload'
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <label
            htmlFor='fileUpload'
            className='inline-block mt-3 px-4 py-2 sm:px-5 sm:py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition text-sm sm:text-base'
          >
            Choose Image
          </label>
        </div>

        {/* Preview Section */}
        {preview && (
          <div className='mt-6'>
            <h3 className='text-lg font-medium mb-2 text-white'>
              Original Image Preview:
            </h3>
            <img
              src={preview}
              alt='Preview'
              className='w-full rounded-lg shadow-lg'
            />
          </div>
        )}

        {/* Download Button */}
        {webp && (
          <div className='mt-6 text-center'>
            <a
              href={webp}
              download='converted.webp'
              className='px-5 py-3 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition text-sm sm:text-base'
            >
              Download WebP
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
