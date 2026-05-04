<div align="center">

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- ║  MAUREONIX V6.0.0 — CYBERNETIC EDITION README              ║ -->
<!-- ║  FUTURE TECHNOLOGY • NEON AESTHETIC • SCANLINE INTERFACE   ║ -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<!-- BACKGROUND SCANLINE OVERLAY -->
<svg width="100%" height="100%" style="position:fixed;top:0;left:0;pointer-events:none;z-index:9999;opacity:0.08;mix-blend-mode:overlay;">
  <defs>
    <pattern id="scanlinePattern" x="0" y="0" width="100%" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="100%" height="2" fill="#00f3ff"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#scanlinePattern)"/>
</svg>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                         ANIMATED HERO HEADER                        ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->
<svg width="100%" height="420" viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Neon Gradients -->
    <linearGradient id="neonCyanMagenta" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00f3ff;stop-opacity:1" />
      <stop offset="25%" style="stop-color:#bc13fe;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ff00ff;stop-opacity:1" />
      <stop offset="75%" style="stop-color:#bc13fe;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00f3ff;stop-opacity:1" />
    </linearGradient>

    <linearGradient id="greenNeon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00ff9d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00f3ff;stop-opacity:1" />
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Intense Glow -->
    <filter id="intenseGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="8" result="blur1"/>
      <feGaussianBlur stdDeviation="15" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Holographic Flicker Filter -->
    <filter id="holoFlicker" x="-20%" y="-20%" width="140%" height="140%">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="colormatrix"/>
      <feComponentTransfer in="colormatrix" result="componentTransfer">
        <feFuncR type="linear" slope="1.2" intercept="0"/>
        <feFuncG type="linear" slope="1.1" intercept="0"/>
        <feFuncB type="linear" slope="1.3" intercept="0"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="componentTransfer"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Scanline Pattern -->
    <pattern id="heroScanlines" x="0" y="0" width="100%" height="6" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="100%" height="1.5" fill="#000" opacity="0.6"/>
      <rect x="0" y="3" width="100%" height="0.5" fill="#00f3ff" opacity="0.15"/>
    </pattern>

    <!-- Circular Clip for Fox -->
    <clipPath id="foxClip">
      <circle cx="450" cy="85" r="55"/>
    </clipPath>

    <!-- Holographic Gradient for Ring -->
    <linearGradient id="holoRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00f3ff"/>
      <stop offset="50%" style="stop-color:#ff00ff"/>
      <stop offset="100%" style="stop-color:#00f3ff"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#050508" rx="15"/>
  <rect width="100%" height="100%" fill="url(#heroScanlines)" rx="15"/>

  <!-- Decorative Corner Lines -->
  <path d="M 20 60 L 20 20 L 60 20" stroke="#00f3ff" stroke-width="2" fill="none" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 840 20 L 880 20 L 880 60" stroke="#ff00ff" stroke-width="2" fill="none" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" begin="1.5s" repeatCount="indefinite"/>
  </path>
  <path d="M 20 360 L 20 400 L 60 400" stroke="#ff00ff" stroke-width="2" fill="none" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" begin="0.75s" repeatCount="indefinite"/>
  </path>
  <path d="M 840 400 L 880 400 L 880 360" stroke="#00f3ff" stroke-width="2" fill="none" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" begin="2.25s" repeatCount="indefinite"/>
  </path>

  <!-- ═══════════════════════════════════════════════════════ -->
  <!-- HOLOGRAPHIC FOX AVATAR                                -->
  <!-- ═══════════════════════════════════════════════════════ -->

  <!-- Outer Pulsing Neon Ring -->
  <circle cx="450" cy="85" r="62" fill="none" stroke="url(#holoRing)" stroke-width="3" filter="url(#neonGlow)">
    <animate attributeName="r" values="62;65;62" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="stroke-width" values="3;5;3" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite"/>
  </circle>

  <!-- Secondary Ring (counter-rotate effect) -->
  <circle cx="450" cy="85" r="58" fill="none" stroke="#00ff9d" stroke-width="1.5" opacity="0.6" filter="url(#neonGlow)">
    <animate attributeName="r" values="58;60;58" dur="2s" begin="0.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
  </circle>

  <!-- Holographic Base Circle -->
  <circle cx="450" cy="85" r="55" fill="#0a0a1a" stroke="#00f3ff" stroke-width="1" opacity="0.8"/>

  <!-- Fox Image with Holographic Filter -->
  <image href="https://i.ibb.co/XxBRdtX5/file-00000000794471f59c85b7470fc01298.png" x="395" y="30" width="110" height="110" clip-path="url(#foxClip)" filter="url(#holoFlicker)" preserveAspectRatio="xMidYMid slice">
    <!-- Holographic Flicker Animation -->
    <animate attributeName="opacity" values="1;0.85;1;0.9;1;0.8;1" keyTimes="0;0.1;0.2;0.5;0.7;0.85;1" dur="4s" repeatCount="indefinite"/>
  </image>

  <!-- Scanline Overlay on Fox -->
  <rect x="395" y="30" width="110" height="110" clip-path="url(#foxClip)" fill="url(#heroScanlines)" opacity="0.3">
    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite"/>
  </rect>

  <!-- Holographic Glitch Lines (random horizontal lines) -->
  <line x1="400" y1="55" x2="500" y2="55" stroke="#00f3ff" stroke-width="1" opacity="0" clip-path="url(#foxClip)">
    <animate attributeName="opacity" values="0;0.6;0" dur="5s" begin="1s" repeatCount="indefinite"/>
    <animate attributeName="y1" values="55;75;55" dur="5s" begin="1s" repeatCount="indefinite"/>
    <animate attributeName="y2" values="55;75;55" dur="5s" begin="1s" repeatCount="indefinite"/>
  </line>
  <line x1="400" y1="95" x2="500" y2="95" stroke="#ff00ff" stroke-width="1" opacity="0" clip-path="url(#foxClip)">
    <animate attributeName="opacity" values="0;0.5;0" dur="4s" begin="2s" repeatCount="indefinite"/>
    <animate attributeName="y1" values="95;60;95" dur="4s" begin="2s" repeatCount="indefinite"/>
    <animate attributeName="y2" values="95;60;95" dur="4s" begin="2s" repeatCount="indefinite"/>
  </line>

  <!-- Corner Brackets on Avatar -->
  <path d="M 420 40 L 420 30 L 430 30" stroke="#00f3ff" stroke-width="2" fill="none" opacity="0.9">
    <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite"/>
  </path>
  <path d="M 480 30 L 490 30 L 490 40" stroke="#ff00ff" stroke-width="2" fill="none" opacity="0.9">
    <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" begin="0.5s" repeatCount="indefinite"/>
  </path>
  <path d="M 420 130 L 420 140 L 430 140" stroke="#ff00ff" stroke-width="2" fill="none" opacity="0.9">
    <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" begin="1s" repeatCount="indefinite"/>
  </path>
  <path d="M 480 140 L 490 140 L 490 130" stroke="#00f3ff" stroke-width="2" fill="none" opacity="0.9">
    <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" begin="1.5s" repeatCount="indefinite"/>
  </path>

  <!-- ═══════════════════════════════════════════════════════ -->
  <!-- TYPEWRITER ANIMATION: MAUREONIX -->
  <!-- ═══════════════════════════════════════════════════════ -->
  <text x="450" y="210" text-anchor="middle" font-family="'Courier New', 'Consolas', monospace" font-size="62" font-weight="900" fill="url(#neonCyanMagenta)" filter="url(#intenseGlow)" style="letter-spacing:8px;">
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" repeatCount="indefinite" />
      M
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" begin="0.08s" repeatCount="indefinite" />
      A
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" begin="0.16s" repeatCount="indefinite" />
      U
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" begin="0.24s" repeatCount="indefinite" />
      R
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" begin="0.32s" repeatCount="indefinite" />
      E
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" begin="0.40s" repeatCount="indefinite" />
      O
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" begin="0.48s" repeatCount="indefinite" />
      N
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" begin="0.56s" repeatCount="indefinite" />
      I
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0;0;0;0;0;0" keyTimes="0;0.05;0.3;0.35;0.36;0.37;0.38;0.39;0.4;0.41;0.42;1" dur="10s" begin="0.64s" repeatCount="indefinite" />
      X
    </tspan>
  </text>

  <!-- Blinking Cursor -->
  <rect x="640" y="165" width="18" height="50" fill="#00ff9d" filter="url(#neonGlow)" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.64;0.66;0.72;0.74;0.76;0.78;0.8;0.82;0.84;0.86;1" dur="10s" repeatCount="indefinite"/>
  </rect>

  <!-- ═══════════════════════════════════════════════════════ -->
  <!-- TYPEWRITER ANIMATION: CYCLING SUBTITLES -->
  <!-- ═══════════════════════════════════════════════════════ -->

  <!-- Subtitle 1: WHATSAPP BOT -->
  <text x="450" y="265" text-anchor="middle" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#00ff9d" filter="url(#neonGlow)" style="letter-spacing:4px;">
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" repeatCount="indefinite" />
      W
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.05s" repeatCount="indefinite" />
      H
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.10s" repeatCount="indefinite" />
      A
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.15s" repeatCount="indefinite" />
      T
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.20s" repeatCount="indefinite" />
      S
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.25s" repeatCount="indefinite" />
      A
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.30s" repeatCount="indefinite" />
      P
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.35s" repeatCount="indefinite" />
      P
    </tspan>
    <tspan opacity="0" dx="10">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.40s" repeatCount="indefinite" />
      B
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.45s" repeatCount="indefinite" />
      O
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0;0;0;0;0;0;0" keyTimes="0;0.35;0.40;0.55;0.60;0.61;0.62;0.63;0.64;0.65;0.66;1" dur="10s" begin="0.50s" repeatCount="indefinite" />
      T
    </tspan>
  </text>

  <!-- Subtitle 2: BY INFINITE VYBEFLIX -->
  <text x="450" y="265" text-anchor="middle" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#ff00ff" filter="url(#neonGlow)" style="letter-spacing:3px;">
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" repeatCount="indefinite" />
      B
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.05s" repeatCount="indefinite" />
      Y
    </tspan>
    <tspan opacity="0" dx="12">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.10s" repeatCount="indefinite" />
      I
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.15s" repeatCount="indefinite" />
      N
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.20s" repeatCount="indefinite" />
      F
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.25s" repeatCount="indefinite" />
      I
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.30s" repeatCount="indefinite" />
      N
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.35s" repeatCount="indefinite" />
      I
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.40s" repeatCount="indefinite" />
      T
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.45s" repeatCount="indefinite" />
      E
    </tspan>
    <tspan opacity="0" dx="12">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.50s" repeatCount="indefinite" />
      V
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.55s" repeatCount="indefinite" />
      Y
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.60s" repeatCount="indefinite" />
      B
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.65s" repeatCount="indefinite" />
      E
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.70s" repeatCount="indefinite" />
      F
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.75s" repeatCount="indefinite" />
      L
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.80s" repeatCount="indefinite" />
      I
    </tspan>
    <tspan opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;1;1;0;0;0;0;0;0" keyTimes="0;0.60;0.61;0.62;0.67;0.82;0.87;0.88;0.89;0.90;0.91;1" dur="10s" begin="0.85s" repeatCount="indefinite" />
      X
    </tspan>
  </text>

  <!-- Version Badge -->
  <rect x="340" y="300" width="220" height="40" rx="20" fill="none" stroke="url(#neonCyanMagenta)" stroke-width="2" filter="url(#neonGlow)">
    <animate attributeName="stroke-width" values="2;4;2" dur="2s" repeatCount="indefinite"/>
  </rect>
  <text x="450" y="327" text-anchor="middle" font-family="'Courier New', monospace" font-size="18" font-weight="bold" fill="#00f3ff" filter="url(#neonGlow)" style="letter-spacing:3px;">
    ⚡ V6.0.0 CYBERNETIC ⚡
  </text>

  <!-- Status Indicator -->
  <circle cx="280" cy="320" r="6" fill="#00ff9d" filter="url(#neonGlow)">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <text x="295" y="325" font-family="'Courier New', monospace" font-size="12" fill="#00ff9d" opacity="0.9">SYSTEM ONLINE</text>

  <circle cx="620" cy="320" r="6" fill="#ff00ff" filter="url(#neonGlow)">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" begin="0.75s" repeatCount="indefinite"/>
  </circle>
  <text x="635" y="325" font-family="'Courier New', monospace" font-size="12" fill="#ff00ff" opacity="0.9">NEURAL LINK ACTIVE</text>
