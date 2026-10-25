// Personaje animado de frente que sostiene un cartel de oferta (solo SVG + CSS, sin imágenes).
// Ciclo de 5 s: está tranquilo con el cartel en alto (respira, parpadea normal); de pronto
// dobla rodillas y codos para tomar impulso, salta de alegría dos veces estirando los brazos,
// encoge las piernas en el aire y amortigua al caer; el cartel se sacude, cierra los ojos
// felices (^ ^), sube las cejas, abre la boca y saltan brillitos; se calma y parpadea lento.
// Brazos y piernas tienen codo y rodilla: se animan cambiando su trazo (SMIL), sincronizados con el CSS.
const CICLO = "5s";
// Momentos del ciclo: quieto, impulso, aire, aire, cae, quieto, saltito, cae, quieto
const TIEMPOS = [0, 0.5, 0.54, 0.58, 0.62, 0.66, 0.69, 0.72, 0.76, 0.8, 1];
const SUAVE = TIEMPOS.slice(1).map(() => "0.4 0 0.6 1").join(";");

// Codo y mano (lado izquierdo; el derecho se refleja) en cada momento
const BRAZO = [
  [[17.5, 34.5], [16, 19.5]], [[17.5, 34.5], [16, 19.5]], [[15.2, 37], [16, 22.5]], [[19, 33], [16, 16.5]], [[19, 33], [16, 16.5]],
  [[15.6, 36.5], [16, 21.5]], [[17.5, 34.5], [16, 19.5]], [[18.6, 33.5], [16, 18]], [[16.4, 36], [16, 21]], [[17.5, 34.5], [16, 19.5]], [[17.5, 34.5], [16, 19.5]],
];
// Rodilla y pie (lado izquierdo) en cada momento: se doblan para el impulso y se encogen en el aire
const PIERNA = [
  [[27.6, 74], [27, 85]], [[27.6, 74], [27, 85]], [[25, 73], [27, 83.5]], [[25.3, 71], [27.5, 80]], [[25.3, 71], [27.5, 80]],
  [[25, 73], [27, 84]], [[27.6, 74], [27, 85]], [[26, 72.5], [27.3, 82.5]], [[25.4, 73.3], [27, 84.2]], [[27.6, 74], [27, 85]], [[27.6, 74], [27, 85]],
];
const HOMBRO = [24, 49];
const CADERA = [28, 62];

const espejo = ([x, y]) => [64 - x, y];
const punto = ([x, y]) => `${x} ${y}`;

// Trazo animado: "cuadros" es la lista de trazos para cada momento del ciclo
function Animado({ cuadros, ...props }) {
  return (
    <path d={cuadros[0]} fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <animate attributeName="d" dur={CICLO} repeatCount="indefinite" calcMode="spline" keyTimes={TIEMPOS.join(";")} keySplines={SUAVE} values={cuadros.join(";")} />
    </path>
  );
}

function Brazo({ derecho }) {
  const f = derecho ? espejo : (p) => p;
  const manga = BRAZO.map(([codo]) => `M${punto(f(HOMBRO))} L${punto(f(codo))}`);
  const antebrazo = BRAZO.map(([codo, mano]) => `M${punto(f(codo))} L${punto(f(mano))}`);
  return (
    <>
      <Animado cuadros={antebrazo} stroke="#eab089" strokeWidth="4.2" />
      <Animado cuadros={manga} stroke="#f59e0b" strokeWidth="5.4" />
    </>
  );
}

function Pierna({ derecha }) {
  const f = derecha ? espejo : (p) => p;
  const cuadros = PIERNA.map(([rodilla, pie]) => `M${punto(f(CADERA))} L${punto(f(rodilla))} L${punto(f(pie))}`);
  return <Animado cuadros={cuadros} stroke={derecha ? "#111827" : "#1f2937"} strokeWidth="6" />;
}

