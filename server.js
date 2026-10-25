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

        let response;
        let attempts = 0;
        let success = false;

        // Yoğunluk (503) hatası alırsak 2 kez daha deneme mekanizması (Retry)
        while (attempts < 3 && !success) {
            try {
                attempts++;
                response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: userMessage,
                    config: {
                        systemInstruction: "Sen Roblox oyunundaki akıllı bir NPC'sin. Oyuncuların sorularına kısa, eğlenceli ve oyunun temasına uygun Türkçe cevaplar ver."
                    }
                });
                success = true;
            } catch (err) {
                if (attempts >= 3) throw err;
                // 1 saniye bekleyip tekrar dene
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        res.json({ reply: response.text });
    } catch (error) {
        console.error("API Hatası:", error);
        res.status(500).json({ error: "Yapay zeka şu an çok yoğun, lütfen biraz sonra tekrar dene." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
