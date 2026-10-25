const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/ask', async (req, res) => {
    try {
        const userMessage = req.body.prompt;
        if (!userMessage) {
            return res.status(400).json({ error: "Prompt bulunamadı." });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: "Sen Roblox oyunundaki akıllı bir NPC'sin. Oyuncuların sorularına kısa, eğlenceli ve oyunun temasına uygun Türkçe cevaplar ver."
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("API Hatası:", error);
        res.status(500).json({ error: "Yapay zeka yanıt oluştururken bir hata oluştu." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