export default function PersonajeOfertas({ className = "h-24 w-16" }) {
  return (
    <svg viewBox="0 0 64 96" className={className} overflow="visible" aria-hidden="true">
      <defs>
        <radialGradient id="fo-piel" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#fcd9b8" />
          <stop offset="1" stopColor="#e4a77c" />
        </radialGradient>
        <linearGradient id="fo-polo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="fo-pelo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b3d2b" />
          <stop offset="1" stopColor="#2e1d13" />
        </linearGradient>
        <linearGradient id="fo-cartel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
        <radialGradient id="fo-sombra">
          <stop offset="0" stopColor="#000" stopOpacity=".38" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <style>{`
        .fo-salto { transform-box: view-box; transform-origin: 32px 88px; animation: fo-salto 5s ease-in-out infinite; }
        .fo-respira { transform-box: view-box; transform-origin: 32px 88px; animation: fo-respira 1.8s ease-in-out infinite; }
        .fo-cartel { transform-box: view-box; transform-origin: 32px 49px; animation: fo-cartel 5s ease-in-out infinite; }
        .fo-letrero { animation: fo-letrero 5s ease-in-out infinite; }
        .fo-zapato { animation: fo-zapato 5s ease-in-out infinite; }
        .fo-sombra { transform-box: fill-box; transform-origin: 50% 50%; animation: fo-sombra 5s ease-in-out infinite; }
        /* Todo el cuerpo: se agacha (impulso), sube, flota un instante, cae amortiguando y da un saltito más */
        @keyframes fo-salto {
          0%, 50%, 80%, 100% { translate: 0 0; scale: 1 1; }
          54% { translate: 0 2.2px; scale: 1.04 .94; }
          58% { translate: 0 -11px; scale: .97 1.04; }
          62% { translate: 0 -11px; scale: 1 1; }
          66% { translate: 0 1.6px; scale: 1.04 .95; }
          69% { translate: 0 0; scale: 1 1; }
          72% { translate: 0 -6px; scale: .98 1.02; }
          76% { translate: 0 1px; scale: 1.03 .97; }
        }
        @keyframes fo-respira { 0%, 100% { scale: 1 1; } 50% { scale: 1.012 .988; } }
        /* El cartel sube y baja con las manos (sigue a los brazos) */
        @keyframes fo-letrero { 0%, 50%, 69%, 80%, 100% { translate: 0 0; } 54% { translate: 0 3px; } 58%, 62% { translate: 0 -3px; } 66% { translate: 0 2px; } 72% { translate: 0 -1.5px; } 76% { translate: 0 1.5px; } }
        @keyframes fo-cartel {
          0%, 25%, 50%, 100% { rotate: -2deg; } 12.5%, 37.5% { rotate: 2deg; }
          56% { rotate: -5deg; } 60% { rotate: 7deg; } 64% { rotate: -7deg; } 68% { rotate: 6deg; }
          72% { rotate: -5deg; } 76% { rotate: 3deg; } 80% { rotate: -2deg; } 88% { rotate: 1.5deg; }
        }
        /* Las zapatillas siguen al pie cuando la rodilla se dobla */
        @keyframes fo-zapato { 0%, 50%, 69%, 80%, 100% { translate: 0 0; } 54% { translate: 0 -1.5px; } 58%, 62% { translate: .5px -5px; } 66% { translate: 0 -1px; } 72% { translate: .3px -2.5px; } 76% { translate: 0 -.8px; } }
        @keyframes fo-sombra { 0%, 54%, 66%, 70%, 76%, 100% { scale: 1 1; opacity: 1; } 58%, 62% { scale: .6 .6; opacity: .45; } 72% { scale: .8 .8; opacity: .7; } }

        /* Cara: ojos normales (con parpadeo) o felices (^ ^), cejas que suben y boca abierta durante la alegría */
        .fo-normal { animation: fo-ver-normal 5s step-end infinite; }
        .fo-feliz { animation: fo-ver-feliz 5s step-end infinite; }
        .fo-ojos { transform-box: fill-box; transform-origin: 50% 50%; animation: fo-parpadeo 5s ease-in-out infinite; }
        .fo-cejas { animation: fo-cejas 5s ease-in-out infinite; }
        @keyframes fo-ver-normal { 0% { opacity: 1; } 54% { opacity: 0; } 82% { opacity: 1; } }
        @keyframes fo-ver-feliz { 0% { opacity: 0; } 54% { opacity: 1; } 82% { opacity: 0; } }
        @keyframes fo-parpadeo { 0%, 22%, 28%, 88%, 96%, 100% { scale: 1 1; } 25% { scale: 1 .1; } 91%, 93% { scale: 1 .1; } }
        @keyframes fo-cejas { 0%, 50%, 84%, 100% { translate: 0 0; } 55%, 80% { translate: 0 -1.4px; } }

        .fo-brillo { transform-box: fill-box; transform-origin: 50% 50%; animation: fo-brillo 5s ease-out infinite; }
        .fo-brillo-2 { animation-delay: .15s; }
        .fo-brillo-3 { animation-delay: .3s; }
        @keyframes fo-brillo { 0%, 55%, 82%, 100% { opacity: 0; scale: 0; rotate: 0deg; } 59% { opacity: 1; scale: 1.1; } 66% { opacity: 1; scale: .7; } 72% { opacity: 1; scale: 1; rotate: 90deg; } 80% { opacity: 0; scale: .4; } }

        @media (prefers-reduced-motion: reduce) {
          .fo-salto, .fo-respira, .fo-cartel, .fo-letrero, .fo-zapato, .fo-sombra, .fo-normal, .fo-feliz, .fo-ojos, .fo-cejas, .fo-brillo { animation: none; }
          .fo-feliz, .fo-brillo { opacity: 0; }
        }
      `}</style>

      <ellipse className="fo-sombra" cx="32" cy="90.5" rx="15" ry="3.5" fill="url(#fo-sombra)" />

      <g className="fo-salto">
        <g className="fo-respira">
          {/* Piernas con rodilla y zapatillas con suela */}
          <Pierna />
          <Pierna derecha />
          {[
            { x: 27, punta: -1 },
            { x: 37, punta: 1 },
          ].map(({ x, punta }) => (
            <g key={x} className="fo-zapato">
              <path d={`M${x - 5} 87.5 q${punta < 0 ? 0 : 0.5} -3.4 ${punta < 0 ? 4.5 : 5} -3.4 q4.5 0 ${punta < 0 ? 5 : 4.5} 3.4 z`} fill="#f8fafc" stroke="#cbd5e1" strokeWidth=".5" />
              <rect x={x - 5.3} y="87" width="10.6" height="1.8" rx=".9" fill="#dc2626" />
            </g>
          ))}

          {/* Polo con cuello */}
          <path d="M22 64 V51 q0 -5 5 -5 h10 q5 0 5 5 V64 q-10 2.5 -20 0 z" fill="url(#fo-polo)" />
          <path d="M28.5 46 l3.5 3.5 3.5 -3.5" stroke="#d97706" strokeWidth="1" fill="none" strokeLinejoin="round" />

          {/* Cuello y cabeza con orejas, pelo con brillo y mejillas */}
          <rect x="29.5" y="43" width="5" height="4" fill="#e4a77c" />
          <ellipse cx="22.8" cy="37.5" rx="1.8" ry="2.4" fill="#e9b48c" />
          <ellipse cx="41.2" cy="37.5" rx="1.8" ry="2.4" fill="#e9b48c" />
          {/* Cara ovalada: frente ancha y mentón más angosto */}
          <path d="M23.4 34.5 q0 -8 8.6 -8 q8.6 0 8.6 8 v2.6 q0 4.6 -3 6.6 q-2.6 1.9 -5.6 1.9 q-3 0 -5.6 -1.9 q-3 -2 -3 -6.6 z" fill="url(#fo-piel)" />
          {/* Pelo abundante con volumen arriba, patillas a los lados y flequillo en mechones */}
          <path
            d="M22.4 38 q-2.6 -8.5 .6 -13.5 q3.2 -5.2 9 -5.2 q6.4 0 9.4 4.6 q3 4.8 .2 14.1 q-.6 -4.6 -2.4 -6.6 q-1.8 2.6 -5.8 2.8 q1.6 -1 2 -2.8 q-3.4 2.4 -8.2 2.2 q1.4 -.8 1.8 -2.1 q-3.6 1.4 -5.4 4.9 q-.6 1.4 -1.2 3.6 z"
            fill="url(#fo-pelo)"
          />
          <path d="M26 24.2 q3.4 -2.4 7.6 -1.6 M35.5 23.4 q2 .6 3.2 2" stroke="#8b5e3c" strokeWidth="1" strokeLinecap="round" fill="none" />
          <ellipse cx="26.4" cy="40.3" rx="1.9" ry="1.2" fill="#f472b6" opacity=".4" />
          <ellipse cx="37.6" cy="40.3" rx="1.9" ry="1.2" fill="#f472b6" opacity=".4" />

          <path className="fo-cejas" d="M26.8 33.2 q1.8 -1 3.4 0 M33.8 33.2 q1.8 -1 3.4 0" stroke="#3b2a20" strokeWidth=".9" strokeLinecap="round" fill="none" />
          <g className="fo-normal">
            <g className="fo-ojos">
              {[28.6, 35.4].map((x) => (
                <g key={x}>
                  <ellipse cx={x} cy="36.6" rx="1.6" ry="1.9" fill="#fff" />
                  <circle cx={x + 0.2} cy="36.9" r="1.05" fill="#1f2937" />
                  <circle cx={x + 0.55} cy="36.4" r=".38" fill="#fff" />
                </g>
              ))}
            </g>
            <path d="M29 40.6 q3 2.6 6 0" stroke="#7c2d12" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </g>
          <g className="fo-feliz">
            <path d="M27 37.2 q1.6 -2.3 3.2 0 M33.8 37.2 q1.6 -2.3 3.2 0" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M28.6 39.9 q3.4 .4 6.8 0 q-.5 4.3 -3.4 4.3 q-2.9 0 -3.4 -4.3 z" fill="#7c2d12" />
            <path d="M30.2 42.9 q1.8 -1.2 3.6 0 q-.8 1.2 -1.8 1.2 q-1 0 -1.8 -1.2 z" fill="#f87171" />
          </g>

          {/* Brazos con codo (manga del polo + antebrazo) y el cartel en las manos */}
          <g className="fo-cartel">
            <Brazo />
            <Brazo derecho />
            <g className="fo-letrero">
              <rect x="9" y="-.5" width="46" height="20" rx="4" fill="url(#fo-cartel)" stroke="#fff" strokeWidth="1.6" />
              <rect x="11" y="1.5" width="42" height="5" rx="2.5" fill="#fff" opacity=".18" />
              <text x="32" y="15" textAnchor="middle" fontSize="15" fontWeight="900" fill="#fff" fontFamily="inherit">
                -%
              </text>
              {/* Manos agarrando el borde de abajo del cartel */}
              {[16, 48].map((x) => (
                <g key={x}>
                  <ellipse cx={x} cy="19.5" rx="3.1" ry="3.4" fill="url(#fo-piel)" />
                  <path d={`M${x - 1.6} 17.5 v-1.6 M${x} 17.1 v-1.8 M${x + 1.6} 17.5 v-1.6`} stroke="#e4a77c" strokeWidth="1.3" strokeLinecap="round" />
                </g>
              ))}
            </g>
          </g>
        </g>
      </g>

      {/* Brillitos */}
      {[
        { clase: "", d: "M5 8 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 z" },
        { clase: "fo-brillo-2", d: "M59 6 l1 2.3 2.3 1 -2.3 1 -1 2.3 -1 -2.3 -2.3 -1 2.3 -1 z" },
        { clase: "fo-brillo-3", d: "M58 30 l.9 2 2 .9 -2 .9 -.9 2 -.9 -2 -2 -.9 2 -.9 z" },
      ].map(({ clase, d }) => (
        <path key={d} className={`fo-brillo ${clase}`} d={d} fill="#fde047" />
      ))}
    </svg>
  );
}
