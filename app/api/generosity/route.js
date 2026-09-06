import { NextResponse } from 'next/server';

const FALLBACK_MISSIONS = {
  Feliz: [
    '☕ Comparte un café o un snack con alguien.',
    '🌟 Envía un mensaje de gratitud a un amigo.',
    '🎶 Recomienda una canción alegre.',
    '😊 Dedica un cumplido sincero a un compañero.'
  ],
  Cansado: [
    '💧 Coloca un recipiente con agua para aves.',
    '🧘 Tómate 5 minutos de pausa sin pantallas.',
    '🌱 Riega una planta cerca de ti.',
    '🎧 Escucha tu canción relajante favorita.'
  ],
  Motivado: [
    '🤝 Ayuda a alguien a terminar una tarea.',
    '📚 Recomienda un libro o tutorial útil.',
    '🚮 Recoge 3 cosas fuera de lugar.',
    '⭐ Deja una reseña positiva a un negocio local.'
  ],
  Estresado: [
    '🍫 Regala un detalle dulce a un colega.',
    '🎧 Escucha con atención sin interrumpir.',
    '🚶 Camina 5 minutos al aire libre.',
    '💌 Deja una nota amable en un lugar común.'
  ],
  Creativo: [
    '🎨 Dibuja una nota divertida para alguien.',
    '✍️ Escribe un mensaje de apoyo espontáneo.',
    '💡 Comparte una idea sencilla con tu equipo.',
    '📸 Envía una foto bonita a tu grupo de amigos.'
  ]
};

export async function POST(request) {
  let selectedMood = 'Feliz';
  try {
    const { mood } = await request.json();
    if (mood) selectedMood = mood;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Falta API Key');
    }

    const promptText = `Genera UNA sola micro-misión de amabilidad corta y creativa adaptada al estado de ánimo: "${selectedMood}".
Requisitos: Máximo 10 palabras, en español, empieza SIEMPRE con un emoji. Responde SOLO con la misión, sin comillas.`;

    // Intentamos la petición con un tiempo límite rápido
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s max timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 1.0 }
        })
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const mission = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (mission) {
        return NextResponse.json({ mission });
      }
    }

    throw new Error('Servidor Gemini ocupado o no disponible');
  } catch (error) {
    console.log('Gemini en alta demanda. Usando misión de contingencia instantánea...');
    
    // Si la IA falla o está saturada (503), seleccionamos una misión instantánea al azar
    const options = FALLBACK_MISSIONS[selectedMood] || FALLBACK_MISSIONS.Feliz;
    const randomMission = options[Math.floor(Math.random() * options.length)];

    return NextResponse.json({ mission: randomMission });
  }
}