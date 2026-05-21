require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const conversations = new Map();

const SYSTEM_PROMPT = `Eres un asistente virtual amable y profesional. 
Tu trabajo es responder preguntas de clientes de manera clara y concisa.
Responde siempre en el idioma del cliente.
Si no sabes algo, dilo honestamente.
Máximo 3 párrafos por respuesta.`;

async function handleMessage(userId, userMessage) {
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }

  const history = conversations.get(userId);

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(userMessage);
    const assistantMessage = result.response.text();

    history.push({ role: 'user', parts: [{ text: userMessage }] });
    history.push({ role: 'model', parts: [{ text: assistantMessage }] });

    if (history.length > 20) {
      history.splice(0, 2);
    }

    return assistantMessage;
  } catch (error) {
    console.error('Error con Gemini API:', error.message);
    return 'Lo siento, tuve un problema técnico. Por favor intenta de nuevo.';
  }
}

module.exports = { handleMessage };
