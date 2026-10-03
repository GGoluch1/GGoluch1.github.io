import { PenguinShapes } from "../eggs/PenPen";
import { SKIN } from "./characters";

// The cast of the congratulations scene, drawn from scratch like Lilith: one
// bust (head, shoulders and two clapping hands, in a 200 x 240 box) dressed
// for each character from the data in characters.js.

// Hair behind the head (long styles only) and in front of it, per style.
const HAIR_BACK = {
  long: "M54 90 C46 40 76 22 100 22 C126 22 154 40 146 90 L152 214 C130 224 70 224 48 214 Z",
  asuka: "M52 92 C44 38 76 20 100 20 C126 20 156 38 148 92 C156 150 162 200 160 236 L40 236 C38 200 44 150 52 92 Z",
  longStraight: "M56 90 C50 44 76 26 100 26 C124 26 150 44 144 90 L148 178 L52 178 Z",
  bob: "M56 92 C52 44 76 28 100 28 C124 28 148 44 144 92 C146 118 142 134 136 144 L128 104 L72 104 L64 144 C58 134 54 118 56 92 Z",
  pigtails: "M56 92 C52 46 76 30 100 30 C124 30 148 46 144 92 L140 112 L60 112 Z",
};

const HAIR_FRONT = {
  messy:
    "M56 96 C46 52 66 28 100 28 C134 28 154 52 144 96 L138 76 L132 88 L126 68 L116 84 L108 64 L100 82 L92 64 L84 84 L74 68 L68 88 L62 76 Z",
  short: "M58 90 C52 50 72 32 100 32 C128 32 148 50 142 90 L138 72 C128 64 116 60 100 62 C84 60 72 64 62 72 Z",
  bob: "M58 92 C54 48 74 32 100 32 C126 32 146 48 142 92 L134 74 L124 82 L116 66 L100 78 L84 66 L76 82 L66 74 Z",
  buzz: "M62 78 C62 48 78 38 100 38 C122 38 138 48 138 78 C128 64 72 64 62 78 Z",
  slicked: "M62 82 C60 46 80 34 100 34 C122 34 140 46 138 82 C134 62 120 54 100 54 C80 54 66 62 62 82 Z",
  long: "M58 94 C52 48 74 30 100 30 C126 30 148 48 142 94 L134 70 C124 60 110 56 102 52 C96 62 82 70 66 74 Z",
  asuka: "M58 94 C52 48 74 30 100 30 C126 30 148 48 142 94 L136 72 L126 80 L118 62 L104 76 L92 60 L80 78 L66 70 Z",
  longStraight: "M58 100 C52 50 74 30 100 30 C126 30 148 50 142 100 L136 64 C124 52 108 46 100 44 C92 46 76 52 64 64 Z",
  pigtails: "M58 90 C54 48 74 32 100 32 C126 32 146 48 142 90 L140 72 L60 72 Z",
  ponytail: "M60 86 C56 46 78 32 100 32 C124 32 144 46 140 86 C134 64 118 50 100 50 C86 50 72 58 66 72 L64 90 Z",
};

const TORSO = "M24 240 C26 192 54 166 100 163 C146 166 174 192 176 240 Z";
const FACE = "M62 84 C62 54 78 40 100 40 C122 40 138 54 138 84 C138 112 124 136 100 142 C76 136 62 112 62 84 Z";

function Eyes({ who }) {
  if (who.extras?.includes("shades")) {
    return (
      <g>
        <rect x="72" y="90" width="24" height="14" rx="3" fill="#c8641e" opacity="0.9" stroke="#111" strokeWidth="2" />
        <rect x="104" y="90" width="24" height="14" rx="3" fill="#c8641e" opacity="0.9" stroke="#111" strokeWidth="2" />
        <path d="M96 95 H104" stroke="#111" strokeWidth="2" />
      </g>
    );
  }
  return [84, 116].map((x) => (
    <g key={x}>
      <ellipse cx={x} cy="98" rx="7.5" ry="9" fill="#fff" />
      <ellipse cx={x} cy="99.5" rx="6" ry="7.6" fill={who.eyes} />
      <ellipse cx={x} cy="100.5" rx="3" ry="4.2" fill="#0d0a10" opacity="0.55" />
      <circle cx={x - 2} cy="95.5" r="2" fill="#fff" />
      <path
        d={`M${x - 9} 90 Q${x} 85 ${x + 9} 90`}
        stroke="#1a1214"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  ));
}

function Mouth({ smile }) {
  return smile ? (
    <path d="M90 121 Q100 129 110 121" stroke="#8c2a36" strokeWidth="2.6" fill="none" strokeLinecap="round" />
  ) : (
    <path d="M90 119 Q100 133 110 119 Q100 124 90 119 Z" fill="#8c2a36" />
  );
}

function Hands({ gloves, skin }) {
  const fill = gloves ? "#f2f2f2" : skin;
  return (
    <g>
      <g className="clap-l">
        <ellipse cx="74" cy="196" rx="12" ry="17" fill={fill} stroke="#00000022" transform="rotate(-18 74 196)" />
        <ellipse cx="80" cy="184" rx="4" ry="8" fill={fill} transform="rotate(30 80 184)" />
      </g>
      <g className="clap-r">
        <ellipse cx="126" cy="196" rx="12" ry="17" fill={fill} stroke="#00000022" transform="rotate(18 126 196)" />
        <ellipse cx="120" cy="184" rx="4" ry="8" fill={fill} transform="rotate(-30 120 184)" />
      </g>
    </g>
  );
}

