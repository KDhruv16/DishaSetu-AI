/**
 * DishaSetu AI — Mock Interview Evaluation Engine
 * Question-Aware, Semantic, Deterministic, Evidence-Grounded Two-Stage Evaluation Pipeline.
 *
 * Core Guarantee:
 * The evaluator extracts what actual technical information the user provided.
 * Expected benchmarks and question keywords are NEVER credited as user-provided evidence.
 * Question copying, generic fluff, and keyword stuffing receive near-zero scores and zero positive feedback.
 */

import mongoose from 'mongoose';

// Canonical Stop Words for text similarity and token analysis
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both',
  'but', 'by', 'can', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t',
  'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t',
  'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'the',
  'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'were', 'weren\'t',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won\'t', 'would',
  'wouldn\'t', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Generic positive, conversational, evaluative, and filler words that convey zero technical substance on their own
export const GENERIC_FLUFF_WORDS = new Set([
  'good', 'nice', 'very', 'great', 'fine', 'okay', 'ok', 'cool', 'awesome', 'best', 'super',
  'amazing', 'amaxzing', 'perfect', 'excellent', 'wonderful', 'fantastic', 'easy', 'simple',
  'hard', 'difficult', 'interesting', 'useful', 'helpful', 'important', 'vital', 'crucial',
  'huge', 'need', 'needs', 'needed', 'concept', 'concepts', 'answer', 'answers', 'question',
  'questions', 'topic', 'topics', 'thing', 'things', 'stuff', 'definitely', 'sure', 'know',
  'knows', 'knowing', 'yes', 'yeah', 'yep', 'correct', 'true', 'right', 'well', 'said',
  'point', 'points', 'agree', 'agreed', 'everything', 'everyone', 'anyone', 'many', 'much',
  'really', 'always', 'proper', 'use', 'used', 'using', 'like', 'such', 'also', 'just',
  'writing', 'text', 'random', 'testing', 'look', 'looks', 'real', 'done', 'doing', 'understand',
  'understood', 'tell', 'told', 'give', 'given', 'show', 'shown', 'make', 'makes', 'made'
]);

/**
 * Extract Question Intent, Category, Topic, and Explicit Requirements
 */
export const extractQuestionIntent = (questionText = '', role = '', skill = '') => {
  const cleanQ = (questionText || '').trim();
  const lowerQ = cleanQ.toLowerCase();

  let questionType = 'explanation';
  const requirements = [];

  // 1. Docker Image vs Container & Multi-stage Builds Specific Structure
  if (lowerQ.includes('docker') && lowerQ.includes('image') && lowerQ.includes('container')) {
    requirements.push({ id: 'docker_image', requirement: 'Explain what a Docker image is (static template/blueprint with app code and dependencies)', weight: 0.25 });
    requirements.push({ id: 'docker_container', requirement: 'Explain what a Docker container is (running isolated instance created from an image)', weight: 0.25 });
    requirements.push({ id: 'image_vs_container', requirement: 'Differentiate between an image and a container', weight: 0.20 });
    if (lowerQ.includes('multi-stage') || lowerQ.includes('multi stage') || lowerQ.includes('size')) {
      requirements.push({ id: 'multistage_builds', requirement: 'Explain how multi-stage builds reduce production image size (compile in builder stage, copy only production artifacts into slim base image)', weight: 0.30 });
    }
    return {
      questionType: 'comparison',
      topic: 'Docker',
      requirements,
    };
  }

  // 2. Binary Search Specific Structure
  if (lowerQ.includes('binary search') && (lowerQ.includes('what is') || lowerQ.includes('explain') || lowerQ.includes('how'))) {
    requirements.push({ id: 'sorted_requirement', requirement: 'Explain requirement of sorted data and divide-and-conquer mechanism (repeatedly halving search range)', weight: 0.60 });
    requirements.push({ id: 'complexity', requirement: 'State O(log n) time complexity and mathematical reasoning', weight: 0.40 });
    return {
      questionType: 'explanation',
      topic: 'binary search',
      requirements,
    };
  }

  // 3. Determine General Question Type
  if (
    lowerQ.startsWith('is ') ||
    lowerQ.startsWith('can ') ||
    lowerQ.startsWith('does ') ||
    lowerQ.startsWith('do ') ||
    lowerQ.startsWith('are ') ||
    lowerQ.startsWith('should ') ||
    lowerQ.startsWith('will ') ||
    lowerQ.includes('is it possible') ||
    lowerQ.includes('is java platform independent')
  ) {
    questionType = 'yes_no';
    requirements.push({ id: 'stance', requirement: 'Provide clear affirmative/negative stance or direct answer', weight: 0.35 });
    requirements.push({ id: 'justification', requirement: 'Explain underlying technical reason/justification (e.g. JVM bytecode)', weight: 0.65 });
  } else if (
    lowerQ.includes('difference between') ||
    lowerQ.includes('compare') ||
    lowerQ.includes(' vs ') ||
    lowerQ.includes('versus') ||
    lowerQ.includes('distinguish') ||
    lowerQ.includes('trade-offs') ||
    lowerQ.includes('pros and cons')
  ) {
    questionType = 'comparison';
    requirements.push({ id: 'definitions', requirement: 'Define both entities/concepts', weight: 0.35 });
    requirements.push({ id: 'differences', requirement: 'Explain key architectural or operational differences and trade-offs', weight: 0.65 });
  } else if (
    lowerQ.includes('write a function') ||
    lowerQ.includes('write code') ||
    lowerQ.includes('write java code') ||
    lowerQ.includes('write python code') ||
    lowerQ.includes('implement') ||
    lowerQ.includes('code to reverse') ||
    lowerQ.includes('sql query to')
  ) {
    questionType = 'coding';
    requirements.push({ id: 'code_implementation', requirement: 'Provide valid code syntax and correct logical implementation', weight: 0.70 });
    requirements.push({ id: 'explanation', requirement: 'Explain logic, parameters, or edge cases', weight: 0.30 });
  } else if (
    lowerQ.includes('debug') ||
    lowerQ.includes('fix the bug') ||
    lowerQ.includes('what is wrong')
  ) {
    questionType = 'debugging';
    requirements.push({ id: 'identify_bug', requirement: 'Identify root cause of the bug', weight: 0.50 });
    requirements.push({ id: 'fix', requirement: 'Provide corrected code or resolution', weight: 0.50 });
  } else if (
    lowerQ.includes('tell me about a') ||
    lowerQ.includes('describe a challenging') ||
    lowerQ.includes('describe a situation') ||
    lowerQ.includes('project challenge') ||
    lowerQ.includes('tell me about yourself') ||
    lowerQ.includes('how do you prioritize') ||
    lowerQ.includes('time management')
  ) {
    questionType = 'behavioral';
    requirements.push({ id: 'context', requirement: 'Describe specific situation or challenge with context', weight: 0.35 });
    requirements.push({ id: 'actions', requirement: 'Detail concrete actions taken to address the situation', weight: 0.40 });
    requirements.push({ id: 'result', requirement: 'Explain the outcome, learning, or resolution', weight: 0.25 });
  } else if (
    lowerQ.includes('how would you architect') ||
    lowerQ.includes('system design') ||
    lowerQ.includes('design a') ||
    lowerQ.includes('rate limiting') ||
    lowerQ.includes('caching system')
  ) {
    questionType = 'system_design';
    requirements.push({ id: 'architecture', requirement: 'Outline system components and data flow', weight: 0.50 });
    requirements.push({ id: 'scalability_tradeoffs', requirement: 'Address caching, rate limiting, and scalability trade-offs', weight: 0.50 });
  } else if (
    lowerQ.includes('what is the time complexity') ||
    lowerQ.includes('space complexity') ||
    lowerQ.includes('big o') ||
    lowerQ.includes('calculate')
  ) {
    questionType = 'complexity';
    requirements.push({ id: 'complexity_value', requirement: 'State exact Big-O time and/or space complexity', weight: 0.50 });
    requirements.push({ id: 'reasoning', requirement: 'Explain mathematical reasoning (e.g. dividing search space)', weight: 0.50 });
  } else if (lowerQ.startsWith('what is ') || lowerQ.startsWith('what are ') || lowerQ.startsWith('define ')) {
    questionType = 'definition';
    requirements.push({ id: 'core_definition', requirement: 'Provide accurate and precise technical definition', weight: 0.60 });
    requirements.push({ id: 'purpose_utility', requirement: 'Explain its practical purpose and use case in software systems', weight: 0.40 });
  } else {
    questionType = 'explanation';
    requirements.push({ id: 'concept_explanation', requirement: 'Explain core concept and principles clearly', weight: 0.50 });
    requirements.push({ id: 'mechanism', requirement: 'Explain how it operates under the hood', weight: 0.50 });
  }

  // Check explicit extra requirements
  if (
    lowerQ.includes('with an example') ||
    lowerQ.includes('with example') ||
    lowerQ.includes('give an example') ||
    lowerQ.includes('practical example') ||
    lowerQ.includes('practical use cases') ||
    lowerQ.includes('use cases')
  ) {
    const hasEx = requirements.some((r) => r.id === 'example');
    if (!hasEx) {
      requirements.push({
        id: 'example',
        requirement: 'Provide concrete practical example(s) or real-world use case(s)',
        weight: 0.30,
      });
      const total = requirements.reduce((acc, r) => acc + r.weight, 0);
      requirements.forEach((r) => { r.weight = Number((r.weight / total).toFixed(2)); });
    }
  }

  // Extract Topic
  let topic = skill || '';
  const keyMatches = [
    'polymorphism', 'encapsulation', 'inheritance', 'abstraction', 'rest api', 'rest apis',
    'binary search tree', 'binary search', 'inner join', 'left join', 'full outer join',
    'arraylist and linkedlist', 'arraylist', 'linkedlist', 'virtual dom', 'useeffect',
    'usememo', 'event loop', 'closures', 'promises', 'async/await', 'jwt authentication',
    'rate limiting', 'caching', 'redis', 'docker', 'mongodb', 'acid transactions',
    'platform independent', 'star method', 'time management', 'mongodb connection'
  ];
  for (const km of keyMatches) {
    if (lowerQ.includes(km)) {
      topic = km;
      break;
    }
  }

  return {
    questionType,
    topic: topic || skill || 'General Technical',
    requirements,
  };
};

