import dotenv from 'dotenv';
dotenv.config();

/**
 * AI Avatar Interview Service powered by Google Gemini Ecosystem
 * 
 * ARCHITECTURE OVERVIEW:
 * 1. Conversation Engine: Uses Google's Gemini models (gemini-3.5-flash / gemini-3.8-flash)
 *    to dynamically evaluate the conversational context and formulate tailored, realistic interview questions.
 * 2. Multi-turn Interview Session: Tracks questions asked, candidate responses, and progress.
 * 3. Modular Separation: Kept strictly decoupled from evaluation / scoring modules (which will be added in Phase 2).
 * 4. Avatar Interface Contract: Generates natural dialogue markers and speech text consumable by the AI Avatar renderer.
 */

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.1-pro-preview',
  'gemini-2.5-pro'
];

/**
 * Call Gemini Generative Language API with fallback models
 */
export const callGemini = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[AI Avatar Interview] Gemini model ${model} responded with status ${response.status}: ${errText.substring(0, 150)}`);
        lastError = new Error(`Gemini API Error (${model}): ${response.status}`);
        continue; // try next model
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastError = new Error(`No content returned from Gemini model ${model}`);
        continue;
      }

      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }

      return JSON.parse(cleanText.trim());
    } catch (err) {
      console.warn(`[AI Avatar Interview] Attempt with ${model} failed:`, err.message);
      lastError = err;
    }
  }

  // Graceful fallback if Gemini API is temporarily unreachable or blocked
  console.error('[AI Avatar Interview] All Gemini model attempts failed. Using intelligent fallback engine.');
  return null;
};

/**
 * Generate the opening interview greeting and initial question
 */
export const generateOpeningQuestion = async ({
  candidateName = 'Candidate',
  jobTitle = 'Software Engineer',
  companyName = 'the Company',
  requiredSkills = [],
  jobDescription = '',
  personaName = 'Dr. Elena Vance'
}) => {
  const skillsList = requiredSkills.length > 0 ? requiredSkills.join(', ') : 'software development and problem-solving';

  const systemPrompt = `You are ${personaName}, a professional, empathetic, and sharp Senior AI Technical Interviewer conducting a formal hiring interview on behalf of ${companyName}.
Your objective is to conduct a realistic, conversational video interview for the position of "${jobTitle}".
Your communication should sound natural when spoken aloud by a realistic AI Avatar. Be warm, professional, articulate, and direct.`;

  const userPrompt = `Generate the opening question for this recruitment interview.
Candidate: ${candidateName}
Target Role: ${jobTitle}
Company: ${companyName}
Required Core Skills: ${skillsList}
${jobDescription ? `Job Context: ${jobDescription}` : ''}

Requirements:
1. Warmly welcome the candidate to the interview at ${companyName}.
2. State your name (${personaName}) as their AI technical interviewer today.
3. Ask the FIRST question: Ask them to briefly introduce their background and describe a key technical project they built using one or more relevant technologies (${skillsList}).
4. Keep the phrasing natural and engaging for Text-to-Speech audio delivery. Avoid markdown, asterisks, bullet points, or complex symbols.

Return strict JSON:
{
  "greeting": "A brief 1-2 sentence warm greeting and introduction",
  "questionText": "The complete spoken question including the greeting and first inquiry",
  "topic": "Background & Architecture Intro",
  "questionNumber": 1
}`;

  try {
    const aiResult = await callGemini(userPrompt, systemPrompt);
    if (aiResult && aiResult.questionText) {
      return {
        questionText: aiResult.questionText,
        topic: aiResult.topic || 'Background & Experience',
        questionNumber: 1
      };
    }
  } catch (err) {
    console.error('Error generating opening question with Gemini:', err);
  }

  // High-quality deterministic fallback
  const firstSkill = requiredSkills[0] || 'modern software technologies';
  return {
    questionText: `Hello ${candidateName}, welcome to your technical interview for the ${jobTitle} role at ${companyName}. I'm ${personaName}, your AI interviewer today. To get started, could you please introduce yourself and tell me about a significant project you built where you applied ${firstSkill}?`,
    topic: 'Background & Experience',
    questionNumber: 1
  };
};

