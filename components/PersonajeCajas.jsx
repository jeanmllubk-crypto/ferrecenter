// Personaje animado de frente que apenas puede con una torre de cajas (solo SVG + CSS, sin imágenes).
// Ciclo de 6 s: está casi quieto (tambaleo mínimo, respira con esfuerzo, parpadea normal);
// de pronto la torre se le va de lado a lado: dobla las rodillas, aprieta los codos, abre los
// ojos de susto, sigue las cajas con la mirada, suda y da pasitos para no caerse; se recupera
// poco a poco, suelta el aire y hace un parpadeo lento de alivio.
// Brazos y piernas tienen codo y rodilla: se animan cambiando su trazo (SMIL), sincronizados con el CSS.
const CICLO = "6s";
const TIEMPOS = "0;0.46;0.52;0.83;0.9;1";
const SUAVE = "0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1";

// Trazo que pasa de "relajado" a "esfuerzo" y vuelve, en el mismo ritmo que el tambaleo
function Extremidad({ relajado, esfuerzo, ...props }) {
  return (
    <path d={relajado} fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <animate
        attributeName="d"
        dur={CICLO}
        repeatCount="indefinite"
        calcMode="spline"
        keyTimes={TIEMPOS}
        keySplines={SUAVE}
        values={[relajado, relajado, esfuerzo, esfuerzo, relajado, relajado].join(";")}
      />
    </path>
  );
}

// Caja con volumen: degradado, borde gastado, solapa marcada y cinta con brillo
function Caja({ x, y, w, h, tono = "a", cinta, solapa = true }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="1.2" fill={`url(#fc-carton-${tono})`} stroke="#8a6644" strokeWidth=".8" />
      <rect x={x + 0.6} y={y + h - 3} width={w - 1.2} height="2.4" rx="1" fill="#000" opacity=".08" />
      {solapa && <path d={`M${x + 1} ${y + 2.2} H${x + w - 1}`} stroke="#8a6644" strokeWidth=".5" opacity=".6" />}
      {cinta && <rect x={cinta[0]} y={y} width={cinta[1]} height={h} fill="url(#fc-cinta)" opacity=".95" />}
    </g>
  );
}

