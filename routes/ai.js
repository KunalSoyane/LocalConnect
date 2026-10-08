const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Service = require('../models/Service');

// Instantiate OpenAI if key exists
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Valid categories in the system
const validCategories = ['Electrician', 'Plumber', 'Tutor', 'Home Cleaner', 'Mechanic', 'Nurse', 'Carpenter', 'Painter', 'AC Repair', 'Pest Control', 'Other'];

// POST /api/ai/recommend
router.post('/recommend', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please describe your problem' });
    }

    if (!openai) {
      // Mock mode if no real key provided
      return res.status(200).json({
        success: true,
        data: {
          category: 'Plumber',
          reasoning: 'Since you mentioned a leak, a plumber is best equipped to handle water pipe and fixture repairs.',
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for a local service platform. Based on the user's problem description, recommend the most appropriate service category from this exact list: [${validCategories.join(', ')}]. Respond in strict JSON format: {"category": "Exact Category Name", "reasoning": "Brief 1-2 sentence explanation why."}`,
        },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0].message.content;
    const parsedData = JSON.parse(responseContent);

    // Verify it's a valid category, else fallback
    if (!validCategories.includes(parsedData.category)) {
      parsedData.category = 'Other';
    }

    res.json({ success: true, data: parsedData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI recommendation failed. Please try searching manually.' });
  }
});

module.exports = router;
