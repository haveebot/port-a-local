export default function CrashingWaves() {
  return (
    <div className="waves-stage" aria-hidden="true">
      <svg viewBox="0 0 2880 180" preserveAspectRatio="none" className="wave-back">
        <path
          fill="#1e3a63"
          d="M0,120 C240,90 480,150 720,120 C960,90 1200,150 1440,120 C1680,90 1920,150 2160,120 C2400,90 2640,150 2880,120 L2880,180 L0,180 Z"
        />
      </svg>
      <svg viewBox="0 0 2880 180" preserveAspectRatio="none" className="wave-mid">
        <path
          fill="#2a4d7a"
          d="M0,140 C180,110 360,170 540,140 C720,110 900,170 1080,140 C1260,110 1440,170 1620,140 C1800,110 1980,170 2160,140 C2340,110 2520,170 2700,140 C2790,125 2835,150 2880,140 L2880,180 L0,180 Z"
        />
      </svg>
      <svg viewBox="0 0 2880 180" preserveAspectRatio="none" className="wave-front">
        <path
          fill="#3a6597"
          d="M0,150 C120,125 240,175 360,150 C480,125 600,175 720,150 C840,125 960,175 1080,150 C1200,125 1320,175 1440,150 C1560,125 1680,175 1800,150 C1920,125 2040,175 2160,150 C2280,125 2400,175 2520,150 C2640,125 2760,175 2880,150 L2880,180 L0,180 Z"
        />
      </svg>
      <svg viewBox="0 0 2880 180" preserveAspectRatio="none" className="wave-foam">
        <path
          fill="none"
          stroke="#f08589"
          strokeWidth="1.2"
          strokeOpacity="0.55"
          d="M0,151 C120,126 240,176 360,151 C480,126 600,176 720,151 C840,126 960,176 1080,151 C1200,126 1320,176 1440,151 C1560,126 1680,176 1800,151 C1920,126 2040,176 2160,151 C2280,126 2400,176 2520,151 C2640,126 2760,176 2880,151"
        />
        <path
          fill="none"
          stroke="#f5d29a"
          strokeWidth="0.7"
          strokeOpacity="0.45"
          d="M0,156 C120,131 240,181 360,156 C480,131 600,181 720,156 C840,131 960,181 1080,156 C1200,131 1320,181 1440,156 C1560,131 1680,181 1800,156 C1920,131 2040,181 2160,156 C2280,131 2400,181 2520,156 C2640,131 2760,181 2880,156"
        />
      </svg>
    </div>
  );
}