export default function PersonajeCajas({ className = "h-24 w-16" }) {
  return (
    <svg viewBox="0 0 64 96" className={className} overflow="visible" aria-hidden="true">
      <defs>
        <linearGradient id="fc-carton-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcb892" />
          <stop offset="1" stopColor="#b98d64" />
        </linearGradient>
        <linearGradient id="fc-carton-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfa57c" />
          <stop offset="1" stopColor="#a87e57" />
        </linearGradient>
        <linearGradient id="fc-carton-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3c29f" />
          <stop offset="1" stopColor="#c39a72" />
        </linearGradient>
        <linearGradient id="fc-cinta" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9cf78" />
          <stop offset=".5" stopColor="#f8ecb8" />
          <stop offset="1" stopColor="#e2c66c" />
        </linearGradient>
        <linearGradient id="fc-polo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
        <radialGradient id="fc-mano" cx=".35" cy=".35" r=".7">
          <stop offset="0" stopColor="#fbbf8a" />
          <stop offset="1" stopColor="#e08a4f" />
        </radialGradient>
        <radialGradient id="fc-sombra">
          <stop offset="0" stopColor="#000" stopOpacity=".38" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <style>{`
        /* Tambaleo: la misma curva para cada nivel de la torre, con distinta fuerza (--a) y un leve retraso */
        .fc-nivel { transform-box: fill-box; transform-origin: 50% 100%; animation: fc-tambaleo 6s ease-in-out infinite; }
        .fc-pila { --a: .3; }
        .fc-medio { --a: .75; animation-delay: -5.92s; }
        .fc-tope { --a: 1.5; animation-delay: -5.85s; }
        .fc-tope-2 { --a: 1.7; animation-delay: -5.8s; }
        /* El cuerpo se inclina al lado contrario para compensar, respira con esfuerzo y se agacha al pelear con el peso */
        .fc-cuerpo { --a: -.25; transform-box: view-box; transform-origin: 32px 88px;
          animation: fc-tambaleo 6s ease-in-out infinite, fc-peso 1.6s ease-in-out infinite, fc-agacharse 6s ease-in-out infinite; }
        @keyframes fc-tambaleo {
          0%, 20%, 40% { rotate: calc(var(--a) * -1deg); }
          10%, 30% { rotate: calc(var(--a) * 1deg); }
          47% { rotate: calc(var(--a) * 2deg); }
          53% { rotate: calc(var(--a) * -9deg); }
          58% { rotate: calc(var(--a) * 13deg); }
          63% { rotate: calc(var(--a) * -15deg); }
          68% { rotate: calc(var(--a) * 12deg); }
          73% { rotate: calc(var(--a) * -9deg); }
          78% { rotate: calc(var(--a) * 6deg); }
          83% { rotate: calc(var(--a) * -3.5deg); }
          88% { rotate: calc(var(--a) * 1.8deg); }
          94%, 100% { rotate: calc(var(--a) * -1deg); }
        }
        @keyframes fc-peso { 0%, 100% { scale: 1 1; } 50% { scale: 1.02 .975; } }
        /* Al final suelta el aire: sube un poco y vuelve a bajar */
        @keyframes fc-agacharse { 0%, 46%, 83%, 100% { translate: 0 0; } 52%, 80% { translate: 0 1.4px; } 88% { translate: 0 -.8px; } 92% { translate: 0 .3px; } }

        /* Pies: tiemblan siempre un poquito y dan pasitos cortos cuando la torre se mueve */
        .fc-pie-i { animation: fc-pasito-i 6s ease-in-out infinite; }
        .fc-pie-d { animation: fc-pasito-d 6s ease-in-out infinite; }
        .fc-temblor { animation: fc-temblor .18s linear infinite; }
        @keyframes fc-pasito-i { 0%, 56%, 64%, 70%, 78%, 100% { translate: 0 0; } 60% { translate: 1.5px -3px; } 74% { translate: -1.5px -2.5px; } }
        @keyframes fc-pasito-d { 0%, 62%, 70%, 76%, 84%, 100% { translate: 0 0; } 66% { translate: -1.5px -3px; } 80% { translate: 1.5px -2px; } }
        @keyframes fc-temblor { 0%, 100% { translate: 0 0; } 50% { translate: .25px 0; } }

        /* Manos: aprietan la caja mientras pelea con el peso */
        .fc-mano { transform-box: fill-box; transform-origin: 50% 50%; animation: fc-apretar 6s ease-in-out infinite; }
        @keyframes fc-apretar { 0%, 46%, 86%, 100% { scale: 1 1; } 52%, 82% { scale: .88 1.08; } }

        /* Ojos: normales y parpadeando; se agrandan del susto mientras la torre se tambalea */
        .fc-ojo { transform-box: fill-box; transform-origin: 50% 50%; animation: fc-ojo 6s ease-in-out infinite; }
        .fc-pupila { animation: fc-mirada 6s ease-in-out infinite; }
        @keyframes fc-ojo {
          0%, 17%, 23%, 49%, 87%, 90%, 96%, 100% { scale: 1 1; }
          20% { scale: 1 .1; }
          52%, 84% { scale: 1.3 1.3; }
          92%, 94% { scale: 1 .1; }
        }
        @keyframes fc-mirada {
          0%, 48%, 88%, 100% { translate: 0 0; }
          53% { translate: -.7px -.5px; } 58% { translate: .8px -.6px; } 63% { translate: -.9px -.6px; }
          68% { translate: .8px -.5px; } 73% { translate: -.6px -.4px; } 78% { translate: .4px -.3px; }
        }
        .fc-sudor { animation: fc-sudor 6s ease-in infinite; }
        @keyframes fc-sudor { 0%, 55% { opacity: 0; translate: 0 0; } 60% { opacity: 1; translate: 0 0; } 80% { opacity: 1; translate: 0 5px; } 86%, 100% { opacity: 0; translate: 0 7px; } }

        @media (prefers-reduced-motion: reduce) {
          .fc-nivel, .fc-cuerpo, .fc-pie-i, .fc-pie-d, .fc-temblor, .fc-mano, .fc-ojo, .fc-pupila { animation: none; }
          .fc-sudor { animation: none; opacity: 0; }
        }
      `}</style>

      <ellipse cx="32" cy="90.5" rx="17" ry="3.5" fill="url(#fc-sombra)" />

      <g className="fc-temblor">
        {/* Piernas con rodilla: se doblan hacia afuera cuando carga con todo el peso */}
        <g className="fc-pie-i">
          <Extremidad relajado="M27 62 L27 74.5 L26.5 85" esfuerzo="M27 62 L24.4 74 L26.3 85" stroke="#14b8a6" strokeWidth="6.5" />
          <path d="M21.5 87.5 q0 -3.2 4.5 -3.2 q4.5 0 5 3.2 z" fill="#f97316" />
          <rect x="21.2" y="87" width="10" height="1.8" rx=".9" fill="#fff" />
        </g>
        <g className="fc-pie-d">
          <Extremidad relajado="M37 62 L37 74.5 L37.5 85" esfuerzo="M37 62 L39.6 74 L37.7 85" stroke="#0d9488" strokeWidth="6.5" />
          <path d="M33 87.5 q.5 -3.2 5 -3.2 q4.5 0 4.5 3.2 z" fill="#f97316" />
          <rect x="32.8" y="87" width="10" height="1.8" rx=".9" fill="#fff" />
        </g>
      </g>

      <g className="fc-cuerpo">
        {/* Torso */}
        <path d="M21 65 V59 q0 -4 4 -4 h14 q4 0 4 4 V65 z" fill="url(#fc-polo)" />
        <path d="M27 55 q5 3 10 0" stroke="#1e3a8a" strokeWidth=".8" fill="none" />

        {/* Brazos con codo: los codos se cierran y suben cuando hace fuerza */}
        <Extremidad relajado="M24 59 L9.2 56.5 L11.2 47" esfuerzo="M24 58 L10.4 53 L11.6 47.5" stroke="#1d4ed8" strokeWidth="5" />
        <Extremidad relajado="M40 59 L54.8 56.5 L52.8 47" esfuerzo="M40 58 L53.6 53 L52.4 47.5" stroke="#1d4ed8" strokeWidth="5" />

        <g className="fc-nivel fc-pila">
          <Caja x={12} y={30} w={40} h={30} solapa={false} />
          {/* Flechas de "este lado arriba" impresas en la caja */}
          <path d="M44 51 v-4 m-1.3 1.3 l1.3 -1.3 1.3 1.3 M48 51 v-4 m-1.3 1.3 l1.3 -1.3 1.3 1.3" stroke="#6b4a2e" strokeWidth=".8" fill="none" opacity=".75" />
          <rect x="24.5" y="35.5" width="15" height="11" rx="1.8" fill="#111827" />
          <rect x="24.5" y="35.5" width="15" height="2" rx="1" fill="#000" opacity=".35" />
          {[29.5, 34.5].map((x) => (
            <g key={x} className="fc-ojo">
              <circle cx={x} cy="41" r="2.1" fill="#fff" />
              <g className="fc-pupila">
                <circle cx={x + 0.2} cy="41.4" r="1" fill="#111" />
                <circle cx={x + 0.55} cy="41" r=".35" fill="#fff" />
              </g>
            </g>
          ))}
          <path className="fc-sudor" d="M41.5 35 q1.4 2 1.4 3 a1.4 1.4 0 0 1 -2.8 0 q0 -1 1.4 -3 z" fill="#bfdbfe" stroke="#3b82f6" strokeWidth=".4" />
          <rect x="14" y="51" width="8" height="3" fill="url(#fc-cinta)" />

          <g className="fc-nivel fc-medio">
            <Caja x={8} y={17} w={26} h={14} tono="b" cinta={[18, 4]} />
            <Caja x={32} y={14} w={23} h={17} tono="c" />
            <rect x="44" y="20" width="8" height="3" fill="url(#fc-cinta)" />
            <g className="fc-nivel fc-tope">
              <Caja x={15} y={4} w={18} h={13} cinta={[22, 4]} />
            </g>
            <g className="fc-nivel fc-tope-2">
              <Caja x={36} y={2} w={15} h={12} tono="b" />
            </g>
          </g>
        </g>

        {/* Manos agarrando los costados de la caja grande (dedos sobre el borde) */}
        {[11.5, 52.5].map((x) => (
          <g key={x} className="fc-mano">
            <ellipse cx={x} cy="46.5" rx="3.2" ry="3.6" fill="url(#fc-mano)" />
            <path d={x < 32 ? `M${x + 1.5} 44.5 h2 M${x + 1.5} 46.5 h2 M${x + 1.5} 48.5 h2` : `M${x - 1.5} 44.5 h-2 M${x - 1.5} 46.5 h-2 M${x - 1.5} 48.5 h-2`} stroke="#d97f45" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  );
}
