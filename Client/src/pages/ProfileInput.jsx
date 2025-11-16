// client/src/pages/ProfileInput.jsx (UPDATED FOR FILE UPLOAD)

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Upload, FileText, XCircle, Trash2 } from "lucide-react";

// Define the available roles for the dropdown (must match targetSkills.js keys)
const availableRoles = [
  { key: "MERN_DEV", label: "MERN Stack Developer" },
  { key: "DATA_ANALYST", label: "Data Science / Python Analyst" },
  { key: "DEVOPS_ENG", label: "Cloud / DevOps Engineer" },
];

// Helper to get role label
const getRoleLabel = (key) =>
  availableRoles.find((r) => r.key === key)?.label || key;

export default function ProfileInput() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for either text input or file input (only one can be used at a time)
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const [targetRole, setTargetRole] = useState("MERN_DEV");
  const [isLoading, setIsLoading] = useState(false);

  // Handler for drag and drop / file input
  const handleFileChange = useCallback((e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (
        file.type !== "application/pdf" &&
        file.type !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        toast.error("Unsupported file type", {
          description: "Please upload a PDF (.pdf) or DOCX (.docx) file.",
        });
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
      setResumeText(""); // Clear text area if file is selected
    }
  }, []);

  // client/src/pages/ProfileInput.jsx (FIXED handleSubmit logic)

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Reader result is "data:application/pdf;base64,..."
        // We only want the base64 string after the comma
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const textInput = resumeText.trim();
    if (!textInput && !resumeFile) {
      toast.error("Input required", {
        description: "Please paste text OR upload a file.",
      });
      return;
    }

    setIsLoading(true);
    let requestData;
    const url = "/skills/analyze"; // Fixed URL

    try {
      if (resumeFile) {
        // --- FILE SUBMISSION PATH (Base64 Encoding) ---

        // 1. Convert file to Base64 string
        const fileBufferBase64 = await convertFileToBase64(resumeFile);

        // 2. Package data as JSON (Express handles this easily)
        requestData = {
          fileBuffer: fileBufferBase64,
          filename: resumeFile.name,
          targetRole: targetRole,
        };
      } else {
        // --- TEXT SUBMISSION PATH (JSON) ---
        requestData = {
          resumeText: textInput,
          targetRole: targetRole,
        };
      }

      // --- SINGLE API CALL (Always sends JSON to Express) ---
      // Axios automatically sets Content-Type: application/json here.
      const response = await api.post(url, requestData);

      // Store the results in session storage
      sessionStorage.setItem("analysisResults", JSON.stringify(response.data));

      toast.success("Analysis Complete!", {
        description: "Your personalized roadmap is ready.",
      });
      navigate("/dashboard");
    } catch (error) {
      // ... (Error handling logic) ...
      console.error("Analysis error:", error);
      const status = error.response?.status;
      let errorMessage =
        error.response?.data?.message || "Failed to connect to the AI engine.";

      if (status === 401 || status === 403) {
        toast.error("Session Expired", { description: "Please log in again." });
        logout();
      } else if (status === 500) {
        toast.error("Service Error", {
          description:
            errorMessage || "The AI service failed to process the input.",
        });
      } else {
        toast.error("Analysis Failed", { description: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Visual helper for file drag-and-drop area
  const DragDropArea = () => (
    <label
      htmlFor="file-upload"
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
        resumeFile
          ? "border-green-500 bg-green-500/10"
          : "border-slate-600 hover:border-blue-500 bg-slate-700/50"
      }`}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.docx"
      />
      {resumeFile ? (
        <div className="flex items-center gap-3 text-green-300">
          <FileText className="w-6 h-6" />
          <span>File Ready: {resumeFile.name}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center text-slate-400">
          <Upload className="w-8 h-8 mb-2" />
          <p className="text-sm font-semibold">Click or Drag & Drop Resume</p>
          <p className="text-xs mt-1">PDF or DOCX (Max 5MB)</p>
        </div>
      )}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-10">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-400">
          Skill Gap Navigator
        </h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">
          Define Your Career Goal
        </h2>
        <p className="text-slate-400 mb-6">
          Achieve the most accurate analysis by uploading your resume or pasting
          your skill summary.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Role Dropdown */}
          <div>
            <label
              htmlFor="targetRole"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              1. Select Your Target Role
            </label>
            <select
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              {availableRoles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload/Text Area Switch */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              2. Provide Skills Data (File OR Text)
            </label>

            {/* File Upload Section */}
            <DragDropArea />

            {resumeFile && (
              <button
                type="button"
                onClick={() => setResumeFile(null)}
                className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Remove File
              </button>
            )}

            <div className="flex items-center my-4">
              <hr className="flex-grow border-slate-700" />
              <span className="px-3 text-slate-500 text-sm">OR</span>
              <hr className="flex-grow border-slate-700" />
            </div>

            {/* Text Area Section */}
            <textarea
              id="resumeText"
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setResumeFile(null);
              }}
              rows="6"
              placeholder="Paste your skills summary here if you don't have a file..."
              className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !!resumeFile} // Disable if a file is uploaded
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!resumeText.trim() && !resumeFile)}
            className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-300 ${
              isLoading
                ? "bg-blue-600/50 text-slate-400 cursor-not-allowed flex items-center justify-center gap-3"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-lg shadow-blue-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Analyzing Data...</span>
              </>
            ) : (
              "Analyze Skills & Generate Personalized Roadmap"
            )}
          </button>
        </form>
      </div>
      <div className="mt-8 text-center text-slate-400 text-xs max-w-4xl mx-auto">
        <p>
          Disclaimer: This tool uses AI for initial skill gap analysis and
          content generation. Always verify learning resources.
        </p>
      </div>
    </div>
  );
}