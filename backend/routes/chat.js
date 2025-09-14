const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.warn("⚠️ Hugging Face token (HF_TOKEN) is missing from .env file.");
}

const models = [
  {
    name: 'DialoGPT (medium)',
    url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    formatInput: (msg) => ({ inputs: msg }),
    formatReply: (res) =>
      res.data?.generated_text || res.data?.[0]?.generated_text,
  },
  {
    name: 'FLAN-T5 (small)',
    url: 'https://api-inference.huggingface.co/models/google/flan-t5-small',
    formatInput: (msg) => ({ inputs: `User: ${msg}\nAssistant:` }),
    formatReply: (res) =>
      res.data?.[0]?.generated_text || res.data?.generated_text,
  },
  {
    name: 'Mixtral (8x7B)',
    url: 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
    formatInput: (msg) => ({ inputs: `<s>[INST] ${msg} [/INST]` }),
    formatReply: (res) =>
      res.data?.[0]?.generated_text || res.data?.generated_text,
  },
];

router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ reply: 'Please provide a valid message.' });
  }

  console.log("📥 Message received:", userMessage);

  for (const model of models) {
    try {
      console.log(`🤖 Trying model: ${model.name}`);

      const response = await axios.post(
        model.url,
        model.formatInput(userMessage),
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;

      if (result.error || result.estimated_time) {
        console.warn(`⏳ ${model.name} is warming up or failed.`);
        continue;
      }

      const reply = model.formatReply(response);

      if (reply && typeof reply === 'string') {
        console.log(`✅ ${model.name} replied successfully.`);
        return res.json({ reply });
      }

    } catch (err) {
      console.error(`❌ ${model.name} failed:`, err?.response?.data || err.message);
    }
  }

  res.status(500).json({
    reply: 'All models are unavailable. Please try again shortly.',
  });
});

module.exports = router;