/**
 * Dynamically generate the next interview question based on candidate's spoken response
 * and interview conversation history
 */
export const generateNextInterviewQuestion = async ({
  candidateName = 'Candidate',
  jobTitle = 'Software Engineer',
  companyName = 'the Company',
  requiredSkills = [],
  conversationHistory = [],
  latestCandidateResponse = '',
  currentQuestionNumber = 1,
  totalPlannedQuestions = 5,
  personaName = 'Dr. Elena Vance'
}) => {
  const isFinalQuestion = currentQuestionNumber >= totalPlannedQuestions - 1;
  const isConclusion = currentQuestionNumber >= totalPlannedQuestions;

  // If candidate has completed all questions, generate closing statement
  if (isConclusion) {
    return {
      nextQuestion: `Thank you so much, ${candidateName}. That concludes our interview questions for today. You provided great context on your experience and approach. Your responses have been recorded and sent directly to the hiring team at ${companyName}. We appreciate your time and wish you the very best!`,
      isInterviewComplete: true,
      isLastQuestion: true,
      topic: 'Interview Conclusion',
      questionNumber: currentQuestionNumber + 1
    };
  }

  const skillsList = requiredSkills.length > 0 ? requiredSkills.join(', ') : 'core technical capabilities';

  const historyFormatted = conversationHistory
    .map((item, idx) => `Q${idx + 1}: "${item.questionText}"\nCandidate Answer: "${item.candidateResponse || '[No response provided]'}"`)
    .join('\n\n');

  const systemPrompt = `You are ${personaName}, an expert, realistic AI Interviewer conducting a real-time technical interview for "${jobTitle}" at ${companyName}.
You are listening directly to the candidate through their microphone.
Analyze what the candidate just said in their latest response, acknowledge it naturally (e.g. "That's an interesting approach to...", "I appreciate that breakdown..."), and smoothly transition into the next logical interview question.
Do NOT use robotic phrases like "Based on your answer". Be conversational, like a real senior interviewer.
Do NOT grade or score the candidate in your response. Focus purely on conducting the interview.`;

  const nextQuestionNumber = currentQuestionNumber + 1;

  let questionFocus = 'Technical Deep Dive';
  if (nextQuestionNumber === 2) {
    questionFocus = 'Core Technical Concepts & Implementation Details related to their recent answer';
  } else if (nextQuestionNumber === 3) {
    questionFocus = 'System Architecture, Scalability, or Performance Trade-offs in a real-world scenario';
  } else if (nextQuestionNumber === 4) {
    questionFocus = 'Problem Solving, Debugging an unexpected production failure, or Edge Case handling';
  } else if (nextQuestionNumber === 5) {
    questionFocus = 'Engineering best practices, team collaboration, code quality, and closing technical reflections';
  }

  const userPrompt = `Interview Context:
Candidate Name: ${candidateName}
Role: ${jobTitle}
Company: ${companyName}
Required Skills: ${skillsList}
Current Question Index: ${nextQuestionNumber} of ${totalPlannedQuestions}
Is Last Question of Session: ${isFinalQuestion}

Previous Conversation History:
${historyFormatted}

Candidate's Latest Spoken Response to Q${currentQuestionNumber}:
"${latestCandidateResponse}"

Instruction for Next Question (Question ${nextQuestionNumber}):
Focus: ${questionFocus}
1. Briefly acknowledge candidate's previous response in 1 natural sentence.
2. Ask an insightful, contextual next technical question appropriate for ${jobTitle}.
3. The question must test real understanding, not just definitions.
4. Keep the question completely natural for Text-to-Speech speaking (no markdown, bullets, or asterisks).
${isFinalQuestion ? '5. Note: This will be the FINAL technical question of the interview before wrap-up.' : ''}

Return strict JSON:
{
  "acknowledgment": "Short conversational acknowledgment of their previous point",
  "nextQuestion": "The full spoken statement and next question to be voiced by the avatar",
  "topic": "${questionFocus}",
  "isLastQuestion": ${isFinalQuestion}
}`;

  try {
    const aiResult = await callGemini(userPrompt, systemPrompt);
    if (aiResult && aiResult.nextQuestion) {
      return {
        nextQuestion: aiResult.nextQuestion,
        topic: aiResult.topic || questionFocus,
        isLastQuestion: isFinalQuestion,
        isInterviewComplete: false,
        questionNumber: nextQuestionNumber
      };
    }
  } catch (err) {
    console.error('Error generating dynamic follow-up question with Gemini:', err);
  }

  // Robust contextual fallback
  const fallbackQuestions = [
    `Thanks for explaining that, ${candidateName}. In that architecture, how did you handle state management and ensure high performance under heavy traffic loads?`,
    `I see your point on that implementation. Could you walk me through a challenging bug or performance bottleneck you encountered in production, and the exact steps you took to diagnose and resolve it?`,
    `That's a very practical solution. When designing these systems, how do you approach database schema design, indexing, and data consistency versus read/write latency?`,
    `Great perspective. As a final question, looking back at systems you have designed or maintained, what is one major architectural trade-off you made, and what would you do differently today with newer technologies?`
  ];

  const fallbackIdx = Math.min(nextQuestionNumber - 2, fallbackQuestions.length - 1);
  return {
    nextQuestion: fallbackQuestions[fallbackIdx] || fallbackQuestions[0],
    topic: questionFocus,
    isLastQuestion: isFinalQuestion,
    isInterviewComplete: false,
    questionNumber: nextQuestionNumber
  };
};

