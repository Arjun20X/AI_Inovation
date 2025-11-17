// server/controllers/skillController.js (UPDATED FOR DYNAMIC JOB ANALYSIS)

const asyncHandler = require("express-async-handler");
const axios = require("axios");
// const targetSkills = require('../config/targetSkills'); // REMOVED
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});
const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

// --- HELPER FUNCTIONS ---

// Helper function to calculate the missing skills (logic remains the same)
const calculateMissingSkills = (requiredSkills, userSkills) => {
  const userSkillsSet = new Set(
    userSkills.map((skill) => skill.toLowerCase().trim())
  );
  // NOTE: Required skills come back as an array of strings directly from the AI here
  const missingSkills = requiredSkills.filter(
    (requiredSkill) => !userSkillsSet.has(requiredSkill.toLowerCase().trim())
  );
  return missingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
};

// ... (generateStructuredRoadmap function remains the same) ...
const learningRoadmapSchema = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    steps: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          skill: { type: "STRING" },
          goal: { type: "STRING" },
          resourceTitle: { type: "STRING" },
          resourceURL: { type: "STRING" },
        },
        required: ["skill", "goal", "resourceTitle", "resourceURL"],
      },
    },
    conclusion: { type: "STRING" },
  },
  required: ["summary", "steps", "conclusion"],
};

const generateStructuredRoadmap = async (missingSkills, targetRole) => {
  if (missingSkills.length === 0) {
    return {
      summary:
        "Congratulations! You possess all the core skills for this role. Focus on advanced portfolio projects and real-world deployment challenges.",
      steps: [],
      conclusion: "Keep learning and building!",
    };
  }
  // ... (rest of generateStructuredRoadmap logic remains the same) ...
  const skillsList = missingSkills.join(", ");
  const userRoleText = targetRole;

  const systemPrompt = `You are a friendly, encouraging, and knowledgeable career and education coach specialized in modern tech stacks. Your goal is to provide a concise, actionable, and personalized 5-step learning plan. The suggested resources MUST adhere to the following rules: 1. Resources must be high-quality and completely free. 2. URLs must be valid and must point to official documentation, reputable learning platforms, or specific project repositories (e.g., github.com/user/project). 3. AVOID generic search results and untrustworthy blogs.`;

  const userPrompt = `A user wants to become a ${userRoleText}. They are critically missing these key skills: ${skillsList}. Generate a structured 5-step learning roadmap focusing only on these skills.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: learningRoadmapSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini JSON API Error:", error.message);
    const skillsList = missingSkills.join(", ");
    return {
      summary: `Error: Failed to generate structured roadmap. (Debug: ${error.message})`,
      steps: [],
      conclusion: `Please check your API key and try again. You need to study: ${skillsList}.`,
    };
  }
};

// --- NEW FUNCTION: Dynamic Skill Retrieval ---

const REQUIRED_SKILLS_SCHEMA = {
  type: "OBJECT",
  properties: {
    requiredSkills: {
      type: "ARRAY",
      description:
        "A list of 10 to 15 core, non-soft skills essential for the target job title, derived from typical job postings.",
      items: {
        type: "STRING",
      },
    },
  },
  required: ["requiredSkills"],
};

const dynamicallyGetRequiredSkills = asyncHandler(async (targetJobTitle) => {
  const systemPrompt = `You are an expert job market analyst. Your task is to analyze the job title "${targetJobTitle}" and return a strict JSON list of the top 10 to 15 mandatory, hard technical skills required for that role, based on current industry demands. Do NOT include soft skills.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            { text: `Generate the required skills for: ${targetJobTitle}` },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: REQUIRED_SKILLS_SCHEMA,
      },
    });

    const jsonResponse = JSON.parse(response.text.trim());
    return jsonResponse.requiredSkills || [];
  } catch (error) {
    console.error("Gemini Dynamic Skill Retrieval Error:", error.message);
    // Fallback to a predefined list if API fails
    console.log("Falling back to generic MERN skills due to API failure.");
    return [
      "JavaScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "Git",
      "REST API",
      "HTML",
      "CSS",
      "SQL",
    ];
  }
});

// --- MAIN CONTROLLER ---

// @desc    Analyze user text/file, calculate skill gap, and generate roadmap
// @route   POST /api/skills/analyze
// @access  Private (JWT protected via authMiddleware)
const analyzeUserText = asyncHandler(async (req, res) => {
  // Express always sends JSON body in this final setup
  const { resumeText, targetJobTitle, fileBuffer, filename } = req.body;

  let extractedSkills = [];

  // --- 1. VALIDATION AND DATA PREPARATION ---

  if (!targetJobTitle) {
    res.status(400);
    throw new Error("Target job title is missing in the request.");
  }

  // Determine if we are analyzing a file or text
  if (fileBuffer && filename) {
    // File Upload Path
    const fileData = { fileBuffer, filename };

    // Python requires both file data and target role for context
    const pythonPayload = { ...fileData, targetRole: targetJobTitle };

    try {
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/extract_skills`,
        pythonPayload
      );
      extractedSkills = pythonResponse.data.skills || [];
    } catch (error) {
      console.error("Error during File Processing in Python:", error.message);
      res.status(500);
      throw new Error(
        error.response?.data?.error || "AI service failed to process the file."
      );
    }
  } else if (resumeText) {
    // Text Input Path

    // Send the JSON text to Python
    try {
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/extract_skills`,
        { resumeText: resumeText, targetRole: targetJobTitle } // Python expects resumeText
      );
      extractedSkills = pythonResponse.data.skills || [];
    } catch (error) {
      console.error(
        "Error communicating with Python Microservice (Text):",
        error.message
      );
      res.status(500);
      throw new Error("AI skill extraction service is currently unavailable.");
    }
  } else {
    res.status(400);
    throw new Error(
      "Request body is empty or missing required fields (text or file)."
    );
  }

  // --- 2. DYNAMIC REQUIRED SKILLS RETRIEVAL (NEW CORE LOGIC) ---
  // The previous hardcoded targetSkills is replaced by this AI call.
  const requiredSkills = await dynamicallyGetRequiredSkills(targetJobTitle);

  if (!requiredSkills || requiredSkills.length === 0) {
    res.status(500);
    throw new Error(
      "Failed to dynamically retrieve job market skills from AI."
    );
  }

  // --- 3. GAP CALCULATION and ROADMAP GENERATION ---

  const missingSkills = calculateMissingSkills(requiredSkills, extractedSkills);

  const learningRoadmap = await generateStructuredRoadmap(
    missingSkills,
    targetJobTitle
  );

  // 4. Return the full analysis
  res.json({
    message: "Full dynamic skill analysis and roadmap generated successfully.",
    targetRole: targetJobTitle, // The user's input job title
    requiredSkills: requiredSkills, // NEW: Include the dynamically determined requirements
    userSkills: extractedSkills,
    missingSkills: missingSkills,
    learningRoadmap: learningRoadmap,
    userId: req.user._id,
  });
});

module.exports = { analyzeUserText };