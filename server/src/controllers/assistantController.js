import { fallbackReply, knowledgeBase, roleSuggestions, SECURITY_REPLY } from '../data/labosKnowledgeBase.js';

const sensitivePatterns = [
  /\b(demo credentials?|demo login|login details?)\b/i,
  /\b(show|share|tell|give|send|reveal|list|display)\b.*\b(passwords?|credentials?)\b/i,
  /\b(passwords?|credentials?)\b.*\b(show|share|tell|give|send|reveal|list|display)\b/i,
  /\b(jwt|token|secret|environment variables?|env vars?|\.env|database url|connection string|mongo(uri|db)?|password hash|hashes)\b/i
];

const outOfScopePatterns = [
  /\b(weather|football|betting|movie|music|recipe|politics|crypto|loan|dating|game cheat)\b/i
];

function normalize(value = '') {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function suggestionsFor(role, override) {
  return override?.length ? override.slice(0, 4) : roleSuggestions[role] || roleSuggestions.lab_staff;
}

function keywordScore(message, entry) {
  return entry.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalize(keyword);
    return message.includes(normalizedKeyword) ? score + normalizedKeyword.length : score;
  }, 0);
}

export async function chat(req, res) {
  const message = normalize(req.body.message);
  const role = req.user.role;

  if (!message) return res.status(422).json({ message: 'Message is required.' });

  if (sensitivePatterns.some((pattern) => pattern.test(message))) {
    return res.json({ reply: SECURITY_REPLY, suggestions: suggestionsFor(role) });
  }

  if (outOfScopePatterns.some((pattern) => pattern.test(message))) {
    return res.json({ reply: fallbackReply, suggestions: suggestionsFor(role) });
  }

  const matches = knowledgeBase
    .filter((entry) => entry.roles.includes(role))
    .map((entry) => ({ entry, score: keywordScore(message, entry) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = matches[0]?.entry;
  if (!best) return res.json({ reply: fallbackReply, suggestions: suggestionsFor(role) });

  res.json({ reply: best.reply, suggestions: suggestionsFor(role, best.suggestions) });
}
