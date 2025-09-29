const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

let sessionId = null;

export async function startChatSession() {
  if (!sessionId) {
    const res = await fetch(`${API_URL}/chat/start`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to start session: ${res.status}`);
    }

    const data = await res.json();
    sessionId = data.session_id;
    console.log('✅ Chat session started:', sessionId);
  }
  return sessionId;
}

export async function sendMessageToChat(text) {
  await startChatSession();

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Cannot send empty message');
  }

  const res = await fetch(`${API_URL}/chat/${sessionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'user', text: text.trim() })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Server returned error:', errText);
    throw new Error(`Message send failed: ${res.status}`);
  }

  const data = await res.json();

  return {
    reply: data.reply,
    modelUsed: data.modelUsed || 'Unknown',
    actionCompleted: data.actionCompleted || false
  };
}

export async function getSessionHistory() {
  if (!sessionId) return [];

  try {
    const res = await fetch(`${API_URL}/chat/${sessionId}`);
    
    if (!res.ok) {
      console.warn('No session history found, status:', res.status);
      return [];
    }

    // Check if response has content
    const text = await res.text();
    if (!text || text.trim() === '') {
      console.warn('Empty response from server');
      return [];
    }

    // Try to parse JSON
    const data = JSON.parse(text);
    return data.messages || [];
  } catch (err) {
    console.error('Error fetching session history:', err.message);
    return [];
  }
}

export function clearSession() {
  sessionId = null;
}