</svg>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                     NEON BADGE MATRIX                               ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin:15px 0;">
  <img src="https://img.shields.io/badge/Version-6.0.0-ff00ff?style=for-the-badge&logo=rocket&logoColor=white&labelColor=0a0a0f" alt="Version"/>
  <img src="https://img.shields.io/badge/Node.js-20+-00f3ff?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=0a0a0f" alt="Node"/>
  <img src="https://img.shields.io/badge/License-MIT-00ff9d?style=for-the-badge&logo=opensourceinitiative&logoColor=white&labelColor=0a0a0f" alt="License"/>
  <img src="https://img.shields.io/badge/Platform-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white&labelColor=0a0a0f" alt="WhatsApp"/>
  <img src="https://img.shields.io/badge/Engine-Baileys-bc13fe?style=for-the-badge&logo=whatsapp&logoColor=white&labelColor=0a0a0f" alt="Baileys"/>
</div>

<div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
  <img src="https://img.shields.io/github/watchers/luckyfelistine-bot/maureonix?label=WATCHERS&color=00f3ff&style=flat-square&logo=github&logoColor=white&labelColor=0a0a0f" alt="Watchers"/>
  <img src="https://img.shields.io/github/forks/luckyfelistine-bot/maureonix?label=FORKS&color=ff00ff&style=flat-square&logo=github&logoColor=white&labelColor=0a0a0f" alt="Forks"/>
  <img src="https://img.shields.io/github/stars/luckyfelistine-bot/maureonix?label=STARS&color=ffff00&style=flat-square&logo=github&logoColor=white&labelColor=0a0a0f" alt="Stars"/>
  <img src="https://img.shields.io/github/issues/luckyfelistine-bot/maureonix?label=ISSUES&color=00ff9d&style=flat-square&logo=github&logoColor=white&labelColor=0a0a0f" alt="Issues"/>