/**
 * Modular Placeholder / Hook for Phase 2 Evaluation & Scoring
 * (Strictly kept uninvoked during current Phase 1 implementation as required by Section 8)
 */
export const futureEvaluationHook = async (/* interviewSessionId */) => {
  // Reserved for Phase 2: ATS Scoring, Rubric evaluation, and Hiring Recommendations
  return null;
};

/**
 * Convert raw Linear 16-bit PCM buffer to standard RIFF WAV buffer
 */
export function pcmToWavBuffer(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  if (pcmBuffer.length >= 4 && pcmBuffer.toString('ascii', 0, 4) === 'RIFF') {
    return pcmBuffer;
  }
  const dataSize = pcmBuffer.length;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // subchunk1Size = 16 (PCM)
  header.writeUInt16LE(1, 20); // audioFormat = 1 (PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Synthesize interviewer speech using Gemini 3.8 Flash Voice API
 * Supports prebuilt voices: 'Aoede', 'Kore', 'Puck', 'Fenrir', 'Charon'
 */
export const synthesizeGeminiVoice = async (text, voiceName = 'Aoede') => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    return { success: false, fallback: 'web_speech', reason: 'No GEMINI_API_KEY configured' };
  }

  const voiceModels = [
    process.env.GEMINI_VOICE_MODEL || 'gemini-3.8-flash-tts',
    'gemini-3.8-flash-lite-tts',
    'gemini-3.1-flash-tts-preview',
    'gemini-2.5-flash-preview-tts'
  ];

  for (const model of voiceModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `Please speak aloud in a natural, professional interview tone: ${text}` }]
          }
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Aoede'
              }
            }
          }
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find(p => p.inlineData || p.audio);
        if (audioPart?.inlineData?.data) {
          const rawBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
          const wavBuffer = pcmToWavBuffer(rawBuffer, 24000, 1, 16);
          return {
            success: true,
            audioBase64: wavBuffer.toString('base64'),
            mimeType: 'audio/wav',
            voiceName,
            model
          };
        }
      }
    } catch (e) {
      console.warn(`[Gemini Voice] Model ${model} generation attempt:`, e.message);
    }
  }

  return {
    success: false,
    fallback: 'web_speech',
    reason: 'Gemini Voice API experiencing high demand. Gracefully falling back to browser speech synthesis.'
  };
};

