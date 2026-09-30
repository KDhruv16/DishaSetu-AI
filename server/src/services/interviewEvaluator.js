
export const extractQuestionIntent = () => ({});
export const analyzeAnswerSubstance = () => ({ isValid: true, isAttempt: true });
export const callGeminiStageA = async () => null;
export const evaluateOfflineStageA = () => null;
export const calculateFinalScoreAndFeedback = () => null;

/**
 * Top-Level Evaluator Orchestrator (Single Evaluation Path via Gemini)
 */
export const evaluateInterviewAnswer = async (
  questionText,
  studentAnswer,
  role = 'Data Analyst',
  type = 'Technical',
  difficulty = 'Medium',
  expectedRubric = '',
  targetSkill = ''
) => {
  if (!studentAnswer || !studentAnswer.trim()) {
    throw new Error('Please provide an answer to evaluate.');
  }

  const cleanAnswer = studentAnswer.trim();
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const prompt = `You are an expert interview answer evaluator.
Evaluate the candidate's answer ONLY against the exact question provided.
The candidate should receive credit only for knowledge actually demonstrated in their answer.

QUESTION: "${questionText}"
CANDIDATE ANSWER: "${cleanAnswer}"
${targetSkill ? `TARGET SKILL: "${targetSkill}"\nNote: A correct answer for a different skill must NOT be considered valid for this target skill.` : ''}

Do not give credit simply because:
- the answer contains keywords from the question
- the answer contains technical words
- the answer is long
- the answer sounds professional
- the answer contains information that is true but unrelated to the question

A short but correct answer can receive a high score.
A long but irrelevant answer must receive a very low score.
If the candidate provides a poem, story, motivational text, unrelated technical explanation, random text, gibberish, question repetition, or keyword stuffing instead of answering the question, evaluate it as incorrect/insufficient.
Do not infer missing knowledge.
Do not use an expected/model answer as evidence that the candidate knows something.
Only the candidate's actual answer is evidence.
Evaluate the semantic meaning of the answer, not merely matching words.
Every positive statement in the feedback must be supported by the candidate's actual answer.

Return STRICT JSON matching exactly this schema:
{
  "score": number (0-100),
  "correctness": number (0-100),
  "relevance": number (0-100),
  "completeness": number (0-100),
  "clarity": number (0-100),
  "answeredQuestion": boolean,
  "verdict": string (EXCELLENT, GOOD, PARTIAL, INCORRECT, or INSUFFICIENT),
  "feedback": string,
  "demonstratedConcepts": array of strings,
  "missingConcepts": array of strings,
  "identifiedMistakes": array of strings
}`;

  const models = [
    process.env.GEMINI_MODEL || 'gemini-3.8-flash'
  ];

  let rawJson = null;
  let lastError = null;

  for (const model of models) {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.0,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            let cleanText = candidateText.trim();
            if (cleanText.startsWith('```json')) {
              cleanText = cleanText.substring(7);
            } else if (cleanText.startsWith('```')) {
              cleanText = cleanText.substring(3);
            }
            if (cleanText.endsWith('```')) {
              cleanText = cleanText.substring(0, cleanText.length - 3);
            }
            rawJson = JSON.parse(cleanText.trim());
            break; // success
          }
        } else {
          const errText = await response.text();
          if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
            console.warn(`[GEMINI EVALUATOR] Transient error ${response.status} for ${model}. Retrying in ${attempt + 1}s...`);
            await new Promise(res => setTimeout(res, (attempt + 1) * 1000));
            continue; // retry
          }
          throw new Error(`Gemini API Error: ${response.status} ${errText}`);
        }
      } catch (err) {
        lastError = err;
        console.warn(`[GEMINI EVALUATOR] Model ${model} failed on attempt ${attempt + 1}: ${err.message}`);
        // Only retry if it's not a syntax error from JSON parse, but we already break on success.
        // If it's a fetch network error, we could retry, but let's strictly stick to 503/429 above.
        if (attempt === maxRetries || err.message.includes('Unexpected token')) {
          break; // move to next model or fail
        }
        console.warn(`[GEMINI EVALUATOR] Transient exception. Retrying in ${attempt + 1}s...`);
        await new Promise(res => setTimeout(res, (attempt + 1) * 1000));
      }
    }
    if (rawJson) break; // fully succeeded
  }

  if (!rawJson) {
    throw new Error(`Gemini evaluation failed. Details: ${lastError?.message || 'No valid JSON returned.'}`);
  }

  // Validate the JSON
  const score = ensureBounds(rawJson.score);
  const correctness = ensureBounds(rawJson.correctness);
  const relevance = ensureBounds(rawJson.relevance);
  const completeness = ensureBounds(rawJson.completeness);
  const clarity = ensureBounds(rawJson.clarity);
  const answeredQuestion = Boolean(rawJson.answeredQuestion);
  const verdict = String(rawJson.verdict || 'INSUFFICIENT').toUpperCase();

  // Map to the existing controller expectations to preserve compatibility
  let skillEvidence = 'insufficient';
  if (answeredQuestion && score >= 70) skillEvidence = 'strong';
  else if (answeredQuestion && score >= 40) skillEvidence = 'moderate';

  return {
    answerStatus: (answeredQuestion && verdict !== 'INCORRECT' && verdict !== 'INSUFFICIENT') ? 'VALID' : 'INSUFFICIENT',
    isMeaningfulAnswer: answeredQuestion,
    isQuestionRestatement: !answeredQuestion && relevance > 0 && score < 10,
    validityReason: rawJson.feedback || '',
    score,
    verdict,
    skillEvidence,
    feedback: rawJson.feedback || '',
    strengths: rawJson.demonstratedConcepts || [],
    whatWentWell: rawJson.demonstratedConcepts || [],
    weaknesses: rawJson.identifiedMistakes || [],
    whatIsMissing: rawJson.missingConcepts || [],
    howToImprove: rawJson.missingConcepts || [],
    betterApproach: '',
    scores: {
      technicalAccuracy: correctness,
      completeness,
      clarity,
      communicationClarity: clarity,
      relevance,
      depth: correctness,
      correctness,
      overall: score,
    },
  };
};

