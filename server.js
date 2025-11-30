
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // sirve tu HTML

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

app.post("/api/ai", async (req, res) => {
    const { input, productsJSON } = req.body;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text:
                                        input +
                                        " " +
                                        productsJSON +
                                        " la descripcion debe ser vendiendome uno o mas productos segun tu respuesta, pero solo los producto(s) en una propiedad productos: y aparte de la lista la descripcion sea descripcion: JSON"
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let jsonClean;
        try {
            jsonClean = JSON.parse(text);
        } catch (e) {
            return res.status(500).json({
                error: "No se pudo parsear JSON",
                raw: text
            });
        }

        // === ⚡ DEVOLVEMOS SOLO EL JSON LIMPIO ===
        return res.status(200).json(jsonClean);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el backend con Gemini" });
    }
});

app.listen(3000, () =>
    console.log("Servidor backend en http://localhost:3000")
);
