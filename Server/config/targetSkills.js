// server/config/targetSkills.js

/**
 * This object defines the skill sets required for target job roles.
 * The keys (e.g., 'MERN_DEV') are used by the frontend and controller.
 * The values are arrays of mandatory skills (normalized to lowercase
 * for easy comparison with the skills extracted by the Python service).
 */
const targetSkills = {
  // 1. Full-Stack JavaScript Developer (Focus on MERN)
  MERN_DEV: [
    "react",
    "node",
    "express",
    "mongodb",
    "javascript",
    "html",
    "css",
    "rest apis",
    "git",
    "jest", // Testing is essential for professional development
  ],

  // 2. Data Science / Python Analyst
  DATA_ANALYST: [
    "python",
    "sql",
    "pandas",
    "numpy",
    "scikit-learn",
    "data visualization",
    "statistics",
    "data cleaning",
    "tableau",
  ],

  // 3. Cloud / DevOps Engineer
  DEVOPS_ENG: [
    "linux",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "terraform",
    "ci/cd",
    "git",
    "bash",
    "networking",
  ],
};

module.exports = targetSkills;