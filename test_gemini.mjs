import { GoogleGenAI } from '@google/genai';

async function test() {
    console.log("Starting test...");
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyAEdmblhXdBJ5yk6vKHA6q1xlXIXn19AcY' });
    try {
        console.log("Calling Gemini...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hello!'
        });
        console.log("Response:", response.text);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