</div>

<!-- SOCIAL LINKS WITH NEON -->
<div style="margin:20px 0;">
  <a href="https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h">
    <img src="https://img.shields.io/badge/CHANNEL-25D366?style=for-the-badge&logo=whatsapp&logoColor=white&labelColor=0a0a0f" alt="Channel"/>
  </a>
  <a href="https://chat.whatsapp.com/B61mO6noiJG3wVzgkDZd4a">
    <img src="https://img.shields.io/badge/GROUP-25D366?style=for-the-badge&logo=whatsapp&logoColor=white&labelColor=0a0a0f" alt="Group"/>
  </a>
  <a href="https://vm.tiktok.com/ZS9LevY1LSrXD-wytcp/">
    <img src="https://img.shields.io/badge/TIKTOK-ff0050?style=for-the-badge&logo=tiktok&logoColor=white&labelColor=0a0a0f" alt="TikTok"/>
  </a>
  <a href="https://github.com/luckyfelistine-bot/maureonix">
    <img src="https://img.shields.io/badge/GITHUB-00f3ff?style=for-the-badge&logo=github&logoColor=white&labelColor=0a0a0f" alt="GitHub"/>
  </a>
</div>

</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- ║                         SCANLINE DIVIDER                              ║ -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<div align="center">
<svg width="100%" height="30" viewBox="0 0 900 30" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dividerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:transparent"/>
      <stop offset="20%" style="stop-color:#00f3ff"/>
      <stop offset="50%" style="stop-color:#ff00ff"/>
      <stop offset="80%" style="stop-color:#00f3ff"/>
      <stop offset="100%" style="stop-color:transparent"/>
    </linearGradient>
  </defs>
  <line x1="0" y1="15" x2="900" y2="15" stroke="url(#dividerGrad)" stroke-width="2">
    <animate attributeName="stroke-width" values="2;4;2" dur="3s" repeatCount="indefinite"/>
  </line>
  <circle cx="450" cy="15" r="5" fill="#00ff9d" filter="url(#neonGlow)">
    <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                    SYSTEM MANIFESTO / DESCRIPTION                   ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<div align="center" style="background: linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%); padding: 25px; border-radius: 15px; border: 1px solid #00f3ff; box-shadow: 0 0 20px rgba(0,243,255,0.15); max-width: 850px; margin: 0 auto;">

