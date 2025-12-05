import { useState } from "react";
import JSZip from "jszip";
import ParticlesBackground from "./ParticlesBackground";
import FileGetter from "./components/FileGetter";

export default function ImageToWebp() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // NEW STATES
  const [isChoosingSize, setIsChoosingSize] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [estimatedSize, setEstimatedSize] = useState(null);

  const handleFile = (fileList) => {
    if (!fileList) return;

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

            const single = {
              name: file.name,
              src: img.src,
              webp: webpUrl,
              originalSize: (file.size / 1024).toFixed(2) + " KB",
              convertedSize: (blob.size / 1024).toFixed(2) + " KB",
            };

            setFiles((prev) => [...prev, single]);
          },
          "image/webp",
          0.9
        );
      };
    });
  };

  // OPEN SIZE CHOOSING PANEL
  const openSizeChooser = (file) => {
    setSelectedFile(file);
    setIsChoosingSize(true);
    setQuality(0.9);
    setEstimatedSize(file.convertedSize);
  };

  // UPDATE SLIDER => LIVE SIZE ESTIMATE
  const updateQuality = (val) => {
    setQuality(val);

    if (!selectedFile) return;

    const img = new Image();
    img.src = selectedFile.src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          setEstimatedSize((blob.size / 1024).toFixed(2) + " KB");
        },
        "image/webp",
        val
      );
    };
  };

  // APPLY SIZE (RE-CONVERT IMAGE)
  const applyQuality = () => {
    if (!selectedFile) return;

    const img = new Image();
    img.src = selectedFile.src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          const newWebp = URL.createObjectURL(blob);

          setFiles((prev) =>
            prev.map((f) =>
              f.name === selectedFile.name
                ? {
                    ...f,
                    webp: newWebp,
                    convertedSize: (blob.size / 1024).toFixed(2) + " KB",
                  }
                : f
            )
          );

          setSelectedFile((prev) => ({
            ...prev,
            webp: newWebp,
            convertedSize: (blob.size / 1024).toFixed(2) + " KB",
          }));

          setIsChoosingSize(false);
        },
        "image/webp",
        quality
      );
    };
  };

  // REMOVE FILE
  const removeFile = (name) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.name !== name);
      if (selectedFile?.name === name) {
        setSelectedFile(filtered[0] || null);
      }
      return filtered;
    });
  };

  // ZIP DOWNLOAD
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
    <>
      {files.length === 0 ? (
        <FileGetter
          acceptedFileTypes="image/*"
          buttonText="Choose Images"
          multipleFiles={true}
          onFileSelect={handleFile}
        />
      ) : (
        <div className="h-screen overflow-hidden bg-black grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="rounded-lg flex relative flex-col m-5 p-4 overflow-y-auto">
            {files.map((file, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center justify-between text-sm border-b border-gray-700 py-2 p-4 cursor-pointer transition ${
                  selectedFile?.name === file.name
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="truncate w-[40%]">{file.name}</span>
                <span className="w-[20%] text-gray-400">
                  {file.originalSize}
                </span>

                {/* CLICK HERE TO OPEN SIZE CHOOSER */}
                <span
                  className="w-[20%] text-green-400 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSizeChooser(file);
                  }}
                >
                  {file.convertedSize}
                </span>

                <div className="flex gap-3 items-center">
                  <a
                    href={file.webp}
                    download={`${file.name.split(".")[0]}.webp`}
                    className="text-blue-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.name);
                    }}
                    className="text-red-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={downloadAll}
              className="mt-auto w-full px-6 sticky -bottom-5 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition"
            >
              Download All as ZIP
            </button>
          </div>

          {/* RIGHT COLUMN */}
          <div className="rounded-lg p-10 flex flex-col items-center justify-start">
            {!selectedFile ? (
              <p className="text-gray-400 text-center">
                Click a file on the left to preview
              </p>
            ) : (
              <>
                <img
                  src={selectedFile.webp}
                  alt={selectedFile.name}
                  className="max-h-[50vh] max-w-full rounded-lg shadow-lg"
                />

                {/* SIZE CHOOSING UI */}
                {isChoosingSize && (
                  <div className="w-full mt-6 p-4 bg-gray-800 rounded-lg">
                    <label className="text-gray-300 text-sm">
                      Adjust Size (Quality): {quality}
                    </label>

                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => updateQuality(Number(e.target.value))}
                      className="w-full mt-2"
                    />

                    <p className="text-green-400 mt-2">
                      Estimated Size: {estimatedSize}
                    </p>

                    <button
                      onClick={applyQuality}
                      className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Choose Size
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