function ensureBounds(val) {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  return Math.min(Math.max(Math.round(val), 0), 100);
}

export const evaluateLocalFallback = (questionText, studentAnswer) => {
  const ans = (studentAnswer || '').trim().toLowerCase();
  const qLower = (questionText || '').toLowerCase();

  const emptyResponse = {
    answerStatus: 'INSUFFICIENT',
    isMeaningfulAnswer: false,
    isQuestionRestatement: false,
    validityReason: 'The answer was empty.',
    score: 0,
    verdict: 'INSUFFICIENT',
    skillEvidence: 'insufficient',
    feedback: 'The answer was empty.',
    strengths: [],
    whatWentWell: [],
    weaknesses: ['Empty answer'],
    whatIsMissing: ['Complete answer'],
    howToImprove: ['Provide an answer to the question.'],
    betterApproach: '',
    scores: {
      technicalAccuracy: 0,
      completeness: 0,
      clarity: 0,
      communicationClarity: 0,
      relevance: 0,
      depth: 0,
      correctness: 0,
      overall: 0,
    }
  };

  if (!ans) return emptyResponse;

  if (ans.length < 15 || !ans.includes(' ')) {
    return {
      ...emptyResponse,
      score: 10,
      validityReason: 'The answer is too short or appears to be random characters.',
      feedback: 'The answer is too short or appears to be random characters.',
      weaknesses: ['Too short or random characters'],
      scores: { ...emptyResponse.scores, overall: 10 }
    };
  }

  const qWords = qLower.split(/\W+/).filter(w => w.length > 3);
  let overlapCount = 0;
  for (const w of qWords) {
    if (ans.includes(w)) overlapCount++;
  }

  if (overlapCount === 0 && qWords.length > 2) {
    return {
      answerStatus: 'INSUFFICIENT',
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      validityReason: 'The answer does not seem to address the core concepts of the question.',
      score: 30,
      verdict: 'INCORRECT',
      skillEvidence: 'insufficient',
      feedback: 'The answer does not seem to address the core concepts of the question.',
      strengths: [],
      whatWentWell: [],
      weaknesses: ['Unrelated content'],
      whatIsMissing: ['Core concepts'],
      howToImprove: ['Focus on the specific concepts asked in the question.'],
      betterApproach: '',
      scores: {
        technicalAccuracy: 30,
        completeness: 30,
        clarity: 50,
        communicationClarity: 50,
        relevance: 20,
        depth: 30,
        correctness: 30,
        overall: 30,
      }
    };
  }

  if (ans.length < 60) {
    return {
      answerStatus: 'VALID',
      isMeaningfulAnswer: true,
      isQuestionRestatement: false,
      validityReason: 'The answer is relevant but lacks depth and detail.',
      score: 60,
      verdict: 'PARTIAL',
      skillEvidence: 'moderate',
      feedback: 'The answer is relevant but lacks depth and detail.',
      strengths: ['Addressed the topic'],
      whatWentWell: ['Addressed the topic'],
      weaknesses: ['Lacks detail'],
      whatIsMissing: ['Detailed explanation', 'Practical examples'],
      howToImprove: ['Provide more detailed explanations and practical examples.'],
      betterApproach: '',
      scores: {
        technicalAccuracy: 60,
        completeness: 50,
        clarity: 70,
        communicationClarity: 70,
        relevance: 70,
        depth: 60,
        correctness: 60,
        overall: 60,
      }
    };
  }

  return {
    answerStatus: 'VALID',
    isMeaningfulAnswer: true,
    isQuestionRestatement: false,
    validityReason: 'The answer is highly detailed and addresses the core requirements of the question.',
    score: 75,
    verdict: 'GOOD',
    skillEvidence: 'strong',
    feedback: 'The answer is highly detailed and addresses the core requirements of the question.',
    strengths: ['Detailed explanation', 'Addressed core concepts'],
    whatWentWell: ['Detailed explanation', 'Addressed core concepts'],
    weaknesses: [],
    whatIsMissing: [],
    howToImprove: [],
    betterApproach: '',
    scores: {
      technicalAccuracy: 75,
      completeness: 70,
      clarity: 75,
      communicationClarity: 75,
      relevance: 80,
      depth: 75,
      correctness: 75,
      overall: 75,
    }
  };
};
