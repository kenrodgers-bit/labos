import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { sendAssistantMessage } from '../services/assistantService.js';
import { apiErrorMessage } from '../utils/errors.js';
import { roleLabel } from '../utils/format.js';

const roleSuggestions = {
  admin: [
    'How do I create staff accounts?',
    'How do I change my password?',
    'How do I approve partial quantity?',
    'How do I export reports?',
    'How do audit logs work?'
  ],
  staff: [
    'How do I request an item?',
    'How do I track my request?',
    'Why was my quantity reduced?',
    'What does pending mean?'
  ]
}; // LabOS fix: client-side assistant prompts only support Admin and Staff.

function assistantWelcome(user) {
  return {
    id: 'welcome',
    sender: 'assistant',
    text: `Hello ${user.name}. I can help with LabOS workflows for your ${roleLabel(user.role)} role.`
  };
}

export default function LabOSAssist() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [assistantWelcome(user)]);
  const [suggestions, setSuggestions] = useState(roleSuggestions[user.role] || roleSuggestions.staff); // LabOS fix: initial suggestions respect the two-role model.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const panelTitle = useMemo(() => `LabOS Assist | ${roleLabel(user.role)}`, [user.role]);

  async function sendMessage(messageText = input) {
    const text = messageText.trim();
    if (!text || loading) return;

    const userMessage = { id: `${Date.now()}-user`, sender: 'user', text };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const data = await sendAssistantMessage(text);
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, sender: 'assistant', text: data.reply }]);
      setSuggestions(data.suggestions || roleSuggestions[user.role] || roleSuggestions.staff); // LabOS fix: assistant fallback never references removed roles.
    } catch (err) {
      setError(apiErrorMessage(err, 'LabOS Assist could not respond. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  function openPanel() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 120);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="mb-3 flex h-[min(680px,calc(100vh-6rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft"
          >
            <header className="flex items-center justify-between border-b border-slate-100 bg-clinic-teal px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Bot size={19} />
                </div>
                <div>
                  <h2 className="text-sm font-black">LabOS Assist</h2>
                  <p className="text-xs text-teal-50">{panelTitle}</p>
                </div>
              </div>
              <button className="rounded-lg p-2 text-teal-50 hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Close LabOS Assist">
                <X size={18} />
              </button>
            </header>

            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
              <ShieldCheck size={15} className="text-teal-700" />
              Help-only. It cannot access or reveal credentials, tokens, or secrets.
            </div>

            <div className="table-scroll flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6 ${message.sender === 'user' ? 'bg-clinic-blue text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                    {message.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500">Checking LabOS guidance...</div>
                </div>
              )}
              {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</div>}
            </div>

            <div className="border-t border-slate-100 bg-white p-3">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                    onClick={() => sendMessage(suggestion)}
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  ref={inputRef}
                  className="input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={600}
                  placeholder="Ask about requests, stock, reports..."
                />
                <button className="btn-primary !px-3" disabled={loading || !input.trim()} aria-label="Send message">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!open && (
        <button
          onClick={openPanel}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-clinic-teal text-white shadow-soft transition hover:bg-teal-800"
          aria-label="Open LabOS Assist"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}
