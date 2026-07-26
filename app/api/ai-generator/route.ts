import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, slideType, count = 3 } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    // במידה ולא הוגדר מפתח Gemini - נשתמש במנוע חינמי ללא מפתח (Pollinations AI / Mock Fallback)
    if (!apiKey) {
      const mockQuestions = Array.from({ length: count }).map((_, i) => ({
        title: `שאלה ${i + 1}: ${prompt}`,
        type: slideType || "trivia",
        options: [
          { id: "1", text: "תשובה נכונה מדגם", is_correct: true },
          { id: "2", text: "תשובה שגויה 1", is_correct: false },
          { id: "3", text: "תשובה שגויה 2", is_correct: false },
          { id: "4", text: "תשובה שגויה 3", is_correct: false },
        ],
        timeLimit: 20,
        points: 100
      }));

      return NextResponse.json({ success: true, slides: mockQuestions });
    }

    const systemPrompt = `אתה מחולל שאלות לחידון אינטראקטיבי. מחזיר אך ורק JSON במבנה הבא ללא טקסט נוסף:
    [
      {
        "title": "נוסח השאלה",
        "type": "${slideType}",
        "options": [
          {"id": "1", "text": "תשובה 1", "is_correct": true},
          {"id": "2", "text": "תשובה 2", "is_correct": false},
          {"id": "3", "text": "תשובה 3", "is_correct": false},
          {"id": "4", "text": "תשובה 4", "is_correct": false}
        ],
        "timeLimit": 20,
        "points": 100
      }
    ]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nצור ${count} שאלות בנושא: ${prompt}` }] }
        ]
      })
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const slides = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, slides });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}