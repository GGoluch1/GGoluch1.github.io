import { useEffect, useRef, useState } from "react";
import { track } from "../lib/analytics";
import Modal from "./Modal";

// NERV personnel card generator. Everything is drawn on a <canvas> in the
// visitor's browser; their photo never leaves their device.

const W = 1012;
const H = 638;
const TITLE = '"Noto Serif JP", "Times New Roman", serif';
const MONO = '"Share Tech Mono", ui-monospace, monospace';
const C = {
  void: "#050407",
  panel: "#0c0a0e",
  magi: "#ff8a1f",
  nerv: "#ee1c33",
  paper: "#f4efe6",
};

const ORDINALS = ["SEVENTH", "EIGHTH", "NINTH", "TENTH", "ELEVENTH", "TWELFTH"];

const ROLES = {
  pilot: { label: "EVA PILOT", unit: "E計画 // EVANGELION PROJECT", clearance: "LEVEL A" },
  operator: { label: "BRIDGE OPERATOR", unit: "第一発令所 // COMMAND CENTER", clearance: "LEVEL B" },
  scientist: { label: "SCIENTIST", unit: "技術開発部 // TECH. DIVISION", clearance: "LEVEL A" },
  agent: { label: "SECTION 2 AGENT", unit: "保安諜報部 // SECURITY", clearance: "LEVEL AA" },
  civilian: { label: "CIVILIAN", unit: "第3新東京市 // TOKYO-3", clearance: "LEVEL D" },
  angel: { label: "ANGEL", unit: "使徒 // PATTERN BLUE", clearance: "N/A" },
};

// Small, stable hash so the same name always gets the same ID number.
function hash(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPhoto(ctx, photo, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = "#16121a";
  ctx.fillRect(x, y, w, h);

  if (photo) {
    const scale = Math.max(w / photo.width, h / photo.height);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    ctx.filter = "grayscale(1) contrast(1.15)";
    ctx.drawImage(photo, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgb(255 138 31 / 0.55)";
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = "source-over";
  } else {
    ctx.fillStyle = "rgb(255 138 31 / 0.2)";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 125, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 30, 115, 130, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgb(255 138 31 / 0.6)";
    ctx.font = `16px ${MONO}`;
    ctx.textAlign = "center";
    ctx.fillText("NO IMAGE // 写真なし", x + w / 2, y + 26);
  }

  // Scanlines
  ctx.fillStyle = "rgb(0 0 0 / 0.18)";
  for (let sy = y; sy < y + h; sy += 4) ctx.fillRect(x, sy, w, 1);
  ctx.restore();

  ctx.strokeStyle = C.magi;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
}

function field(ctx, label, value, x, y, size = 26) {
  ctx.textAlign = "left";
  ctx.fillStyle = "rgb(255 138 31 / 0.7)";
  ctx.font = `14px ${MONO}`;
  ctx.fillText(label, x, y);
  ctx.fillStyle = C.paper;
  ctx.font = `${size}px ${MONO}`;
  ctx.fillText(value, x, y + size + 6);
}

function drawCard(ctx, { name, role, photo }) {
  const seed = hash(`${name}|${role}`);
  const r = ROLES[role];
  const designation = role === "pilot" ? `THE ${ORDINALS[seed % ORDINALS.length]} CHILD` : r.label;
  const today = new Date();
  const issued = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 28);
  ctx.clip();

  ctx.fillStyle = C.panel;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgb(255 138 31 / 0.05)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 32) {
    ctx.beginPath();
    ctx.moveTo(gx, 96);
    ctx.lineTo(gx, H);
    ctx.stroke();
  }

  // Header
  ctx.fillStyle = C.nerv;
  ctx.fillRect(0, 0, W, 96);
  ctx.fillStyle = C.void;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `900 62px ${TITLE}`;
  ctx.fillText("NERV", 36, 52);
  ctx.textAlign = "right";
  ctx.font = `900 24px ${TITLE}`;
  ctx.fillText("特務機関ネルフ", W - 36, 36);
  ctx.font = `17px ${MONO}`;
  ctx.fillText("PERSONNEL IDENTIFICATION // 職員証", W - 36, 68);
  ctx.textBaseline = "alphabetic";

  drawPhoto(ctx, photo, 36, 128, 260, 330);

  // Name, shrunk to fit
  const x = 336;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgb(255 138 31 / 0.7)";
  ctx.font = `14px ${MONO}`;
  ctx.fillText("NAME // 氏名", x, 148);
  let size = 54;
  const shown = name.trim().toUpperCase() || "YOUR NAME";
  do {
    ctx.font = `900 ${size}px ${TITLE}`;
    size -= 2;
  } while (ctx.measureText(shown).width > W - x - 36 && size > 20);
  ctx.fillStyle = C.paper;
  ctx.fillText(shown, x, 206);

  field(ctx, "DESIGNATION // 所属", designation, x, 250);
  field(ctx, "DIVISION", r.unit, x, 318, 22);
  field(ctx, "CLEARANCE // 保安レベル", r.clearance, x, 384, 22);
  field(ctx, "ID No.", `NV-${String(seed % 9000000 + 1000000)}`, x + 330, 384, 22);
  field(ctx, "ISSUED", issued, x, 448, 22);
  field(ctx, "VALID UNTIL", "THIRD IMPACT", x + 330, 448, 22);

  // Barcode
  let bits = seed;
  let bx = 660;
  ctx.fillStyle = C.paper;
  while (bx < W - 36) {
    bits = (Math.imul(bits, 1103515245) + 12345) >>> 0;
    const bw = 2 + (bits % 4);
    if (bits & 8) ctx.fillRect(bx, 516, bw, 48);
    bx += bw + 2;
  }

  ctx.fillStyle = "rgb(255 138 31 / 0.7)";
  ctx.font = `14px ${MONO}`;
  ctx.fillText("GOD'S IN HIS HEAVEN. ALL'S RIGHT WITH THE WORLD.", 36, 560);

  // Hazard band
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, H - 40, W, 40);
  ctx.clip();
  ctx.fillStyle = C.void;
  ctx.fillRect(0, H - 40, W, 40);
  ctx.fillStyle = C.magi;
  for (let hx = -40; hx < W + 40; hx += 36) {
    ctx.beginPath();
    ctx.moveTo(hx, H);
    ctx.lineTo(hx + 18, H);
    ctx.lineTo(hx + 58, H - 40);
    ctx.lineTo(hx + 40, H - 40);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();

  ctx.strokeStyle = C.magi;
  ctx.lineWidth = 4;
  roundRect(ctx, 2, 2, W - 4, H - 4, 26);
  ctx.stroke();
}