<p style="font-family: 'Courier New', monospace; font-size: 16px; color: #e0e0ff; line-height: 1.8; text-align: center; margin: 0;">
  <span style="color: #00f3ff; font-weight: bold;">[SYSTEM_BROADCAST]</span> 
  Welcome to the next evolution of autonomous WhatsApp intelligence. 
  <span style="color: #ff00ff; font-weight: bold;">Maureonix V6.0.0</span> represents the convergence of 
  <span style="color: #00ff9d;">neural automation</span>, 
  <span style="color: #bc13fe;">multi-device architecture</span>, and 
  <span style="color: #00f3ff;">limitless extensibility</span>. 
  Engineered by <span style="color: #ff00ff; font-weight: bold;">Infinite Vybeflix</span> — she is not just a bot. 
  <span style="color: #00ff9d; font-style: italic;">She is the future messaging itself.</span>
</p>

</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                     V6.0.0 FEATURE MATRIX                           ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<h2 align="center">
  <span style="color: #00f3ff; text-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff; font-family: 'Courier New', monospace;">
    ⚡ CORE_FEATURE_MATRIX ⚡
  </span>
</h2>

<div align="center" style="max-width: 900px; margin: 0 auto;">

<!-- ROW 1 -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 15px; margin: 20px 0;">

<!-- CARD: AUTOMATION -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00f3ff; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(0,243,255,0.1); transition: all 0.3s;">
  <div style="font-size: 28px; margin-bottom: 8px;">🤖</div>
  <div style="font-family: 'Courier New', monospace; color: #00f3ff; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #00f3ff;">NEURAL_AUTOMATION</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    75+ Smart Toggles • Auto-Reply Engine • Status Viewer • Mention Responses • Auto-Translate • Auto-Sticker • Keyword Triggers • Smart Forwarding • Auto-Delete Protocols
  </div>
</div>

