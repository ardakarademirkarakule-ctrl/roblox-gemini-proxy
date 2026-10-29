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

        console.log("Gelen soru:", userMessage);

        // Gemini isteğini bir zaman aşımı (timeout) sarmalına alalım
        const aiPromise = ai.models.generateContent({
            model: 'gemini-3.5-flash-lite', // <-- Hafif ve yoğunluk dostu model
            contents: userMessage,
            config: {
                systemInstruction: "Sen Roblox oyunundaki akıllı bir NPC'sin. Oyuncuların sorularına kısa, eğlenceli ve oyunun temasına uygun Türkçe cevaplar ver. Maksimum 1-2 cümle olsun."
            }
        });
        
        // 7 saniye içinde cevap gelmezse patlat
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI Yanıt Süresi Aşımı (Timeout)')), 7000)
        );

        const response = await Promise.race([aiPromise, timeoutPromise]);

        console.log("Gemini'den yanıt başarıyla alındı.");
        res.json({ reply: response.text });

    } catch (error) {
        console.error("Sunucu Kritik Hatası:", error.message);
        // Oyunda asılı kalmasın diye direkt bir metin dönüyoruz
        res.status(500).json({ reply: "Agalar şu an kafam çok karışık, sonra sor!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
