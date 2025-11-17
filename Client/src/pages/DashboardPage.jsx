// client/src/pages/DashboardPage.jsx (FINAL ACCORDION VERSION)

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import SkillGraph from "../components/SkillGraph"; // <-- IMPORT GRAPH COMPONENT

// Helper to format skills text for display
const formatSkill = (skill) => {
  const formatted = skill.replace(/_/g, " ").toLowerCase();
  if (formatted.includes(" ")) {
    return formatted
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// --- ACCORDION COMPONENTS ---

// Graph Wrapper with Toggle
const GraphAccordion = ({ isVisible, toggleVisibility, results }) => {
  const { targetRole, userSkills, missingSkills, requiredSkills } = results;

  // Normalize data to UPPERCASE here before passing to D3
  const graphProps = {
    targetRole: targetRole,
    requiredSkills: requiredSkills.map((s) => s.toUpperCase()),
    userSkills: userSkills.map((s) => s.toUpperCase()),
    missingSkills: missingSkills.map((s) => s.toUpperCase()),
  };

  return (
    <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleVisibility}
      >
        <h3 className="text-xl font-bold text-white">
          Dynamic Skill Relationship Map
        </h3>
        {isVisible ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {isVisible && (
        <div className="pt-4">
          <SkillGraph {...graphProps} />
        </div>
      )}
    </div>
  );
};

// Roadmap Wrapper with Toggle
const RoadmapAccordion = ({ isVisible, toggleVisibility, roadmapData }) => (
  <div className="bg-slate-700 p-8 rounded-xl border border-blue-500/50 shadow-xl">
    <div
      className="flex justify-between items-center cursor-pointer"
      onClick={toggleVisibility}
    >
      <h3 className="text-2xl font-bold text-blue-300 flex items-center gap-3">
        <BookOpen className="w-7 h-7" />
        Personalized Learning Roadmap
      </h3>
      {isVisible ? (
        <ChevronUp className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      )}
    </div>

    {isVisible && (
      <div className="pt-4 mt-4 border-t border-slate-600">
        {/* Roadmap Summary */}
        <p className="text-slate-200 mb-6 italic">{roadmapData.summary}</p>

        {/* Roadmap Steps */}
        <div className="space-y-6">
          {roadmapData.steps.map((step, index) => (
            <div key={index} className="border-l-4 border-blue-400 pl-4">
              <h4 className="text-xl font-semibold text-white mb-2">
                Step {index + 1}: {formatSkill(step.skill)} Mastery
              </h4>
              <p className="text-slate-300 mb-2">{step.goal}</p>
              {step.resourceURL && (
                <a
                  href={step.resourceURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors"
                >
                  {step.resourceTitle || "View Resource"}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Roadmap Conclusion */}
        <div className="mt-8 pt-4 border-t border-slate-600">
          <h4 className="text-lg font-semibold text-slate-300 mb-2">
            Next Steps
          </h4>
          <p className="text-slate-400">{roadmapData.conclusion}</p>
        </div>
      </div>
    )}
  </div>
);
// --- END ACCORDION COMPONENTS ---

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for toggling
  const [isGraphOpen, setIsGraphOpen] = useState(true);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(true);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("analysisResults");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
      setLoading(false);
    } else {
      toast.info("No analysis found", {
        description: "Please submit your skills summary first.",
      });
      navigate("/");
    }
  }, [navigate]);

  if (loading || !results) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p>Loading personalized roadmap...</p>
      </div>
    );
  }

  const {
    targetRole,
    userSkills,
    missingSkills,
    learningRoadmap,
    requiredSkills,
  } = results;

  const targetLabel = targetRole;

  // Handle error fallback from AI
  const isStructured =
    learningRoadmap &&
    learningRoadmap.steps &&
    Array.isArray(learningRoadmap.steps);
  const roadmapData = isStructured
    ? learningRoadmap
    : {
        summary: learningRoadmap.summary, // Use the error message string
        steps: [],
        conclusion:
          "Ensure your API key is valid and try again with a smaller file if needed.",
      };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10">
      {/* Header (Logout/Back) */}
      <header className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Input
        </button>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Analysis for "{targetLabel}"
          </h2>
          <p className="text-slate-400">
            Welcome back, {user?.name}! Here is your dynamic skill gap analysis.
          </p>
        </div>

        {/* --- GRAPH ACCORDION --- */}
        <GraphAccordion
          isVisible={isGraphOpen}
          toggleVisibility={() => setIsGraphOpen(!isGraphOpen)}
          results={results}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Missing/Current Skills Summary (Left Column) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dynamically Required Skills List */}
            <div className="bg-slate-700/40 p-6 rounded-xl border border-slate-600 shadow-inner">
              <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
                Required Skills (Dynamic)
              </h3>
              <ul className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, index) => (
                  <li
                    key={index}
                    className="px-3 py-1 bg-blue-700/50 text-blue-200 text-sm rounded-full font-medium"
                  >
                    {formatSkill(skill)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Skills */}
            <div className="bg-red-900/40 p-6 rounded-xl border border-red-700/50 shadow-inner">
              <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                <XCircle className="w-6 h-6" />
                Critical Missing Skills ({missingSkills.length})
              </h3>
              {missingSkills.length > 0 ? (
                <ul className="space-y-3">
                  {missingSkills.map((skill, index) => (
                    <li
                      key={index}
                      className="bg-red-800/30 p-3 rounded-lg text-red-100 font-medium"
                    >
                      {formatSkill(skill)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-300 font-semibold">
                  You possess all the core skills for this target role!
                </p>
              )}
            </div>

            {/* Current Skills Display */}
            <div className="bg-slate-700/40 p-6 rounded-xl border border-slate-600 shadow-inner">
              <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Your Identified Skills
              </h3>
              <ul className="flex flex-wrap gap-2">
                {userSkills.map((skill, index) => (
                  <li
                    key={index}
                    className="px-3 py-1 bg-green-700/50 text-green-200 text-sm rounded-full font-medium"
                  >
                    {formatSkill(skill)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Generated Roadmap (Right Column) */}
          <div className="lg:col-span-2">
            {/* --- ROADMAP ACCORDION --- */}
            <RoadmapAccordion
              isVisible={isRoadmapOpen}
              toggleVisibility={() => setIsRoadmapOpen(!isRoadmapOpen)}
              roadmapData={roadmapData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