<!-- CARD: AI ENGINE -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ff00ff; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(255,0,255,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🧠</div>
  <div style="font-family: 'Courier New', monospace; color: #ff00ff; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #ff00ff;">QUANTUM_AI_CORE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    GPT-4o • Gemini Pro • Llama 3 • DeepSeek V3 • Image Generation • Context Memory • Multi-Language TTS • Document Summarization • Code Assistant • Voice Chat
  </div>
</div>

<!-- CARD: GROUP SYSTEM -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00ff9d; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(0,255,157,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">👥</div>
  <div style="font-family: 'Courier New', monospace; color: #00ff9d; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #00ff9d;">GROUP_COMMANDER</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Admin Tools • Anti-Spam Shield • Welcome/Goodbye Sequences • Anti-Link Defense • Anti-Delete Recovery • Group Analytics • Role Management • Mass Mention • Event Scheduler
  </div>
</div>

<!-- CARD: DOWNLOADS -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #bc13fe; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(188,19,254,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">📥</div>
  <div style="font-family: 'Courier New', monospace; color: #bc13fe; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #bc13fe;">DATA_EXTRACTOR</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    YouTube MP3/MP4 • TikTok • Instagram • Facebook • Twitter/X • Spotify • MediaFire • APK Mirror • SoundCloud • Twitch Clips
  </div>
</div>

<!-- CARD: STICKER LAB -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ffff00; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(255,255,0,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🎨</div>
  <div style="font-family: 'Courier New', monospace; color: #ffff00; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #ffff00;">STICKER_FORGE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Image/Video to Sticker • Animated Text (ATTP) • Remove.bg Integration • Blur/Filter Effects • QC Generator • Brat Font Style • Custom Watermark • Sticker to Image
  </div>
</div>

<!-- CARD: GAMING -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ff4444; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(255,68,68,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🎮</div>
  <div style="font-family: 'Courier New', monospace; color: #ff4444; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #ff4444;">ARCADE_OS</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Connect 4 • Blackjack • RPG Adventure • Slot Machine • Roulette • Crash Game • Dice • Trivia Master • Pokémon Battle • Coinflip • Rock Paper Scissors
  </div>
</div>

<!-- CARD: CASINO -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ff8800; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(255,136,0,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">💰</div>
  <div style="font-family: 'Courier New', monospace; color: #ff8800; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #ff8800;">CASINO_ROYALE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Daily Rewards • Work System • Rob/Bank Heist • Shop & Inventory • Global Leaderboard • Betting System • Stock Market Sim • Lottery • Achievement Badges
  </div>
</div>

<!-- CARD: MEDIA & MOVIES -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00f3ff; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(0,243,255,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🎬</div>
  <div style="font-family: 'Courier New', monospace; color: #00f3ff; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #00f3ff;">CINEMA_DATABASE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    IMDB • TMDB • TVMaze • AniList • Jikan API • Series Tracking • Ratings & Reviews • Trailer Fetcher • Cast Info • Release Calendar
  </div>
</div>

<!-- CARD: SPORTS -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00ff9d; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(0,255,157,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">⚽</div>
  <div style="font-family: 'Courier New', monospace; color: #00ff9d; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #00ff9d;">SPORTS_HUB</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Live Scores • Fixtures • Standings • H2H Analysis • Player Stats • Team Info • Predictions • Betting Odds • API Sports • ESPN Integration
  </div>
</div>

<!-- CARD: SEARCH -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #bc13fe; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(188,19,254,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
  <div style="font-family: 'Courier New', monospace; color: #bc13fe; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #bc13fe;">OMNI_SEARCH</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Google • Wikipedia • GitHub • NPM • Urban Dictionary • Weather • News Feed • Maps • Lyrics • Recipe Search • Image Reverse Search
  </div>
</div>

<!-- CARD: MASTER TOOLS -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ff00ff; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(255,0,255,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">📊</div>
  <div style="font-family: 'Courier New', monospace; color: #ff00ff; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #ff00ff;">MASTER_SUITE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    BMI/BMR Calculator • Stock Tracker • Crypto Monitor • Travel Planner • Food Recipes • Dev Utilities • Unit Converter • Password Gen • QR Generator • URL Shortener
  </div>
</div>

<!-- CARD: REMINDERS -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00f3ff; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(0,243,255,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🔔</div>
  <div style="font-family: 'Courier New', monospace; color: #00f3ff; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #00f3ff;">CHRONOS_ENGINE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Persistent Reminders • Heartbeat System • Notes Archive • To-Do Lists • Habit Tracker • Alarm Clock • Countdown Timer • Schedule Manager • Recurring Events
  </div>
</div>

<!-- CARD: FUN -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ffff00; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(255,255,0,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">😄</div>
  <div style="font-family: 'Courier New', monospace; color: #ffff00; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #ffff00;">ENTERTAINMENT</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Memes • Jokes • Quotes • Facts • Magic 8-Ball • Roast Engine • Compliments • Ship Calculator • Truth or Dare • Would You Rather • Random Facts
  </div>
</div>

<!-- CARD: OWNER -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ff4444; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(255,68,68,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">👑</div>
  <div style="font-family: 'Courier New', monospace; color: #ff4444; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #ff4444;">ADMIN_OVERRIDE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Full Bot Control • Block/Unblock Users • Database Backup • Set Profile Picture • Clear Chat History • Join/Leave Groups • Broadcast Messages • System Logs • Remote Shell
  </div>
</div>

<!-- CARD: PRIVACY -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00ff9d; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(0,255,157,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🔐</div>
  <div style="font-family: 'Courier New', monospace; color: #00ff9d; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #00ff9d;">PRIVACY_SHIELD</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    View-Once Revealer • Auto-Delete Messages • Keyword Blocker • Auto-Kick/Ban • Message Encryption • Anti-Spyware • Session Manager • IP Whitelist • Audit Logs
  </div>
</div>

<!-- CARD: JADIBOT -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ff00ff; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(255,0,255,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🤖</div>
  <div style="font-family: 'Courier New', monospace; color: #ff00ff; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #ff00ff;">JADIBOT_MATRIX</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Multi-User Pairing • Personal Bot Instances • Sub-Bot Deployment • User Dashboard • Instance Monitoring • Resource Allocation • Load Balancing • Auto-Scaling
  </div>
</div>

<!-- CARD: RAWG GAMES -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #bc13fe; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(188,19,254,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">🕹️</div>
  <div style="font-family: 'Courier New', monospace; color: #bc13fe; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #bc13fe;">RAWG_DATABASE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    800K+ Games Catalog • Screenshots • Trailers • Store Links • Reviews • Ratings • Release Dates • Platforms • Genres • Developers • Publishers
  </div>
</div>

<!-- CARD: HEARTBEAT -->
<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00f3ff; border-radius: 12px; padding: 18px; box-shadow: 0 0 15px rgba(0,243,255,0.1);">
  <div style="font-size: 28px; margin-bottom: 8px;">💓</div>
  <div style="font-family: 'Courier New', monospace; color: #00f3ff; font-weight: bold; font-size: 15px; margin-bottom: 6px; text-shadow: 0 0 5px #00f3ff;">HEARTBEAT_SYS</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.5;">
    Persistent Reminders • Auto-Backup • Health Checks • Uptime Monitor • Crash Recovery • Auto-Restart • Performance Metrics • Error Logging • Alert System
  </div>
</div>

</div>

</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                      SYSTEM REQUIREMENTS                            ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<h2 align="center">
  <span style="color: #ff00ff; text-shadow: 0 0 10px #ff00ff; font-family: 'Courier New', monospace;">
    🔧 SYSTEM_REQUIREMENTS
  </span>
</h2>

<div align="center" style="max-width: 700px; margin: 0 auto;">

| <span style="color:#00f3ff">SOFTWARE</span> | <span style="color:#00ff9d">VERSION</span> | <span style="color:#ff00ff">STATUS</span> |
|:---:|:---:|:---:|
| **Node.js** | `v20+` | <span style="color:#00ff9d">● REQUIRED</span> |
| **Git** | `Any` | <span style="color:#00ff9d">● REQUIRED</span> |
| **yt-dlp** | `Latest` | <span style="color:#00ff9d">● REQUIRED</span> |
| **ffmpeg** | `Any` | <span style="color:#00ff9d">● REQUIRED</span> |
| **Python 3** | `3.9+` | <span style="color:#00ff9d">● REQUIRED</span> |
| **ImageMagick** | `Any` | <span style="color:#ffff00">● OPTIONAL</span> |

</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                      INSTALLATION PROTOCOLS                         ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<h2 align="center">
  <span style="color: #00ff9d; text-shadow: 0 0 10px #00ff9d; font-family: 'Courier New', monospace;">
    🚀 INSTALLATION_PROTOCOLS
  </span>
</h2>

<div style="max-width: 850px; margin: 0 auto;">

<!-- TERMINAL: TERMUX -->
<div style="background: #0a0a0f; border: 1px solid #00f3ff; border-radius: 12px; margin: 20px 0; overflow: hidden; box-shadow: 0 0 20px rgba(0,243,255,0.1);">
  <div style="background: linear-gradient(90deg, #00f3ff22, #00f3ff11); padding: 12px 18px; border-bottom: 1px solid #00f3ff44; display: flex; align-items: center; gap: 10px;">
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff4444;"></div>
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff8800;"></div>
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #00ff9d;"></div>
    <span style="font-family: 'Courier New', monospace; color: #00f3ff; font-size: 13px; margin-left: 10px;">TERMUX_ANDROID.sh — Recommended</span>
  </div>
  <div style="padding: 18px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.7; color: #e0e0ff;">
    <span style="color: #00ff9d;">$</span> <span style="color: #00f3ff;">pkg update && pkg upgrade -y</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #00f3ff;">pkg install git nodejs-lts python ffmpeg imagemagick -y</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #00f3ff;">pip install yt-dlp</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #00f3ff;">git clone https://github.com/luckyfelistine-bot/maureonix.git</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #00f3ff;">cd maureonix</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #00f3ff;">npm install --legacy-peer-deps</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #ff00ff; font-weight: bold;">node start.js</span>
  </div>
</div>

<!-- TERMINAL: UBUNTU/VPS -->
<div style="background: #0a0a0f; border: 1px solid #ff00ff; border-radius: 12px; margin: 20px 0; overflow: hidden; box-shadow: 0 0 20px rgba(255,0,255,0.1);">
  <div style="background: linear-gradient(90deg, #ff00ff22, #ff00ff11); padding: 12px 18px; border-bottom: 1px solid #ff00ff44; display: flex; align-items: center; gap: 10px;">
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff4444;"></div>
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff8800;"></div>
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #00ff9d;"></div>
    <span style="font-family: 'Courier New', monospace; color: #ff00ff; font-size: 13px; margin-left: 10px;">UBUNTU_VPS.sh — Cloud Deployment</span>
  </div>
  <div style="padding: 18px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.7; color: #e0e0ff;">
    <span style="color: #00ff9d;">$</span> <span style="color: #ff00ff;">sudo apt update && sudo apt upgrade -y</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #ff00ff;">sudo apt install git nodejs npm python3 python3-pip ffmpeg imagemagick -y</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #ff00ff;">pip3 install yt-dlp</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #ff00ff;">git clone https://github.com/luckyfelistine-bot/maureonix.git</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #ff00ff;">cd maureonix && npm install</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #00f3ff; font-weight: bold;">npm start</span>
  </div>
</div>

<!-- TERMINAL: AUTO INSTALL -->
<div style="background: #0a0a0f; border: 1px solid #00ff9d; border-radius: 12px; margin: 20px 0; overflow: hidden; box-shadow: 0 0 20px rgba(0,255,157,0.1);">
  <div style="background: linear-gradient(90deg, #00ff9d22, #00ff9d11); padding: 12px 18px; border-bottom: 1px solid #00ff9d44; display: flex; align-items: center; gap: 10px;">
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff4444;"></div>
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff8800;"></div>
    <div style="width: 12px; height: 12px; border-radius: 50%; background: #00ff9d;"></div>
    <span style="font-family: 'Courier New', monospace; color: #00ff9d; font-size: 13px; margin-left: 10px;">AUTO_INSTALL.sh — One Command</span>
  </div>
  <div style="padding: 18px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.7; color: #e0e0ff;">
    <span style="color: #00ff9d;">$</span> <span style="color: #00ff9d;">git clone https://github.com/luckyfelistine-bot/maureonix.git</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #00ff9d;">cd maureonix</span><br>
    <span style="color: #00ff9d;">$</span> <span style="color: #00ff9d; font-weight: bold;">bash install.sh</span>
  </div>
</div>

<!-- UPDATE NOTE -->
<div style="background: linear-gradient(90deg, #00f3ff11, #ff00ff11); border-left: 4px solid #00f3ff; border-radius: 8px; padding: 15px; margin: 20px 0; font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 13px;">
  <span style="color: #00f3ff; font-weight: bold;">[UPDATE_PROTOCOL]</span> Already installed? Run:<br>
  <span style="color: #ff00ff;">cd ~/maureonix && git pull origin main && pip install -U yt-dlp && node start.js</span>
</div>

</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                      CONFIGURATION MATRIX                           ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<h2 align="center">
  <span style="color: #bc13fe; text-shadow: 0 0 10px #bc13fe; font-family: 'Courier New', monospace;">
    ⚙️ CONFIGURATION_MATRIX
  </span>
</h2>

<div style="max-width: 850px; margin: 0 auto; background: #0a0a0f; border: 1px solid #bc13fe; border-radius: 12px; padding: 25px; box-shadow: 0 0 20px rgba(188,19,254,0.1);">

<div style="font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8; color: #e0e0ff;">

<span style="color: #bc13fe;">// ═══════════════════════════════════════════</span><br>
<span style="color: #bc13fe;">// CORE_IDENTITY_CONFIGURATION</span><br>
<span style="color: #bc13fe;">// ═══════════════════════════════════════════</span><br><br>

<span style="color: #00f3ff;">ownerNumber</span>: [<span style="color: #00ff9d;">'254116903500'</span>],<br>
<span style="color: #00f3ff;">botName</span>: <span style="color: #00ff9d;">'Maureonix'</span>,<br>
<span style="color: #00f3ff;">ownerName</span>: <span style="color: #00ff9d;">'Infinite Vybeflix'</span>,<br><br>

<span style="color: #bc13fe;">// ═══════════════════════════════════════════</span><br>
<span style="color: #bc13fe;">// AUTHENTICATION_PROTOCOL</span><br>
<span style="color: #bc13fe;">// ═══════════════════════════════════════════</span><br><br>

<span style="color: #00f3ff;">pairing_code</span>: <span style="color: #ff00ff;">true</span>,  <span style="color: #666;">// true = Pairing Code | false = QR Code</span><br>
<span style="color: #00f3ff;">global.listprefix</span>: [<span style="color: #00ff9d;">'!'</span>, <span style="color: #00ff9d;">'.'</span>, <span style="color: #00ff9d;">'+'</span>],<br><br>

<span style="color: #bc13fe;">// ═══════════════════════════════════════════</span><br>
<span style="color: #bc13fe;">// NEURAL_API_KEYS [V6.0.0]</span><br>
<span style="color: #bc13fe;">// ═══════════════════════════════════════════</span><br><br>

<span style="color: #00f3ff;">removeBgApiKey</span>:    <span style="color: #00ff9d;">'YOUR_KEY'</span>,  <span style="color: #666;">// remove.bg</span><br>
<span style="color: #00f3ff;">voiceRssApiKey</span>:    <span style="color: #00ff9d;">'YOUR_KEY'</span>,  <span style="color: #666;">// Voice RSS TTS</span><br>
<span style="color: #00f3ff;">geminiApiKey</span>:      <span style="color: #00ff9d;">'YOUR_KEY'</span>,  <span style="color: #666;">// Google AI Studio</span><br>
<span style="color: #00f3ff;">groqApiKey</span>:        <span style="color: #00ff9d;">'YOUR_KEY'</span>,  <span style="color: #666;">// Groq Console</span><br>
<span style="color: #00f3ff;">openaiApiKey</span>:      <span style="color: #00ff9d;">'YOUR_KEY'</span>,  <span style="color: #666;">// OpenAI Platform</span><br>
<span style="color: #00f3ff;">rawgApiKey</span>:        <span style="color: #00ff9d;">'YOUR_KEY'</span>,  <span style="color: #666;">// RAWG Gaming DB</span><br>
<span style="color: #00f3ff;">weatherApiKey</span>:     <span style="color: #00ff9d;">'YOUR_KEY'</span>,  <span style="color: #666;">// OpenWeatherMap</span><br>
<span style="color: #00f3ff;">newsApiKey</span>:        <span style="color: #00ff9d;">'YOUR_KEY'</span>,  <span style="color: #666;">// NewsAPI</span><br>

</div>

</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                      PROJECT ARCHITECTURE                           ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<h2 align="center">
  <span style="color: #00f3ff; text-shadow: 0 0 10px #00f3ff; font-family: 'Courier New', monospace;">
    🗂️ SYSTEM_ARCHITECTURE
  </span>
</h2>

<div align="center" style="max-width: 700px; margin: 0 auto; font-family: 'Courier New', monospace; font-size: 13px; color: #a0a0c0; line-height: 1.8;">

```
MAUREONIX/
│
├── 📁 docs/                    # Documentation & Wiki
├── 📁 curriculum/              # Learning Resources
├── 📁 src/                     # Core Source Engine
│   ├── 📁 handlers/            # Message & Event Handlers
│   ├── 📁 middleware/          # Security & Filters
│   └── 📁 utils/               # Helper Functions
│
├── 📁 commands/                # Command Modules
│   ├── 📁 ai/                  # AI & Neural Networks
│   ├── 📁 download/            # Media Extractors
│   ├── 📁 games/               # Game Engines
│   ├── 📁 group/               # Group Management
│   ├── 📁 owner/               # Admin Overrides
│   ├── 📁 search/              # Search Protocols
│   ├── 📁 sticker/             # Sticker Forge
│   └── 📁 tools/               # Master Utilities
│
├── 📁 lib/                     # External Libraries
├── 📁 database/                # SQLite / JSON Stores
├── 📁 public/                  # Assets & Media
├── 📁 scripts/                 # Deployment Scripts
│
├── ⚙️ config.js                # System Configuration
├── ⚙️ settings.js              # User Preferences
├── 🚀 start.js                 # Boot Sequence
└── 📦 package.json             # Dependencies
```

</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                         V6.0.0 CHANGELOG                            ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<h2 align="center">
  <span style="color: #ff00ff; text-shadow: 0 0 10px #ff00ff; font-family: 'Courier New', monospace;">
    📡 V6.0.0_CHANGELOG
  </span>
</h2>

<div style="max-width: 850px; margin: 0 auto;">

<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ff00ff; border-radius: 12px; padding: 20px; margin: 15px 0; box-shadow: 0 0 15px rgba(255,0,255,0.1);">
  <div style="font-family: 'Courier New', monospace; color: #ff00ff; font-weight: bold; font-size: 14px; margin-bottom: 10px;">▶ NEW: QUANTUM_AI_UPGRADE</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.6;">
    Upgraded to GPT-4o architecture. Added persistent conversation memory across sessions. New image understanding capabilities. Voice chat with natural language processing. Real-time code generation and debugging assistant.
  </div>
</div>

<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00f3ff; border-radius: 12px; padding: 20px; margin: 15px 0; box-shadow: 0 0 15px rgba(0,243,255,0.1);">
  <div style="font-family: 'Courier New', monospace; color: #00f3ff; font-weight: bold; font-size: 14px; margin-bottom: 10px;">▶ NEW: HYPER_AUTOMATION_V2</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.6;">
    Expanded from 50+ to 75+ automation toggles. Smart context-aware replies. Predictive sticker suggestions. Auto-translation with language detection. Intelligent spam filtering with ML. Scheduled message broadcasting.
  </div>
</div>

<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #00ff9d; border-radius: 12px; padding: 20px; margin: 15px 0; box-shadow: 0 0 15px rgba(0,255,157,0.1);">
  <div style="font-family: 'Courier New', monospace; color: #00ff9d; font-weight: bold; font-size: 14px; margin-bottom: 10px;">▶ NEW: JADIBOT_MATRIX</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.6;">
    Revolutionary multi-user bot deployment. Users can now pair their own WhatsApp numbers and spawn personal bot instances. Instance monitoring dashboard. Resource allocation per user. Load balancing across sub-bots.
  </div>
</div>

<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #bc13fe; border-radius: 12px; padding: 20px; margin: 15px 0; box-shadow: 0 0 15px rgba(188,19,254,0.1);">
  <div style="font-family: 'Courier New', monospace; color: #bc13fe; font-weight: bold; font-size: 14px; margin-bottom: 10px;">▶ NEW: ENHANCED_SECURITY_LAYER</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.6;">
    End-to-end message encryption option. Advanced keyword blocking with regex support. Auto-ban system with strike counting. IP whitelisting for owner commands. Complete audit log system. Anti-spyware detection.
  </div>
</div>

<div style="background: linear-gradient(145deg, #0f0f1a, #1a1a2e); border: 1px solid #ffff00; border-radius: 12px; padding: 20px; margin: 15px 0; box-shadow: 0 0 15px rgba(255,255,0,0.1);">
  <div style="font-family: 'Courier New', monospace; color: #ffff00; font-weight: bold; font-size: 14px; margin-bottom: 10px;">▶ NEW: ENTERTAINMENT_EXPANSION</div>
  <div style="font-family: 'Courier New', monospace; color: #a0a0c0; font-size: 12px; line-height: 1.6;">
    New casino games: Coinflip, RPS Betting. Expanded RPG with guilds and raids. Pokémon trading system. Trivia with global leaderboards. Meme generator with custom templates. Music quiz mode.
  </div>
</div>

</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                         SUPPORT LINKS                               ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<h2 align="center">
  <span style="color: #00ff9d; text-shadow: 0 0 10px #00ff9d; font-family: 'Courier New', monospace;">
    📞 SUPPORT_CHANNELS
  </span>
</h2>

<div align="center" style="margin: 25px 0;">

<a href="https://chat.whatsapp.com/B61mO6noiJG3wVzgkDZd4a">
  <img src="https://img.shields.io/badge/JOIN_SUPPORT_GROUP-25D366?style=for-the-badge&logo=whatsapp&logoColor=white&labelColor=0a0a0f" alt="Support Group"/>
</a>
<a href="https://whatsapp.com/channel/0029Vb7IABxCXC3J7ZFFsk2h">
  <img src="https://img.shields.io/badge/FOLLOW_CHANNEL-25D366?style=for-the-badge&logo=whatsapp&logoColor=white&labelColor=0a0a0f" alt="Channel"/>
</a>
<a href="https://github.com/luckyfelistine-bot/maureonix">
  <img src="https://img.shields.io/badge/VIEW_REPOSITORY-00f3ff?style=for-the-badge&logo=github&logoColor=white&labelColor=0a0a0f" alt="GitHub"/>
</a>
<a href="https://vm.tiktok.com/ZS9LevY1LSrXD-wytcp/">
  <img src="https://img.shields.io/badge/FOLLOW_TIKTOK-ff0050?style=for-the-badge&logo=tiktok&logoColor=white&labelColor=0a0a0f" alt="TikTok"/>
</a>

</div>

<br>

<!-- ╔══════════════════════════════════════════════════════════════════════╗ -->
<!-- ║                         FOOTER SIGNATURE                            ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->

<div align="center">

<svg width="100%" height="120" viewBox="0 0 900 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="footerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:transparent"/>
      <stop offset="30%" style="stop-color:#00f3ff"/>
      <stop offset="70%" style="stop-color:#ff00ff"/>
      <stop offset="100%" style="stop-color:transparent"/>
    </linearGradient>
  </defs>

  <!-- Top Line -->
  <line x1="100" y1="20" x2="800" y2="20" stroke="url(#footerGrad)" stroke-width="1" opacity="0.5"/>

  <!-- Main Text -->
  <text x="450" y="60" text-anchor="middle" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#00f3ff" filter="url(#neonGlow)" style="letter-spacing:4px;">
    CRAFTED WITH 
    <tspan fill="#ff00ff">❤️</tspan> 
    BY INFINITE VYBEFLIX
  </text>

  <!-- Sub Text -->
  <text x="450" y="90" text-anchor="middle" font-family="'Courier New', monospace" font-size="13" fill="#a0a0c0" opacity="0.8" style="letter-spacing:2px;">
    © 2026 MAUREONIX SYSTEMS • ALL NEURAL RIGHTS RESERVED
  </text>

  <!-- License -->
  <text x="450" y="110" text-anchor="middle" font-family="'Courier New', monospace" font-size="11" fill="#00ff9d" opacity="0.6" style="letter-spacing:1px;">
    LICENSE: MIT • VERSION: 6.0.0 CYBERNETIC EDITION
  </text>

  <!-- Animated Dots -->
  <circle cx="380" cy="60" r="3" fill="#00f3ff" opacity="0">
    <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="390" cy="60" r="3" fill="#ff00ff" opacity="0">
    <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="400" cy="60" r="3" fill="#00ff9d" opacity="0">
    <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.6s" repeatCount="indefinite"/>
  </circle>
  <circle cx="500" cy="60" r="3" fill="#00ff9d" opacity="0">
    <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.9s" repeatCount="indefinite"/>
  </circle>
  <circle cx="510" cy="60" r="3" fill="#ff00ff" opacity="0">
    <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="520" cy="60" r="3" fill="#00f3ff" opacity="0">
    <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.5s" repeatCount="indefinite"/>
  </circle>
</svg>

</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- ║                    END OF MAUREONIX V6.0.0 README                   ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════════╝ -->
