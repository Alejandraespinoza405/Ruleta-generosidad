'use client';

import { useState } from "react";

const SEGMENTS = Array.from({ length: 12 });

const COLORS = [
  "#C8D8C0",
  "#D4C4D8",
  "#C4D4D8",
  "#D8CCC4",
  "#C8D0D8",
  "#D8C8C4",
  "#C4CCD4",
  "#D4D0C4",
  "#CCC4D4",
  "#C4D8CC",
  "#D4C8D0",
  "#C8C8D4",
];

const NUM = SEGMENTS.length;
const SEG_ANGLE = 360 / NUM;

const CX = 230;
const CY = 230;
const R = 210;
const INNER_R = 36;

function round(num) {
  return Math.round(num * 100) / 100;
}

function polarToXY(angleDeg, r) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;

  return {
    x: round(CX + r * Math.cos(rad)),
    y: round(CY + r * Math.sin(rad)),
  };
}

function segmentPath(i) {
  const start = i * SEG_ANGLE;
  const end = start + SEG_ANGLE;

  const p1 = polarToXY(start, R);
  const p2 = polarToXY(end, R);

  const pi1 = polarToXY(start, INNER_R);
  const pi2 = polarToXY(end, INNER_R);

  return [
    `M ${pi1.x} ${pi1.y}`,
    `L ${p1.x} ${p1.y}`,
    `A ${R} ${R} 0 0 1 ${p2.x} ${p2.y}`,
    `L ${pi2.x} ${pi2.y}`,
    `A ${INNER_R} ${INNER_R} 0 0 0 ${pi1.x} ${pi1.y}`,
    "Z",
  ].join(" ");
}

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const [winner, setWinner] = useState(null);
  const [aiMission, setAiMission] = useState("");

  const [mood, setMood] = useState("Feliz");

  const [confetti, setConfetti] = useState([]);

  const generateRandomConfetti = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: Math.floor(Math.random() * 90) + 5,
      color: COLORS[i % COLORS.length],
      size: Math.floor(Math.random() * 10) + 6,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 0.8,
    }));
  };

  const spin = async () => {
    if (spinning) return;

    setSpinning(true);
    setWinner(null);
    setAiMission("");
    setConfetti([]);

    const aiPromise = fetch("/api/generosity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mood,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.mission)
      .catch(() => null);

    const randomIndex = Math.floor(Math.random() * NUM);

    const extraTurns =
      Math.floor(Math.random() * 4) + 5;

    const segMid =
      randomIndex * SEG_ANGLE +
      SEG_ANGLE / 2;

    const currentMod =
      ((rotation % 360) + 360) % 360;

    let delta =
      (segMid - currentMod + 360) % 360;

    if (delta === 0) {
      delta = 360;
    }

    const nextRotation =
      rotation +
      delta +
      360 * extraTurns;

    setRotation(nextRotation);

    const [fetchedMission] =
      await Promise.all([
        aiPromise,
        new Promise((resolve) =>
          setTimeout(resolve, 4500)
        ),
      ]);

    setSpinning(false);

    setWinner(randomIndex);

setAiMission(
  fetchedMission ||
  "💜 Haz un pequeño acto de amabilidad hoy."
);

    const newConfetti =
      generateRandomConfetti();

    setConfetti(newConfetti);

    setTimeout(() => {
      setConfetti([]);
    }, 5000);
  };

  const acceptMission = () => {
    setWinner(null);
    setAiMission("");
    setConfetti([]);
  };

  return (
    <main className="generosity-page">
  <video
    className="background-video"
    autoPlay
    muted
    loop
    playsInline
  >
    <source src="/fondo-generosidad.mp4" type="video/mp4" />
  </video>

  <div className="background-overlay" />

      {/* FONDOS DECORATIVOS */}

      <div className="background-decoration decoration-one" />

      <div className="background-decoration decoration-two" />

      {/* CONFETI */}

      <div className="confetti-container">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="confetti-dot"
            style={{
              left: `${c.x}%`,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      {/* HEADER */}

      <header className="generosity-header">

        <p className="eyebrow">
          ACTO DEL DÍA
        </p>

        <h1>
          Ruleta de la
          <br />
          Generosidad
        </h1>

        <p className="subtitle">
          Gira y descubre tu acto de bondad del día
        </p>

        <div className="mood-selector">

          <label>
            ¿Cómo estás?
          </label>

          <select
            value={mood}
            onChange={(e) =>
              setMood(e.target.value)
            }
          >
            <option value="Feliz">
              😊 Feliz
            </option>

            <option value="Cansado">
              😴 Cansado
            </option>

            <option value="Motivado">
              🔥 Motivado
            </option>

            <option value="Estresado">
              🧘 Estresado
            </option>

            <option value="Creativo">
              🎨 Creativo
            </option>
          </select>

        </div>

      </header>

      {/* RULETA */}

      <section className="wheel-section">

        <div className="wheel-arrow">

          <div />

        </div>

        <div className="wheel-container">

          <svg
            viewBox="0 0 460 460"
            className="wheel-svg"
          >

            <circle
              cx={CX}
              cy={CY}
              r={R + 14}
              fill="#3d3450"
            />

            <circle
              cx={CX}
              cy={CY}
              r={R + 8}
              fill="white"
              opacity="0.12"
            />

            <g
              style={{
                transformOrigin:
                  `${CX}px ${CY}px`,

                transform:
                  `rotate(${rotation}deg)`,

                transition: spinning
                  ? "transform 4.5s cubic-bezier(0.15, 0.6, 0.1, 1)"
                  : "none",
              }}
            >

             {SEGMENTS.map((_, i) => (
  <g key={i}>
    <path
      d={segmentPath(i)}
      fill={COLORS[i]}
    />

    <path
      d={segmentPath(i)}
      fill="none"
      stroke="white"
      strokeWidth="2"
      opacity="0.7"
    />
  </g>
))}

              <circle
                cx={CX}
                cy={CY}
                r={INNER_R + 4}
                fill="white"
                opacity="0.9"
              />

              <circle
                cx={CX}
                cy={CY}
                r={INNER_R}
                fill="#3d3450"
              />

            </g>

          </svg>

        </div>

      </section>

      {/* BOTÓN */}

      <button
        onClick={spin}
        disabled={spinning}
        className="spin-btn"
      >
        {spinning
          ? "Girando…"
          : "¡Girar la ruleta!"}
      </button>

      {/* FOOTER */}

      <p className="footer-text">
        Pequeños actos, gran impacto
      </p>

      {/* ================================= */}
      {/* ALERTA DE MISIÓN */}
      {/* ================================= */}

      {winner !== null && !spinning && (

        <div className="mission-overlay">

          <div className="mission-modal">

            {/* ESTRELLA */}

            <div className="mission-icon">
              ✨
            </div>

            <div className="mission-content">

              <p className="mission-eyebrow">
                TU ACTO DE GENEROSIDAD
              </p>

              <h2>
                Tu misión 💜
              </h2>

              <div className="mission-divider">
                <span />
                ✦
                <span />
              </div>

              <p className="mission-text">
                {aiMission}
              </p>

              <p className="mission-mood">
                Pensada para tu ánimo:{" "}
                {mood}
              </p>

              <button
                onClick={acceptMission}
                className="accept-mission-btn"
              >
                ¡Acepto mi misión! 💜
              </button>

              <p className="mission-footer">
                Un pequeño acto puede cambiar
                el día de alguien.
              </p>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}