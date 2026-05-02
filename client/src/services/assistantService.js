import api from './api.js';

export async function sendAssistantMessage(message) {
  const { data } = await api.post('/assistant/chat', { message });
  return data;
}
