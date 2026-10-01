
export const generateCandidateEvaluation = async (opportunity, candidateProfile, candidateResume, candidateAssessment, matchData) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
  
  // Construct the evidence document
  const prompt = `You are DishaSetu AI's Organization Candidate Evaluator.
Your job is to provide a structured AI-assisted evaluation of an applicant against a specific opportunity.

IMPORTANT RULES:
- Use ONLY the supplied evidence.
- NEVER invent candidate experience, certifications, or assessment scores.
- NEVER assume missing information. If something is missing, explicitly state "not_available" or "Not available".
- Distinguish evidence from interpretation.
- Do NOT make the final hiring decision. Do not recommend automatic rejection or selection.
- Keep the evaluation strictly tied to the specific opportunity provided.

---
OPPORTUNITY REQUIREMENTS:
Title: ${opportunity.title}
Category: ${opportunity.category || 'N/A'}
Experience: ${opportunity.experience || 'N/A'}
Required Skills: ${(opportunity.skills || []).join(', ')}
Preferred Skills: ${(opportunity.preferredSkills || []).join(', ')}
Responsibilities: ${opportunity.responsibilities || 'N/A'}
Description: ${opportunity.description || 'N/A'}

---
DETERMINISTIC SKILL MATCH (Pre-calculated):
Coverage: ${matchData.matchPercentage}%
Matched Skills: ${(matchData.matchedSkills || []).join(', ')}
Missing Skills: ${(matchData.missingSkills || []).join(', ')}

---
CANDIDATE EVIDENCE:
Target Role: ${candidateProfile?.career?.targetRole || 'Not specified'}
Education: ${candidateProfile?.personal?.degree || 'N/A'} ${candidateProfile?.personal?.branch || ''}
Experience / Projects: ${JSON.stringify(candidateProfile?.projects || [])}
Certifications: ${JSON.stringify(candidateProfile?.certifications || [])}
Resume ATS Scan Summary: ${candidateResume ? JSON.stringify(candidateResume.summary) : 'Not available'}
Resume Parsed Skills: ${candidateResume ? JSON.stringify(candidateResume.detectedSkills || []) : 'Not available'}
Mock Interview Score: ${candidateAssessment && candidateAssessment.completed ? (candidateAssessment.overallScore?.overall || candidateAssessment.scores?.overall) : 'Not available'}
Mock Interview Notes: ${candidateAssessment ? JSON.stringify(candidateAssessment.overallFeedback || 'Completed') : 'Not available'}

---
TASK:
Analyze the evidence around the deterministic data. Explain how the candidate's experience relates to the role, whether projects appear relevant, how resume evidence aligns, and if certifications/assessments are relevant.
Output a valid JSON object matching this exact schema (do not include markdown \`\`\`json wrappers, just raw JSON):
{
  "summary": "Short 2-3 sentence AI summary of candidate evidence regarding this specific role",
  "strengths": ["string", "string"],
  "skillGaps": ["string", "string"],
  "experienceAnalysis": {
    "level": "strong|moderate|limited|not_available",
    "evidence": "Describe what evidence was found",
    "details": "Additional context or 'Not available'"
  },
  "resumeAlignment": {
    "level": "strong|moderate|limited|not_available",
    "evidence": "Describe what evidence was found",
    "details": "Additional context or 'Not available'"
  },
  "assessmentEvidence": {
    "level": "strong|moderate|limited|not_available",
    "evidence": "Describe what evidence was found",
    "details": "Additional context or 'Not available'"
  },
  "certificationRelevance": {
    "level": "strong|moderate|limited|not_available",
    "evidence": "Describe what evidence was found",
    "details": "Additional context or 'Not available'"
  },
  "projectRelevance": {
    "level": "strong|moderate|limited|not_available",
    "evidence": "Describe what evidence was found",
    "details": "Additional context or 'Not available'"
  },
  "areasToVerify": ["string", "string"]
}
`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1, // Low temperature for deterministic analysis
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    // Clean up markdown if present
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('generateCandidateEvaluation error:', error);
    throw new Error('Failed to generate AI evaluation: ' + error.message);
  }
};