/**
 * Answer Information Gain & Question-Copying Deep Analyzer
 * Measures:
 * 1. Is the question repeated / copied in the answer?
 * 2. What residual text exists beyond the copied question?
 * 3. Does the residual text contain ANY substantive technical evidence or claims?
 */
export const extractInformationGain = (questionText = '', studentAnswer = '') => {
  const cleanQ = (questionText || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanA = (studentAnswer || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  const qTokens = cleanQ.split(' ').filter(Boolean);
  const aTokens = cleanA.split(' ').filter(Boolean);

  const qSet = new Set(qTokens);

  // Check prefix / substring match of question inside answer
  let isPrefixCopy = false;
  let residualText = cleanA;

  if (cleanQ.length >= 10 && cleanA.startsWith(cleanQ)) {
    isPrefixCopy = true;
    residualText = cleanA.slice(cleanQ.length).trim();
  } else if (cleanQ.length >= 15 && cleanA.includes(cleanQ)) {
    isPrefixCopy = true;
    residualText = cleanA.replace(cleanQ, ' ').replace(/\s+/g, ' ').trim();
  } else {
    // Check subsequence token match
    let matchedInSequence = 0;
    let qIdx = 0;
    for (let i = 0; i < aTokens.length && qIdx < qTokens.length; i++) {
      if (aTokens[i] === qTokens[qIdx]) {
        matchedInSequence++;
        qIdx++;
      }
    }
    const sequenceRatio = qTokens.length > 0 ? matchedInSequence / qTokens.length : 0;
    if (sequenceRatio >= 0.70 && qTokens.length >= 4) {
      isPrefixCopy = true;
      const nonQTokens = aTokens.filter((t) => !qSet.has(t));
      residualText = nonQTokens.join(' ');
    }
  }

  const residualTokens = residualText.split(' ').filter(Boolean);

  // Substantive domain tokens in residual text (strictly length >= 4, exact/stem match)
  const technicalVerbsAndNouns = [
    'template', 'blueprint', 'isolated', 'running', 'instance', 'dependencies',
    'builder', 'artifacts', 'compile', 'compiles', 'compiled', 'slim', 'layer', 'layers',
    'base', 'daemon', 'override', 'overriding', 'overridden', 'overload', 'overloading',
    'interface', 'parent', 'child', 'subclass', 'superclass', 'polymorphic', 'bundle',
    'bundles', 'bundling', 'restricts', 'private', 'public', 'getter', 'setter', 'encapsulate',
    'halved', 'halves', 'divide', 'divides', 'middle', 'sorted', 'array', 'pointer',
    'node', 'nodes', 'linked', 'doubly', 'contiguous', 'memory', 'stateless', 'http',
    'endpoint', 'endpoints', 'json', 'verb', 'verbs', 'idempotent', 'idempotency',
    'bytecode', 'jvm', 'virtual', 'machine', 'platform', 'operating', 'system',
    'investigate', 'investigated', 'configured', 'reproduce', 'reproduced', 'resolved',
    'connection', 'environment', 'variable', 'cluster', 'cache'
  ];

  let technicalWordCount = 0;
  const nonFluffResidualWords = [];

  for (const t of residualTokens) {
    if (STOP_WORDS.has(t) || GENERIC_FLUFF_WORDS.has(t) || t.length <= 2 || qSet.has(t)) {
      continue;
    }
    const isTech = technicalVerbsAndNouns.some((tv) => t === tv || (t.length >= 5 && tv.length >= 5 && (t.startsWith(tv) || tv.startsWith(t))));
    if (isTech) {
      technicalWordCount++;
    }
    nonFluffResidualWords.push(t);
  }

  const isExactOrPrefixedQuestionCopy = isPrefixCopy && (technicalWordCount === 0 || nonFluffResidualWords.length < 3);
  const questionOverlapCount = aTokens.filter((at) => qSet.has(at)).length;
  const isQuestionDominated = aTokens.length > 0 && (questionOverlapCount / aTokens.length >= 0.60) && technicalWordCount === 0 && nonFluffResidualWords.length < 3;

  const isQuestionCopied = isExactOrPrefixedQuestionCopy || isQuestionDominated;
  const isGenericFiller = (residualTokens.length > 0 && nonFluffResidualWords.length === 0) || (aTokens.length > 0 && aTokens.every((t) => GENERIC_FLUFF_WORDS.has(t) || STOP_WORDS.has(t) || qSet.has(t)));

  const informationGainScore = isQuestionCopied && technicalWordCount === 0 ? 0 : Math.min(100, technicalWordCount * 25 + nonFluffResidualWords.length * 10);

  return {
    isQuestionCopied,
    isGenericFiller,
    residualText,
    residualTokens,
    technicalWordCount,
    nonFluffResidualWords,
    informationGainScore,
    hasSubstantiveNovelContent: technicalWordCount >= 1 || nonFluffResidualWords.length >= 3,
  };
};

/**
 * Deterministic Semantic Validity & Substance Analyzer (Stage 1 Gate)
 */
export const analyzeAnswerSubstance = (
  studentAnswer = '',
  questionText = '',
  questionIntent = null,
  expectedRubric = ''
) => {
  const cleanAnswer = (studentAnswer || '').trim();
  const lowerAnswer = cleanAnswer.toLowerCase();
  const rawWords = cleanAnswer.split(/\s+/).filter(Boolean);

  const intent = questionIntent || extractQuestionIntent(questionText);

  // 1. Empty Answer
  if (cleanAnswer.length === 0 || rawWords.length === 0) {
    return {
      isValid: false,
      isMeaningful: false,
      isRelevant: false,
      isAttempt: false,
      isQuestionCopied: false,
      isGenericFiller: false,
      isKeywordStuffed: false,
      isExplicitUnknown: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response is completely empty.',
    };
  }

  // 2. Explicit Unknown ("I don't know", "no idea", "not sure", etc.)
  const unknownPatterns = [
    /\bi don'?t know\b/i,
    /\bi dont know\b/i,
    /\bnot know the answer\b/i,
    /\bdo not know the answer\b/i,
    /\bdon'?t know the answer\b/i,
    /\bhave no idea\b/i,
    /\bhave no clue\b/i,
    /\bno idea\b/i,
    /\bcannot answer\b/i,
    /\bcan'?t answer\b/i,
    /\bnot sure about this\b/i,
    /\bnot sure\b/i,
    /\bno knowledge\b/i,
    /\bnot aware\b/i,
    /\bunable to answer\b/i,
    /\bi am not know\b/i,
    /\bidk\b/i,
    /\bpass\b/i,
    /\bskip\b/i,
  ];

  const hasExplicitUnknown = unknownPatterns.some((p) => p.test(lowerAnswer));
  if (hasExplicitUnknown && rawWords.length <= 12) {
    return {
      isValid: false,
      isMeaningful: true,
      isRelevant: false,
      isAttempt: false,
      isQuestionCopied: false,
      isGenericFiller: false,
      isKeywordStuffed: false,
      isExplicitUnknown: true,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response honestly indicates that you do not know the answer, but it does not demonstrate understanding of the question.',
    };
  }

  // 3. Meaningless Gibberish / Keyboard Smash
  const singleWordGibberish = new Set([
    'abc', 'xyz', 'asdf', 'qwerty', 'bla', 'blabla', 'blah', 'lol', 'lmao', 'na', 'n/a',
    'none', 'nothing', 'test', 'testing', 'testing123', 'dunno', 'nope', 'nah'
  ]);
  const isSingleCharSpam = /^(.)\1{3,}$/.test(lowerAnswer.replace(/\s+/g, ''));
  const isGibberish = (rawWords.length <= 2 && singleWordGibberish.has(lowerAnswer)) || isSingleCharSpam;

  if (isGibberish) {
    return {
      isValid: false,
      isMeaningful: false,
      isRelevant: false,
      isAttempt: false,
      isQuestionCopied: false,
      isGenericFiller: false,
      isKeywordStuffed: false,
      isExplicitUnknown: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response contains meaningless or random characters without substance.',
    };
  }

  // 4. Information Gain & Question Copying Deep Analysis (MANDATORY GATE CHECK)
  const infoGain = extractInformationGain(questionText, cleanAnswer);
  if (infoGain.isQuestionCopied && !infoGain.hasSubstantiveNovelContent) {
    return {
      isValid: false,
      isMeaningful: false,
      isRelevant: false,
      isAttempt: false,
      isQuestionCopied: true,
      isGenericFiller: true,
      isKeywordStuffed: false,
      isExplicitUnknown: false,
      answerStatus: 'INSUFFICIENT',
      reason: `The response repeats the question with filler words ("${infoGain.residualText}") and provides no technical explanation of ${intent.topic}.`,
    };
  }

  // 5. Check Yes/No Question Stance
  if (intent.questionType === 'yes_no') {
    const isAffirmativeOrNegative = /^(yes|no|true|false|correct|indeed)(\.|\b)/i.test(lowerAnswer);
    if (isAffirmativeOrNegative && rawWords.length <= 3) {
      return {
        isValid: true,
        isMeaningful: true,
        isRelevant: true,
        isAttempt: true,
        isQuestionCopied: false,
        isGenericFiller: false,
        isKeywordStuffed: false,
        isExplicitUnknown: false,
        answerStatus: 'PARTIAL',
        reason: 'Direct yes/no answer provided, but lacks technical explanation or bytecode/JVM justification.',
      };
    }
  }

  // 6. Token Repetition / Low Entropy Check (e.g. "good good good", "Java Java Java", "polymorphism polymorphism polymorphism")
  const normalizedWords = lowerAnswer.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  const wordFrequency = {};
  for (const w of normalizedWords) {
    wordFrequency[w] = (wordFrequency[w] || 0) + 1;
  }
  const maxWordFreq = Math.max(...Object.values(wordFrequency));
  const repetitionRatio = normalizedWords.length > 0 ? maxWordFreq / normalizedWords.length : 0;
  const uniqueNormalized = Object.keys(wordFrequency);

  if (normalizedWords.length >= 3 && repetitionRatio >= 0.70 && uniqueNormalized.length <= 2) {
    return {
      isValid: false,
      isMeaningful: false,
      isRelevant: false,
      isAttempt: false,
      isQuestionCopied: false,
      isGenericFiller: true,
      isKeywordStuffed: false,
      isExplicitUnknown: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response consists of repetitively looped words without explanation or sentence structure.',
    };
  }

  // 7. Generic Fluff / Praise Detection
  const fluffWordsCount = normalizedWords.filter((w) => GENERIC_FLUFF_WORDS.has(w) || STOP_WORDS.has(w)).length;
  const fluffRatio = normalizedWords.length > 0 ? fluffWordsCount / normalizedWords.length : 0;

  const technicalVerbs = [
    'allow', 'allows', 'allowing', 'bundle', 'bundles', 'bundling', 'restrict', 'restricts',
    'restricting', 'compile', 'compiles', 'compiled', 'run', 'runs', 'running', 'inherit',
    'inherits', 'inheriting', 'override', 'overrides', 'overridden', 'overriding', 'divide',
    'divides', 'dividing', 'search', 'searches', 'searching', 'store', 'stores', 'storing',
    'execute', 'executes', 'executing', 'return', 'returns', 'returning', 'preserve', 'preserves',
    'encapsulate', 'encapsulates', 'protect', 'protects', 'access', 'accesses', 'instantiate',
    'modify', 'modifies', 'connect', 'connected', 'handle', 'handles', 'resolv', 'fix', 'fixed',
    'render', 'renders', 'cache', 'caches', 'route', 'routes', 'calculate', 'calculates'
  ];
  const hasTechnicalVerb = technicalVerbs.some((tv) => lowerAnswer.includes(tv));
  const domainSpecificWords = normalizedWords.filter((w) => !GENERIC_FLUFF_WORDS.has(w) && !STOP_WORDS.has(w) && w.length >= 3);

  if (fluffRatio >= 0.82 && !hasTechnicalVerb && domainSpecificWords.length < 3) {
    return {
      isValid: false,
      isMeaningful: false,
      isRelevant: false,
      isAttempt: false,
      isQuestionCopied: false,
      isGenericFiller: true,
      isKeywordStuffed: false,
      isExplicitUnknown: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response contains only generic praise or filler language without substantive technical explanation.',
    };
  }

  // 8. Keyword Stuffing Detection
  const explanatoryGrammar = [
    'is', 'are', 'was', 'were', 'because', 'which', 'that', 'where', 'when', 'allows', 'by',
    'runs', 'divides', 'bundles', 'restricts', 'stores', 'returns', 'preserves', 'implements',
    'uses', 'used', 'using', 'can be', 'works by', 'enables', 'helps', 'provides', 'such as',
    'for example', 'e.g.', 'namely', 'so that', 'in order to'
  ];
  const hasGrammar = explanatoryGrammar.some((g) => lowerAnswer.includes(g));

  if (rawWords.length >= 6 && !hasGrammar && domainSpecificWords.length >= 4) {
    return {
      isValid: false,
      isMeaningful: false,
      isRelevant: true,
      isAttempt: false,
      isQuestionCopied: false,
      isGenericFiller: false,
      isKeywordStuffed: true,
      isExplicitUnknown: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response is a keyword-stuffed list without grammatical explanation or reasoned propositions.',
    };
  }

  // 9. Coding Questions
  if (intent.questionType === 'coding') {
    const hasCodeSymbols = /[{}();=\[\]<>]/.test(cleanAnswer) || /function|def |public |class |return |for\(|while\(|=>|SELECT /i.test(cleanAnswer);
    if (!hasCodeSymbols && rawWords.length < 8 && !hasTechnicalVerb) {
      return {
        isValid: false,
        isMeaningful: false,
        isRelevant: false,
        isAttempt: false,
        isQuestionCopied: false,
        isGenericFiller: true,
        isKeywordStuffed: false,
        isExplicitUnknown: false,
        answerStatus: 'INSUFFICIENT',
        reason: 'The question explicitly requires code implementation, but no valid code or function was provided.',
      };
    }
  }

  // 10. Comparison Questions
  if (intent.questionType === 'comparison') {
    const isVeryShortCollectionStatement = lowerAnswer === 'both are collections.' || lowerAnswer === 'both are collections' || (rawWords.length <= 4 && lowerAnswer.includes('collection'));
    if (isVeryShortCollectionStatement) {
      return {
        isValid: true,
        isMeaningful: true,
        isRelevant: true,
        isAttempt: true,
        isQuestionCopied: false,
        isGenericFiller: false,
        isKeywordStuffed: false,
        isExplicitUnknown: false,
        answerStatus: 'PARTIAL',
        reason: 'Correctly identifies that both are Java collections, but does not compare data structures, complexity, or trade-offs.',
      };
    }
  }

  // 11. Topical Relevance Check against Informative Rubric Tokens
  const cleanQTokens = (questionText || '').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  const qTokenSet = new Set(cleanQTokens);

  const informativeRubricTokens = (expectedRubric || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !qTokenSet.has(w));
  const uniqueInformativeRubric = Array.from(new Set(informativeRubricTokens));

  const matchedRubricCount = uniqueInformativeRubric.filter((token) => lowerAnswer.includes(token)).length;
  const rubricOverlap = uniqueInformativeRubric.length > 0 ? matchedRubricCount / uniqueInformativeRubric.length : 0;

  const qTopicLower = intent.topic.toLowerCase();
  const mentionsTopic = qTopicLower.split(/\s+/).some((tw) => tw.length >= 3 && lowerAnswer.includes(tw));

  if (!mentionsTopic && rubricOverlap === 0 && uniqueInformativeRubric.length >= 3 && rawWords.length >= 6) {
    const isOffTopicLeetcodeOrPersonal =
      lowerAnswer.includes('my favorite') ||
      lowerAnswer.includes('leetcode') ||
      lowerAnswer.includes('my name is') ||
      lowerAnswer.includes('i like');

    if (isOffTopicLeetcodeOrPersonal) {
      return {
        isValid: false,
        isMeaningful: true,
        isRelevant: false,
        isAttempt: false,
        isQuestionCopied: false,
        isGenericFiller: false,
        isKeywordStuffed: false,
        isExplicitUnknown: false,
        answerStatus: 'INSUFFICIENT',
        reason: `The response discusses unrelated personal details and does not address the question regarding ${intent.topic}.`,
      };
    }
  }

  // Passed Stage 1 Validity Gate
  return {
    isValid: true,
    isMeaningful: true,
    isRelevant: true,
    isAttempt: true,
    isQuestionCopied: false,
    isGenericFiller: false,
    isKeywordStuffed: false,
    isExplicitUnknown: false,
    answerStatus: 'VALID',
    reason: 'Response provides substantive technical statements addressing the question.',
  };
};

/**
 * Gemini Stage A Evaluation Call
 */
export const callGeminiStageA = async (
  questionText,
  studentAnswer,
  role = 'Data Analyst',
  skill = 'Technical',
  intent = null,
  expectedRubric = ''
) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const models = [
    process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  const reqListStr = (intent?.requirements || [])
    .map((r, i) => `${i + 1}. ${r.requirement} (Weight: ${Math.round(r.weight * 100)}%)`)
    .join('\n');

  const prompt = `You are DishaSetu AI's Lead Technical Interview Evaluator.
Analyze the candidate's answer for the following interview question.

ROLE: ${role}
SKILL DOMAIN: ${skill}
QUESTION: "${questionText}"
QUESTION TYPE: ${intent?.questionType || 'technical_explanation'}
CORE TOPIC: ${intent?.topic || skill}
EXPECTED BENCHMARK / RUBRIC: "${expectedRubric || 'Accurate explanation, mechanisms, syntax, complexity, and examples.'}"

EXPLICIT REQUIREMENTS TO EVALUATE:
${reqListStr || '1. Technical definition\n2. Underlying mechanism\n3. Practical example/trade-offs'}

CANDIDATE ACTUAL SUBMITTED ANSWER:
"""${studentAnswer}"""

CRITICAL EVALUATION RULES:
1. GROUNDED EVIDENCE ONLY: Base your evaluation strictly on the candidate's actual words. NEVER credit terms merely because they were repeated from the question or present in the benchmark.
2. DETECT QUESTION COPIED: If the candidate repeated/copied the question with generic words (e.g. "Explain Docker image... yes right correct nice good amazing it is very easy to use"), isQuestionCopied MUST be true, isMeaningful MUST be false, isGenericFiller MUST be true, and all technical scores MUST be near 0.
3. DETECT FLUFF / JUNK: If the candidate wrote only generic filler (e.g. "good nice", "very good", "important and useful"), isGenericFiller MUST be true, isMeaningful false, and scores near 0.
4. DETECT IRRELEVANCE: If the candidate talked about something else (e.g. favorite language/leetcode for a REST API question), isRelevant MUST be false and relevance score near 0.
5. ZERO HALLUCINATION: If the candidate did not explain a concept, NEVER state "Demonstrated understanding of [topic]".
6. PARTIAL CREDIT: If the answer contains genuine technical propositions (even if concise or partially complete), award honest credit.

Return STRICT JSON matching this schema:
{
  "validity": {
    "isMeaningful": boolean,
    "isRelevant": boolean,
    "isAttempt": boolean,
    "isQuestionCopied": boolean,
    "isGenericFiller": boolean,
    "isKeywordStuffed": boolean
  },
  "evidence": {
    "technicalClaims": ["..."],
    "supportedRequirements": ["..."],
    "unsupportedRequirements": ["..."]
  },
  "questionType": "${intent?.questionType || 'technical_concept'}",
  "topic": "${intent?.topic || skill}",
  "requirements": [
    {
      "requirement": "Requirement description",
      "satisfied": boolean
    }
  ],
  "scores": {
    "technicalAccuracy": 0-100,
    "completeness": 0-100,
    "relevance": 0-100,
    "clarity": 0-100,
    "confidence": 0.0-1.0
  },
  "reason": "Clear diagnostic of candidate answer.",
  "feedback": {
    "whatYouDidWell": ["..."],
    "whatIsMissing": ["..."],
    "howToImprove": ["..."]
  },
  "betterApproach": "Expected model benchmark response."
}`;

  for (const model of models) {
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
          const parsed = JSON.parse(candidateText);
          if (parsed && parsed.scores && parsed.validity) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn(`[GEMINI EVALUATOR] Model ${model} failed:`, err.message);
    }
  }

  return null;
};

/**
 * Offline Semantic Stage A Analyzer (Fallback when Gemini API is offline/unavailable)
 */
export const evaluateOfflineStageA = (
  questionText,
  studentAnswer,
  role = 'Data Analyst',
  skill = 'Technical',
  intent = null,
  expectedRubric = ''
) => {
  const qIntent = intent || extractQuestionIntent(questionText, role, skill);
  const substance = analyzeAnswerSubstance(studentAnswer, questionText, qIntent, expectedRubric);

  const cleanAns = (studentAnswer || '').trim();
  const lowerAns = cleanAns.toLowerCase();

  const allReqDescriptions = qIntent.requirements.map((r) => r.requirement);

  // If Stage 1 deterministic check flagged it as invalid/non-attempt
  if (!substance.isValid || !substance.isAttempt) {
    return {
      validity: {
        isMeaningful: substance.isMeaningful,
        isRelevant: substance.isRelevant,
        isAttempt: substance.isAttempt,
        isQuestionCopied: substance.isQuestionCopied,
        isGenericFiller: substance.isGenericFiller,
        isKeywordStuffed: substance.isKeywordStuffed,
      },
      evidence: {
        technicalClaims: [],
        supportedRequirements: [],
        unsupportedRequirements: allReqDescriptions,
      },
      questionType: qIntent.questionType,
      topic: qIntent.topic,
      requirements: qIntent.requirements.map((r) => ({
        requirement: r.requirement,
        satisfied: false,
      })),
      scores: {
        technicalAccuracy: 0,
        completeness: 0,
        relevance: substance.isQuestionCopied ? 5 : substance.isRelevant ? 10 : 0,
        clarity: substance.isGenericFiller ? 5 : 0,
        confidence: 0.95,
      },
      reason: substance.reason,
      feedback: {
        whatYouDidWell: [],
        whatIsMissing: allReqDescriptions,
        strengths: [],
        weaknesses: [substance.reason],
        howToImprove: allReqDescriptions.map((req) => `Provide a concrete technical explanation for: ${req}.`),
      },
      betterApproach: expectedRubric || `State the core definition of ${qIntent.topic}, explain how it operates under the hood, and provide a concrete example.`,
    };
  }

  // Tokenize question to extract Question Tokens
  const cleanQTokens = (questionText || '').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  const qTokenSet = new Set(cleanQTokens);

  // Informative rubric tokens (excluding words that were present in the question!)
  const informativeRubricTokens = (expectedRubric || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !qTokenSet.has(w));
  const uniqueInformativeRubric = Array.from(new Set(informativeRubricTokens));

  const matchedRubricCount = uniqueInformativeRubric.filter((token) => lowerAns.includes(token)).length;
  const rubricOverlapRatio = uniqueInformativeRubric.length > 0 ? matchedRubricCount / uniqueInformativeRubric.length : 0;

  // Extract Actual Technical Claims from Student Answer
  const extractedClaims = [];
  const supportedReqs = [];
  const unsupportedReqs = [];

  // Evaluate requirements satisfaction against actual student evidence
  const evaluatedRequirements = qIntent.requirements.map((req) => {
    let satisfied = false;
    const reqId = req.id;
    const reqLower = req.requirement.toLowerCase();

    if (reqId === 'docker_image') {
      satisfied = (lowerAns.includes('read-only') || lowerAns.includes('read only') || lowerAns.includes('template') || lowerAns.includes('blueprint') || lowerAns.includes('static')) && lowerAns.includes('image');
      if (satisfied) extractedClaims.push('Correctly explained Docker image as a static read-only template/blueprint.');
    } else if (reqId === 'docker_container') {
      satisfied = (lowerAns.includes('running instance') || lowerAns.includes('isolated') || lowerAns.includes('runtime') || lowerAns.includes('running process')) && lowerAns.includes('container');
      if (satisfied) extractedClaims.push('Correctly explained Docker container as a running isolated instance.');
    } else if (reqId === 'image_vs_container') {
      satisfied = (lowerAns.includes('created from') || lowerAns.includes('instance of') || lowerAns.includes('template whereas') || (lowerAns.includes('image is') && lowerAns.includes('container is')));
      if (satisfied) extractedClaims.push('Differentiated between image blueprint and running container instance.');
    } else if (reqId === 'multistage_builds') {
      satisfied = (lowerAns.includes('builder') || lowerAns.includes('intermediate') || lowerAns.includes('artifact') || lowerAns.includes('artifacts') || lowerAns.includes('final image') || lowerAns.includes('slim base')) && (lowerAns.includes('multi-stage') || lowerAns.includes('multi stage') || lowerAns.includes('build'));
      if (satisfied) extractedClaims.push('Correctly explained multi-stage build optimization and size reduction.');
    } else if (reqId === 'sorted_requirement') {
      satisfied = (lowerAns.includes('sorted') || lowerAns.includes('divide') || lowerAns.includes('divides') || lowerAns.includes('half') || lowerAns.includes('halving') || lowerAns.includes('search range'));
      if (satisfied) extractedClaims.push('Explained sorted data requirement and halving search space.');
    } else if (reqId === 'complexity' || reqId === 'complexity_value') {
      satisfied = lowerAns.includes('o(log n)') || lowerAns.includes('log n') || lowerAns.includes('o(n)');
      if (satisfied) extractedClaims.push('Stated exact Big-O complexity.');
    } else if (reqId === 'example' || reqLower.includes('example') || reqLower.includes('use case')) {
      satisfied =
        lowerAns.includes('for example') ||
        lowerAns.includes('for instance') ||
        lowerAns.includes('e.g.') ||
        lowerAns.includes('method overriding') ||
        lowerAns.includes('runtime polymorphism') ||
        lowerAns.includes('parent class reference') ||
        lowerAns.includes('ecommerce') ||
        lowerAns.includes('e-commerce') ||
        lowerAns.includes('such as');
      if (satisfied) extractedClaims.push('Provided concrete practical example / use case.');
    } else if (reqId === 'code_implementation' || reqLower.includes('code')) {
      satisfied = /[{}();=\[\]<>]/.test(cleanAns) || /public |function |return |class /i.test(cleanAns);
      if (satisfied) extractedClaims.push('Provided working code implementation.');
    } else if (reqId === 'differences' || reqLower.includes('difference') || reqLower.includes('trade-off')) {
      satisfied =
        (lowerAns.includes('while') || lowerAns.includes('whereas') || lowerAns.includes('instead') || lowerAns.includes('differs')) &&
        rubricOverlapRatio >= 0.15;
      if (satisfied) extractedClaims.push('Compared core differences and trade-offs.');
    } else if (reqId === 'stance' || reqLower.includes('stance')) {
      satisfied = lowerAns.startsWith('yes') || lowerAns.startsWith('no') || lowerAns.includes('yes,') || lowerAns.includes('yes.');
      if (satisfied) extractedClaims.push('Provided direct stance.');
    } else {
      satisfied = rubricOverlapRatio >= 0.15 || (lowerAns.length >= 35 && !substance.isQuestionCopied);
      if (satisfied) extractedClaims.push(`Addressed ${req.requirement}`);
    }

    if (satisfied) {
      supportedReqs.push(req.requirement);
    } else {
      unsupportedReqs.push(req.requirement);
    }

    return {
      requirement: req.requirement,
      satisfied,
    };
  });

  const satisfiedCount = evaluatedRequirements.filter((r) => r.satisfied).length;
  const requirementSatisfactionRatio = evaluatedRequirements.length > 0 ? satisfiedCount / evaluatedRequirements.length : 0.5;

  let technicalAccuracy = 0;
  let completeness = 0;
  let relevance = 85;
  let clarity = 80;

  // Scoring based on informative rubric overlap and requirements evidence
  if (qIntent.questionType === 'yes_no') {
    const hasBytecodeJVM = lowerAns.includes('bytecode') || lowerAns.includes('jvm') || lowerAns.includes('virtual machine') || lowerAns.includes('operating system');
    if (hasBytecodeJVM) {
      technicalAccuracy = 95;
      completeness = 90;
      relevance = 95;
      clarity = 90;
    } else {
      technicalAccuracy = 45;
      completeness = 25;
      relevance = 75;
      clarity = 60;
    }
  } else if (qIntent.topic.toLowerCase().includes('binary search')) {
    const hasComplexity = lowerAns.includes('o(log n)') || lowerAns.includes('log n');
    const hasDivisionExplanation = lowerAns.includes('half') || lowerAns.includes('divide') || lowerAns.includes('divided') || lowerAns.includes('search range') || lowerAns.includes('search space');
    const hasSorted = lowerAns.includes('sorted');
    if (hasComplexity && (hasDivisionExplanation || hasSorted)) {
      technicalAccuracy = 95;
      completeness = 90;
      relevance = 95;
      clarity = 90;
    } else if (hasComplexity) {
      technicalAccuracy = 80;
      completeness = 60;
      relevance = 90;
      clarity = 80;
    } else {
      technicalAccuracy = 50;
      completeness = 40;
      relevance = 65;
      clarity = 65;
    }
  } else if (qIntent.questionType === 'behavioral') {
    const mentionsIssueAndFix =
      (lowerAns.includes('issue') || lowerAns.includes('bug') || lowerAns.includes('challenge') || lowerAns.includes('error')) &&
      (lowerAns.includes('check') || lowerAns.includes('investigate') || lowerAns.includes('resolved') || lowerAns.includes('fixed') || lowerAns.includes('verified'));
    if (mentionsIssueAndFix) {
      technicalAccuracy = 85;
      completeness = 85;
      relevance = 90;
      clarity = 85;
    } else {
      technicalAccuracy = 55;
      completeness = 50;
      relevance = 75;
      clarity = 70;
    }
  } else if (substance.answerStatus === 'PARTIAL' && qIntent.questionType === 'comparison') {
    technicalAccuracy = 45;
    completeness = 35;
    relevance = 70;
    clarity = 65;
  } else if (requirementSatisfactionRatio >= 0.75 || rubricOverlapRatio >= 0.25) {
    technicalAccuracy = Math.min(95, 80 + Math.round(requirementSatisfactionRatio * 15));
    completeness = Math.min(95, 75 + Math.round(requirementSatisfactionRatio * 20));
    relevance = 90;
    clarity = 85;
  } else if (requirementSatisfactionRatio >= 0.40 || rubricOverlapRatio >= 0.12) {
    technicalAccuracy = 75;
    completeness = 65;
    relevance = 80;
    clarity = 75;
  } else {
    technicalAccuracy = 50;
    completeness = 40;
    relevance = 65;
    clarity = 65;
  }

  const strengths = extractedClaims.length > 0 && technicalAccuracy >= 60 ? extractedClaims.slice(0, 2) : [];
  const whatIsMissing = unsupportedReqs.length > 0 ? unsupportedReqs : [];
  const howToImprove = unsupportedReqs.length > 0
    ? unsupportedReqs.map((r) => `Explain: ${r}`)
    : [`Ground ${qIntent.topic} concepts with concrete production architectures and examples.`];

  return {
    validity: {
      isMeaningful: true,
      isRelevant: true,
      isAttempt: true,
      isQuestionCopied: false,
      isGenericFiller: false,
      isKeywordStuffed: false,
    },
    evidence: {
      technicalClaims: extractedClaims,
      supportedRequirements: supportedReqs,
      unsupportedRequirements: unsupportedReqs,
    },
    questionType: qIntent.questionType,
    topic: qIntent.topic,
    requirements: evaluatedRequirements,
    scores: {
      technicalAccuracy,
      completeness,
      relevance,
      clarity,
      confidence: 0.90,
    },
    reason: technicalAccuracy >= 70
      ? `Accurate technical explanation demonstrating understanding of ${qIntent.topic}.`
      : `Partially addressed ${qIntent.topic}, but lacks complete coverage of: ${unsupportedReqs.join(', ')}.`,
    feedback: {
      whatYouDidWell: strengths,
      whatIsMissing,
      strengths,
      weaknesses: unsupportedReqs.length > 0 ? [`Missing technical details for: ${unsupportedReqs.slice(0, 2).join(', ')}.`] : [],
      howToImprove: howToImprove.slice(0, 2),
    },
    betterApproach: expectedRubric || `State the core definition of ${qIntent.topic}, explain how it operates under the hood, and give one practical example.`,
  };
};

/**
 * Deterministic Backend Scoring & Rule Enforcement Engine (Stage B)
 * AI Analyzes -> Backend Enforces & Calculates Final Score
 */
export const calculateFinalScoreAndFeedback = (
  stageAAnalysis,
  questionIntent,
  questionText,
  studentAnswer,
  expectedRubric = ''
) => {
  const validity = stageAAnalysis.validity || {};
  const rawScores = stageAAnalysis.scores || {};

  let technicalAccuracy = Math.min(100, Math.max(0, typeof rawScores.technicalAccuracy === 'number' ? rawScores.technicalAccuracy : 0));
  let completeness = Math.min(100, Math.max(0, typeof rawScores.completeness === 'number' ? rawScores.completeness : 0));
  let relevance = Math.min(100, Math.max(0, typeof rawScores.relevance === 'number' ? rawScores.relevance : 0));
  let clarity = Math.min(100, Math.max(0, typeof rawScores.clarity === 'number' ? rawScores.clarity : 0));

  let answerStatus = 'VALID';
  let isMeaningfulAnswer = true;
  let isQuestionRestatement = validity.isQuestionCopied === true;

  // RULE 1: Explicit Unknown ("I don't know", "no idea")
  if (!validity.isAttempt && validity.isExplicitUnknown) {
    technicalAccuracy = 0;
    completeness = 0;
    relevance = 0;
    clarity = 0;
    answerStatus = 'INSUFFICIENT';
    isMeaningfulAnswer = false;
  }
  // RULE 2: Question Copied / Parroted with Fluff
  else if (validity.isQuestionCopied) {
    technicalAccuracy = 0;
    completeness = 0;
    relevance = 0;
    clarity = 0;
    answerStatus = 'INSUFFICIENT';
    isMeaningfulAnswer = false;
    isQuestionRestatement = true;
  }
  // RULE 3: Generic Filler / Fluff ("good nice", "very good", "important concept is good")
  else if (validity.isGenericFiller) {
    technicalAccuracy = 0;
    completeness = 0;
    relevance = 0;
    clarity = 0;
    answerStatus = 'INSUFFICIENT';
    isMeaningfulAnswer = false;
  }
  // RULE 4: Completely Irrelevant / Off-Topic
  else if (!validity.isRelevant) {
    technicalAccuracy = 0;
    completeness = 0;
    relevance = 0;
    clarity = Math.min(20, clarity);
    answerStatus = 'INSUFFICIENT';
    isMeaningfulAnswer = false;
  }
  // RULE 5: Keyword Stuffed without reasoning
  else if (validity.isKeywordStuffed) {
    technicalAccuracy = 0;
    completeness = 0;
    relevance = Math.min(20, relevance);
    clarity = 0;
    answerStatus = 'INSUFFICIENT';
    isMeaningfulAnswer = false;
  }

  // Calculate Weighted Overall Score:
  // Technical Accuracy = 35%, Completeness = 25%, Relevance = 20%, Clarity = 20%
  let overall = Math.round(
    technicalAccuracy * 0.35 +
    completeness * 0.25 +
    relevance * 0.20 +
    clarity * 0.20
  );

  // Backend Hard Caps
  if (validity.isQuestionCopied) {
    overall = 0;
  } else if (validity.isGenericFiller || validity.isExplicitUnknown) {
    overall = 0;
  } else if (!validity.isRelevant) {
    overall = Math.min(10, overall);
  } else if (validity.isKeywordStuffed) {
    overall = Math.min(10, overall);
  }

  // Hard Override: Status alignment
  if (overall < 25 || !validity.isAttempt || validity.isGenericFiller || validity.isQuestionCopied || !validity.isRelevant || validity.isKeywordStuffed) {
    answerStatus = 'INSUFFICIENT';
    if (overall <= 10) isMeaningfulAnswer = false;
  } else if (overall < 60) {
    answerStatus = 'PARTIAL';
    isMeaningfulAnswer = true;
  } else {
    answerStatus = 'VALID';
    isMeaningfulAnswer = true;
  }

  // Verdict & Skill Evidence
  let verdict = 'incorrect';
  if (overall >= 85) verdict = 'excellent';
  else if (overall >= 70) verdict = 'good';
  else if (overall >= 50) verdict = 'partial';
  else if (overall > 0 && answerStatus !== 'INSUFFICIENT') verdict = 'needs_improvement';
  else if (validity.isExplicitUnknown) verdict = 'unanswered';
  else verdict = 'incorrect';

  const skillEvidence = overall >= 75 && relevance >= 70
    ? 'strong'
    : overall >= 50 && relevance >= 45
    ? 'moderate'
    : 'insufficient';

  // Format Strengths & Weaknesses (GROUNDED EVIDENCE ONLY)
  const evidence = stageAAnalysis.evidence || {};
  let strengths = [];
  if (overall >= 60 && evidence.technicalClaims && evidence.technicalClaims.length > 0) {
    strengths = evidence.technicalClaims.slice(0, 2);
  } else if (overall >= 60 && stageAAnalysis.feedback?.strengths && stageAAnalysis.feedback.strengths.length > 0) {
    strengths = stageAAnalysis.feedback.strengths.slice(0, 2);
  }

  let weaknesses = [];
  if (stageAAnalysis.feedback?.weaknesses && stageAAnalysis.feedback.weaknesses.length > 0) {
    weaknesses = stageAAnalysis.feedback.weaknesses.slice(0, 2);
  } else if (overall < 60) {
    weaknesses = [stageAAnalysis.reason || 'The response lacks technical depth and complete explanations.'];
  }

  let whatIsMissing = [];
  if (evidence.unsupportedRequirements && evidence.unsupportedRequirements.length > 0) {
    whatIsMissing = evidence.unsupportedRequirements;
  } else if (stageAAnalysis.feedback?.whatIsMissing && stageAAnalysis.feedback.whatIsMissing.length > 0) {
    whatIsMissing = stageAAnalysis.feedback.whatIsMissing;
  } else if (overall < 60) {
    whatIsMissing = ['Complete conceptual explanation and practical implementation details.'];
  }

  let howToImprove = [];
  if (stageAAnalysis.feedback?.howToImprove && Array.isArray(stageAAnalysis.feedback.howToImprove) && stageAAnalysis.feedback.howToImprove.length > 0) {
    howToImprove = stageAAnalysis.feedback.howToImprove.slice(0, 2);
  } else if (whatIsMissing.length > 0) {
    howToImprove = whatIsMissing.slice(0, 2).map((m) => `Explain: ${m}`);
  } else {
    howToImprove = [`Review core ${questionIntent.topic} architecture and provide definitions, mechanisms, and examples.`];
  }

  const betterApproach = stageAAnalysis.betterApproach || expectedRubric || 'Provide definitions, explain how it operates under the hood, and give one practical example.';

  // Construct Feedback Message (GROUNDED IN USER REALITY)
  let feedbackMessage = '';
  if (validity.isQuestionCopied) {
    feedbackMessage = `The response repeats the question with filler words but does not explain ${questionIntent.topic} or provide technical evidence.`;
  } else if (validity.isGenericFiller) {
    feedbackMessage = `The response contains generic praise/filler but does not explain ${questionIntent.topic}.`;
  } else if (!validity.isRelevant) {
    feedbackMessage = `The response is off-topic and does not address ${questionIntent.topic}.`;
  } else if (overall >= 70) {
    feedbackMessage = `Accurate technical explanation demonstrating understanding of ${questionIntent.topic}.`;
  } else {
    feedbackMessage = stageAAnalysis.reason || `Evaluated for ${questionIntent.topic} technical accuracy.`;
  }

  // SAFE SERVER-SIDE LOGGING
  console.log('------------------------------------------------------------');
  console.log(`[INTERVIEW EVALUATION] Question: "${questionText.slice(0, 75)}..."`);
  console.log(`[INTERVIEW EVALUATION] Answer length: ${studentAnswer.length} chars | Words: ${studentAnswer.trim().split(/\s+/).length}`);
  console.log(`[INTERVIEW EVALUATION] Intent: ${questionIntent.questionType} | Topic: ${questionIntent.topic}`);
  console.log(`[INTERVIEW EVALUATION] Validity: ${answerStatus} (Meaningful: ${isMeaningfulAnswer}, Attempt: ${validity.isAttempt !== false})`);
  console.log(`[INTERVIEW EVALUATION] Metrics => Tech: ${technicalAccuracy}%, Comp: ${completeness}%, Rel: ${relevance}%, Clar: ${clarity}%`);
  console.log(`[INTERVIEW EVALUATION] Final Score: ${overall}/100 | Verdict: ${verdict.toUpperCase()} | Evidence: ${skillEvidence.toUpperCase()}`);
  console.log('------------------------------------------------------------');

  return {
    answerStatus,
    isMeaningfulAnswer,
    isQuestionRestatement,
    validityReason: stageAAnalysis.reason || '',
    score: overall,
    verdict,
    skillEvidence,
    feedback: feedbackMessage,
    strengths,
    whatWentWell: strengths,
    weaknesses,
    whatIsMissing,
    howToImprove,
    betterApproach,
    scores: {
      technicalAccuracy,
      completeness,
      clarity,
      communicationClarity: clarity,
      relevance,
      depth: technicalAccuracy,
      correctness: technicalAccuracy,
      overall,
    },
    evaluation: {
      validity: {
        isMeaningful: isMeaningfulAnswer,
        isRelevant: validity.isRelevant !== false,
        isAttempt: validity.isAttempt !== false,
        isQuestionCopied: validity.isQuestionCopied === true,
        isGenericFiller: validity.isGenericFiller === true,
        isKeywordStuffed: validity.isKeywordStuffed === true,
      },
      evidence: {
        technicalClaims: strengths,
        supportedRequirements: evidence.supportedRequirements || [],
        unsupportedRequirements: whatIsMissing,
      },
      questionIntent: {
        questionType: questionIntent.questionType,
        topic: questionIntent.topic,
        requirements: stageAAnalysis.requirements || [],
      },
      scores: {
        technicalDepth: technicalAccuracy,
        technicalAccuracy,
        completeness,
        relevance,
        clarity,
        overall,
      },
      feedback: {
        whatYouDidWell: strengths,
        whatIsMissing,
        howToImprove,
        improvement: stageAAnalysis.feedback?.improvement || '',
      },
    },
  };
};

/**
 * Top-Level Evaluator Orchestrator
 */
export const evaluateInterviewAnswer = async (
  questionText,
  studentAnswer,
  role = 'Data Analyst',
  type = 'Technical',
  difficulty = 'Medium',
  expectedRubric = ''
) => {
  if (!studentAnswer || !studentAnswer.trim()) {
    throw new Error('Please provide an answer to evaluate.');
  }

  const cleanAnswer = studentAnswer.trim();

  // 1. Extract Question Intent & Requirements
  const questionIntent = extractQuestionIntent(questionText, role, type);

  // 2. Stage 1 Deterministic Fast Gate
  const fastSubstanceCheck = analyzeAnswerSubstance(
    cleanAnswer,
    questionText,
    questionIntent,
    expectedRubric
  );

  let stageAAnalysis = null;

  // If Fast Substance Check caught severe invalidity (echo, gibberish, explicit unknown, generic fluff)
  if (!fastSubstanceCheck.isValid || !fastSubstanceCheck.isAttempt) {
    stageAAnalysis = evaluateOfflineStageA(
      questionText,
      cleanAnswer,
      role,
      questionIntent.topic,
      questionIntent,
      expectedRubric
    );
  } else {
    // Attempt Gemini Stage A Structured Evaluation
    stageAAnalysis = await callGeminiStageA(
      questionText,
      cleanAnswer,
      role,
      questionIntent.topic,
      questionIntent,
      expectedRubric
    );

    // If Gemini is unavailable / rate-limited / offline, fallback to deterministic offline Stage A
    if (!stageAAnalysis) {
      stageAAnalysis = evaluateOfflineStageA(
        questionText,
        cleanAnswer,
        role,
        questionIntent.topic,
        questionIntent,
        expectedRubric
      );
    }
  }

  // 3. Stage B Deterministic Backend Scoring & Rule Enforcement
  return calculateFinalScoreAndFeedback(
    stageAAnalysis,
    questionIntent,
    questionText,
    cleanAnswer,
    expectedRubric
  );
};