// One character from the waist up. hands: clapping hands in front of the
// chest; smile: a closed, gentle smile instead of a cheer.
export default function Bust({ who, hands = true, smile = false, className = "", style }) {
  if (who.penguin) {
    return (
      <svg viewBox="0 0 200 240" className={className} style={style} aria-hidden="true">
        <g transform="translate(40 96) scale(2.5)">
          <g className="origin-bottom animate-[waddle_0.7s_ease-in-out_infinite] [transform-box:fill-box]">
            <PenguinShapes />
          </g>
        </g>
      </svg>
    );
  }

  const skin = who.skin ?? SKIN;
  const has = (extra) => who.extras?.includes(extra);

  return (
    <svg viewBox="0 0 200 240" className={className} style={style} aria-hidden="true">
      {HAIR_BACK[who.style] && <path d={HAIR_BACK[who.style]} fill={who.hair} stroke="#0000002a" />}
      {who.style === "pigtails" && (
        <g fill={who.hair} stroke="#0000002a">
          <ellipse cx="50" cy="130" rx="13" ry="34" transform="rotate(12 50 130)" />
          <ellipse cx="150" cy="130" rx="13" ry="34" transform="rotate(-12 150 130)" />
        </g>
      )}
      {who.style === "ponytail" && (
        <ellipse cx="134" cy="136" rx="7" ry="17" fill={who.hair} transform="rotate(-28 134 136)" />
      )}

      {/* Body */}
      <path d={TORSO} fill={who.outfit} stroke="#00000026" />
      {has("labcoat") && (
        <path d="M70 168 L100 214 L130 168" stroke="#c9c9c4" strokeWidth="3" fill="none" strokeLinejoin="round" />
      )}
      {who.collar && <path d="M80 165 L100 192 L120 165 L110 162 L100 176 L90 162 Z" fill={who.collar} />}
      {has("stripes") && <path d="M58 182 L46 240 M142 182 L154 240" stroke="#f4f3ee" strokeWidth="5" />}
      {has("tie") && <path d="M96 166 L104 166 L107 206 L100 216 L93 206 Z" fill="#7a2030" />}
      {has("cross") && (
        <g fill="#d8b44a">
          <rect x="98" y="172" width="4" height="20" rx="1" />
          <rect x="92" y="177" width="16" height="4" rx="1" />
        </g>
      )}
      <rect x="88" y="126" width="24" height="42" rx="9" fill={skin} />
      <path d="M88 150 Q100 160 112 150 L112 156 Q100 166 88 156 Z" fill="#00000014" />

      {/* Head */}
      <ellipse cx="61" cy="98" rx="5" ry="8" fill={skin} />
      <ellipse cx="139" cy="98" rx="5" ry="8" fill={skin} />
      <path d={FACE} fill={skin} />
      <Eyes who={who} />
      <path d="M100 106 l-2 7 h4" stroke="#c49a86" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {!has("shades") && <ellipse cx="78" cy="112" rx="7" ry="3.5" fill="#ff8f9b" opacity="0.35" />}
      {!has("shades") && <ellipse cx="122" cy="112" rx="7" ry="3.5" fill="#ff8f9b" opacity="0.35" />}
      {has("freckles") && (
        <g fill="#b9775e" opacity="0.7">
          <circle cx="76" cy="110" r="1.2" />
          <circle cx="80" cy="113" r="1.2" />
          <circle cx="73" cy="113" r="1.2" />
          <circle cx="124" cy="110" r="1.2" />
          <circle cx="120" cy="113" r="1.2" />
          <circle cx="127" cy="113" r="1.2" />
        </g>
      )}
      {has("mole") && <circle cx="123" cy="108" r="1.6" fill="#3a2a22" />}
      {has("lines") && <path d="M70 108 q4 6 2 12 M130 108 q-4 6 -2 12" stroke="#c49a86" fill="none" />}
      {has("stubble") && (
        <path
          d="M80 124 Q100 146 120 124"
          stroke="#3a2a22"
          strokeWidth="5"
          strokeDasharray="1 3"
          fill="none"
          opacity="0.5"
        />
      )}
      {has("beard") ? (
        <path
          d="M74 112 Q76 142 100 148 Q124 142 126 112 Q120 128 112 126 Q100 120 88 126 Q80 128 74 112 Z"
          fill="#18181a"
        />
      ) : (
        <Mouth smile={smile} />
      )}
      {has("beard") && <path d="M92 125 Q100 130 108 125" stroke="#7a2a2a" strokeWidth="2.2" fill="none" />}

      {/* Hair */}
      <path d={HAIR_FRONT[who.style]} fill={who.hair} stroke="#0000002a" />
      {has("clips") && (
        <g fill="#d42030" stroke="#7a0a14">
          <rect x="58" y="52" width="12" height="20" rx="3" transform="rotate(-25 64 62)" />
          <rect x="130" y="52" width="12" height="20" rx="3" transform="rotate(25 136 62)" />
        </g>
      )}
      {has("glasses") && (
        <g fill="none" stroke="#2a2a2a" strokeWidth="2.2">
          <circle cx="84" cy="99" r="12" />
          <circle cx="116" cy="99" r="12" />
          <path d="M96 99 H104" />
        </g>
      )}

      {hands && <Hands gloves={has("gloves")} skin={skin} />}
    </svg>
  );
}
