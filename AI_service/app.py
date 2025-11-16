# ai_service/app.py (FINAL STABLE VERSION - ACCEPTS JSON/BASE64)
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
import spacy
import PyPDF2
from docx import Document
import io 
import base64 # <-- NEW: For decoding Base64 buffer

# --- Initialization ---
app = Flask(__name__)
CORS(app) 
api = Api(app) 

# Load the small English spaCy model and PhraseMatcher
try:
    # ... (SKILLS_LIST definition remains the same) ...
    NLP = spacy.load("en_core_web_sm")
    SKILLS_LIST = [
        "React", "Node", "Express", "MongoDB", "JavaScript", "HTML", "CSS", 
        "REST APIs", "Git", "Jest", "Python", "SQL", "Pandas", "NumPy", 
        "Scikit-learn", "Data Visualization", "Statistics", "Data Cleaning", 
        "Tableau", "Linux", "Docker", "Kubernetes", "AWS", "Azure", 
        "Terraform", "CI/CD", "Bash", "Networking", "Figma"
    ]
    matcher = spacy.matcher.PhraseMatcher(NLP.vocab)
    patterns = [NLP.make_doc(skill) for skill in SKILLS_LIST]
    matcher.add("SkillList", patterns)
    print("✅ SpaCy model and PhraseMatcher loaded successfully.")
except Exception as e:
    print(f"❌ Error loading SpaCy model or Matcher: {e}")
    NLP = None


# --- Helper Functions for File Parsing ---

def extract_text_from_pdf(file_stream):
    # ... (content remains the same) ...
    try:
        reader = PyPDF2.PdfReader(file_stream)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(file_stream):
    # ... (content remains the same) ...
    try:
        document = Document(file_stream)
        return "\n".join([paragraph.text for paragraph in document.paragraphs])
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

def extract_skills_from_text(text):
    # ... (content remains the same) ...
    if not NLP: return []
    
    doc = NLP(text)
    matches = matcher(doc)
    found_skills = set()
    
    for match_id, start, end in matches:
        skill = doc[start:end].text
        found_skills.add(skill)
        
    return list(found_skills)


# --- API Resource for File Upload and Text Input ---

class ResumeAnalysis(Resource):
    def post(self):
        """Handles POST request containing either JSON text or Base64 file buffer."""
        if NLP is None:
             return jsonify({"error": "NLP service is unavailable"}), 500

        try:
            data = request.get_json(force=True)
            text_content = ""
            
            # --- PATH A: JSON Text Submission (Original MVP) ---
            if 'resumeText' in data:
                text_content = data['resumeText']
            
            # --- PATH B: Base64 File Submission (NEW Multer path) ---
            elif 'fileBuffer' in data:
                file_buffer_base64 = data['fileBuffer']
                filename = data.get('filename', '')
                
                # 1. Decode Base64 string back into bytes
                file_bytes = base64.b64decode(file_buffer_base64)
                file_stream = io.BytesIO(file_bytes)

                # 2. Extract text based on file type
                if filename.lower().endswith('.pdf'):
                    text_content = extract_text_from_pdf(file_stream)
                elif filename.lower().endswith('.docx'):
                    text_content = extract_text_from_docx(file_stream)
                else:
                    return jsonify({"error": "Unsupported file format sent from Express."}), 400
            
            else:
                return jsonify({"error": "Missing 'resumeText' or file data in JSON payload."}), 400
            
            
            if not text_content:
                return jsonify({"error": "Could not extract or read text from the input."}), 400

            # 3. Extract Skills from content
            extracted_skills = extract_skills_from_text(text_content)
            
            return jsonify({
                "skills": extracted_skills,
                "raw_text_length": len(text_content),
            })

        except Exception as e:
            print(f"Python Processing Error: {e}")
            return jsonify({"error": "An internal Python error occurred during processing."}), 500


# --- API Endpoints ---
api.add_resource(ResumeAnalysis, '/extract_skills') 


# --- Run Server ---
if __name__ == '__main__':
    app.run(port=5001, debug=True)