// server/controllers/skillController.js (UPDATED FOR JSON SCHEMA)

const asyncHandler = require("express-async-handler");
const axios = require("axios");
const targetSkills = require("../config/targetSkills");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});
const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

// --- Helper Functions (Calculation remains the same) ---

const calculateMissingSkills = (requiredSkills, userSkills) => {
  const userSkillsSet = new Set(
    userSkills.map((skill) => skill.toLowerCase().trim())
  );

  const missingSkills = requiredSkills.filter(
    (requiredSkill) => !userSkillsSet.has(requiredSkill)
  );

  return missingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
};

/**
 * NEW: Schema definition for the structured output.
 * We want a structured object containing the overview and a list of resources.
 */
const learningRoadmapSchema = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description:
        "A friendly, encouraging introduction and overview of the 5-step plan.",
    },
    steps: {
      type: "ARRAY",
      description: "The detailed, actionable 5-step learning plan.",
      items: {
        type: "OBJECT",
        properties: {
          skill: {
            type: "STRING",
            description:
              "The primary missing skill this step addresses (e.g., Jest).",
          },
          goal: {
            type: "STRING",
            description: "The short, specific learning goal for this step.",
          },
          resourceTitle: {
            type: "STRING",
            description:
              "The name of a high-quality, verified, free learning resource (e.g., 'Official Jest Documentation' or 'freeCodeCamp Course').",
          },
          resourceURL: {
            type: "STRING",
            description:
              "The direct and valid HTTP URL link to the resource (e.g., https://jestjs.io/docs/getting-started).",
          },
        },
        required: ["skill", "goal", "resourceTitle", "resourceURL"],
      },
    },
    conclusion: {
      type: "STRING",
      description:
        "Final encouraging advice on consistency and portfolio building.",
    },
  },
  required: ["summary", "steps", "conclusion"],
};

/**
 * NEW FUNCTION: Generates a personalized learning roadmap using structured JSON output.
 */
const generateStructuredRoadmap = async (missingSkills, targetRole) => {
  if (missingSkills.length === 0) {
    return {
      summary:
        "Congratulations! You possess all the core skills for this target role.",
      steps: [],
      conclusion:
        "Focus on advanced portfolio projects and real-world deployment challenges.",
    };
  }

  const skillsList = missingSkills.join(", ");
  const userRoleText = targetRole.replace(/_/g, " ");

  // Select up to 5 critical missing skills to focus the roadmap
  const focusSkills = missingSkills.slice(0, 5);

  const systemPrompt = `You are a friendly, encouraging, and knowledgeable career and education coach. Your goal is to provide a concise, actionable, and personalized 5-step learning plan. The suggested resources MUST adhere to the following rules: 
    1. Resources must be high-quality and **completely free**.
    2. URLs must be valid and must point to **official documentation** (e.g., reactjs.org, docs.python.org, learn.microsoft.com), **reputable learning platforms** (e.g., freecodecamp.org, coursera.org, edx.org), or **specific project repositories** (e.g., github.com/user/project). 
    3. **AVOID generic search results and untrustworthy blogs.**`; // This is the crucial instruction set.

  const userPrompt = `A user wants to become a ${userRoleText}. They are critically missing these key skills: ${focusSkills.join(
    ", "
  )}. Generate a structured 5-step learning roadmap focusing only on these skills. Ensure all resource URLs provided are valid and lead to free, quality material based on the system instructions.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: learningRoadmapSchema, // Apply the strict JSON schema
      },
    });

    // The response text is a JSON string, which we must parse.
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini JSON API Error:", error.message);
    // Fallback to unstructured text if JSON parsing or API fails
    const skillsList = missingSkills.join(", ");
    return {
      summary: `Error: Failed to generate structured roadmap. This is usually due to an API timeout.`,
      steps: [],
      conclusion: `Please check your API key and try again. You need to study: ${skillsList}.`,
    };
  }
};

// @desc    Analyze user text/file, calculate skill gap, and generate roadmap
// @route   POST /api/skills/analyze
// @access  Private (JWT protected via authMiddleware)
const analyzeUserText = asyncHandler(async (req, res) => {
  // ... (Data retrieval and skill extraction logic remains the same) ...
  // Note: The data retrieval logic handles both JSON text and Base64 file submissions.

  // We only need these three fields extracted from the body/file logic:
  const { resumeText, targetRole, fileBuffer, filename } = req.body;

  let extractedSkills = [];
  let targetRoleFinal = null;

  // --- 1. VALIDATION AND DATA PREPARATION ---

  if (req.file || fileBuffer) {
    // File Upload Path (Multer/Base64)
    // ... (Logic to determine extractedSkills and targetRoleFinal from fileBuffer/filename) ...

    // For simplicity in this example, we will assume file uploads are proxied
    // through the Python service which returns extractedSkills.
    // The implementation here relies on the logic in Step 5/6 which proxies the file.

    // **Simplified file handling based on final proxy attempt:**
    if (fileBuffer) {
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/extract_skills`,
        { fileBuffer, filename, targetRole }
      );
      extractedSkills = pythonResponse.data.skills || [];
      targetRoleFinal = targetRole; // targetRole comes from req.body after Multer runs
    } else {
      // Fallback for file error if Multer/Base64 setup was not done
      res.status(400);
      throw new Error("File upload attempted but failed to parse buffer.");
    }
  } else if (resumeText) {
    // Text Input Path
    targetRoleFinal = targetRole;

    if (!resumeText || !targetRoleFinal) {
      res.status(400);
      throw new Error("Please provide resume text AND a target role.");
    }

    // Send the JSON text to Python
    try {
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/extract_skills`,
        { resumeText: resumeText }
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

  // --- 2. COMMON LOGIC: GAP CALCULATION ---

  const requiredSkills = targetSkills[targetRoleFinal];

  if (!requiredSkills) {
    res.status(400);
    throw new Error("Invalid target role selected.");
  }

  const missingSkills = calculateMissingSkills(requiredSkills, extractedSkills);

  // 3. Generate the Structured Learning Roadmap (NEW STEP)
  // The output is now a parsed JSON object, not a string.
  const learningRoadmapObject = await generateStructuredRoadmap(
    missingSkills,
    targetRoleFinal
  );

  // 4. Return the full analysis
  res.json({
    message:
      "Full skill analysis and structured roadmap generated successfully.",
    targetRole: targetRoleFinal,
    userSkills: extractedSkills,
    missingSkills: missingSkills,
    learningRoadmap: learningRoadmapObject, // <-- THIS IS NOW A JSON OBJECT
    userId: req.user._id,
  });
});

module.exports = { analyzeUserText };