export default function IdCard({ onClose }) {
  const canvasRef = useRef(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("pilot");
  const [photo, setPhoto] = useState(null);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    Promise.all([document.fonts.load(`900 40px ${TITLE}`), document.fonts.load(`20px ${MONO}`)])
      .catch(() => {})
      .finally(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawCard(ctx, { name, role, photo });
  }, [name, role, photo, fontsReady]);

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setPhoto(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nerv-id-${(name.trim() || "personnel").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      track("id-card", "NERV ID card issued");
    });
  };

  const input = "w-full border-2 border-magi/60 bg-panel px-3 py-2 text-paper outline-none focus:border-magi";

  return (
    <Modal open onClose={onClose} label="NERV ID card" className="w-[60rem]">
      <div className="flex items-center justify-between bg-nerv px-3 py-1 text-xs tracking-widest text-void">
        <span>NERV // PERSONNEL REGISTRATION // 職員登録</span>
        <button type="button" onClick={onClose} aria-label="Close" className="px-1 hover:text-paper">
          ✕
        </button>
      </div>
      <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs tracking-[0.3em] text-magi/80">NAME // 氏名</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} data-autofocus placeholder="SHINJI IKARI" className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs tracking-[0.3em] text-magi/80">ASSIGNMENT</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
              {Object.entries(ROLES).map(([id, r]) => (
                <option key={id} value={id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs tracking-[0.3em] text-magi/80">PHOTO (OPTIONAL)</span>
            <input
              type="file"
              accept="image/*"
              onChange={onPhoto}
              className="w-full text-xs text-paper/80 file:mr-3 file:border-2 file:border-magi file:bg-transparent file:px-3 file:py-1.5 file:text-magi file:tracking-widest hover:file:bg-magi hover:file:text-void"
            />
            <span className="mt-1 block text-[10px] text-magi/60">STAYS ON YOUR DEVICE. NOTHING IS UPLOADED.</span>
          </label>
        </div>
        <div>
          <canvas ref={canvasRef} width={W} height={H} className="h-auto w-full" aria-label="Preview of your NERV ID card" />
          <button
            type="button"
            onClick={download}
            className="mt-4 w-full bg-magi py-3 font-bold tracking-[0.3em] text-void shadow-[4px_4px_0_var(--color-nerv)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-nerv)]"
          >
            ISSUE CARD ▾
          </button>
        </div>
      </div>
    </Modal>
  );
}
