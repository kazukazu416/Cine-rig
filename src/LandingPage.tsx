import React from "react";

const font = "-apple-system, 'SF Pro Display', Inter, sans-serif";

const accent   = "#005BA6";
const accentHover = "#0070C9";

/* ── Wiring diagram SVG (hero background illustration) ── */
function WiringIllustration() {
  return (
    <svg
      viewBox="0 0 800 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", opacity: 0.18 }}
      aria-hidden
    >
      {/* camera node */}
      <rect x="60" y="150" width="110" height="50" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
      <text x="115" y="170" textAnchor="middle" fill="white" fontSize="10" fontFamily={font} fontWeight="600">Sony FX6</text>
      <text x="115" y="184" textAnchor="middle" fill="white" fontSize="8" fontFamily={font} opacity="0.7">Camera</text>
      <circle cx="170" cy="175" r="3" fill="white"/>
      <circle cx="170" cy="168" r="3" fill="white"/>

      {/* wireless TX */}
      <rect x="240" y="80" width="110" height="50" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
      <text x="295" y="100" textAnchor="middle" fill="white" fontSize="10" fontFamily={font} fontWeight="600">Bolt 6 LT TX</text>
      <text x="295" y="114" textAnchor="middle" fill="white" fontSize="8" fontFamily={font} opacity="0.7">Wireless TX</text>
      <circle cx="240" cy="105" r="3" fill="white"/>
      <circle cx="350" cy="105" r="3" fill="white"/>

      {/* monitor 1 */}
      <rect x="420" y="40" width="110" height="50" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
      <text x="475" y="60" textAnchor="middle" fill="white" fontSize="10" fontFamily={font} fontWeight="600">SmallHD Cine 7</text>
      <text x="475" y="74" textAnchor="middle" fill="white" fontSize="8" fontFamily={font} opacity="0.7">Monitor</text>
      <circle cx="420" cy="65" r="3" fill="white"/>

      {/* monitor 2 */}
      <rect x="420" y="150" width="110" height="50" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
      <text x="475" y="170" textAnchor="middle" fill="white" fontSize="10" fontFamily={font} fontWeight="600">Atomos Shogun</text>
      <text x="475" y="184" textAnchor="middle" fill="white" fontSize="8" fontFamily={font} opacity="0.7">Monitor / Rec</text>
      <circle cx="420" cy="175" r="3" fill="white"/>

      {/* wireless RX */}
      <rect x="420" y="260" width="110" height="50" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
      <text x="475" y="280" textAnchor="middle" fill="white" fontSize="10" fontFamily={font} fontWeight="600">Bolt 6 LT RX</text>
      <text x="475" y="294" textAnchor="middle" fill="white" fontSize="8" fontFamily={font} opacity="0.7">Wireless RX</text>
      <circle cx="420" cy="285" r="3" fill="white"/>

      {/* director monitor */}
      <rect x="590" y="260" width="110" height="50" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
      <text x="645" y="280" textAnchor="middle" fill="white" fontSize="10" fontFamily={font} fontWeight="600">Sony LMD-A220</text>
      <text x="645" y="294" textAnchor="middle" fill="white" fontSize="8" fontFamily={font} opacity="0.7">Director Mon.</text>
      <circle cx="590" cy="285" r="3" fill="white"/>

      {/* cables */}
      {/* cam → tx (12G-SDI) */}
      <path d="M170 168 C 205 168, 215 105, 240 105" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="0"/>
      {/* cam → monitor2 (HDMI) */}
      <path d="M170 175 C 300 175, 350 175, 420 175" fill="none" stroke="#7EC8E3" strokeWidth="1.5"/>
      {/* tx → monitor1 */}
      <path d="M350 105 C 385 105, 395 65, 420 65" fill="none" stroke="white" strokeWidth="1.5"/>
      {/* tx → rx (wireless) */}
      <path d="M350 115 C 380 200, 390 275, 420 285" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>
      {/* rx → director */}
      <path d="M530 285 L 590 285" fill="none" stroke="#7EC8E3" strokeWidth="1.5"/>

      {/* battery indicator */}
      <rect x="60" y="280" width="80" height="28" rx="5" fill="none" stroke="#639922" strokeWidth="1.2" opacity="0.8"/>
      <text x="100" y="297" textAnchor="middle" fill="#639922" fontSize="9" fontFamily={font}>🔋 3.2h</text>
    </svg>
  );
}

/* ── styled button ── */
function CTAButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? accentHover : accent,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "14px 32px",
        fontSize: 16,
        fontWeight: 600,
        fontFamily: font,
        cursor: "pointer",
        transition: "background 200ms ease-out, transform 150ms ease-out",
        transform: hover ? "translateY(-1px)" : "none",
        letterSpacing: 0.2,
      }}
    >
      {label}
    </button>
  );
}

/* ── problem card ── */
function ProblemCard({ text }: { text: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 10,
      padding: "18px 22px",
      fontFamily: font,
      fontSize: 15,
      color: "#1d1d1f",
      lineHeight: 1.55,
    }}>
      {text}
    </div>
  );
}

/* ── solution item ── */
function SolutionItem({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: font }}>
      <span style={{ color: accent, fontSize: 16, marginTop: 1, flexShrink: 0 }}>✓</span>
      <span style={{ fontSize: 15, color: "#1d1d1f", lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

/* ── feature card ── */
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 12,
      padding: "28px 24px",
      flex: 1,
      minWidth: 200,
      fontFamily: font,
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#6e6e73", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

export function LandingPage() {
  const go = () => { window.location.pathname = "/app"; };

  return (
    <div style={{ fontFamily: font, background: "#FAFAFA", minHeight: "100vh" }}>

      {/* ─── Header ─────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(250,250,250,0.88)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 52,
      }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: "#1d1d1f", letterSpacing: -0.3 }}>
          CineRig
        </span>
        <button
          onClick={go}
          style={{
            background: accent, color: "#fff", border: "none",
            borderRadius: 8, padding: "7px 18px",
            fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer",
          }}
        >
          アプリを開く →
        </button>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a1628 0%, #0d2444 50%, #0f3060 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px 60px",
        position: "relative", overflow: "hidden",
      }}>
        {/* background illustration */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{ width: "min(900px, 100%)", height: "100%" }}>
            <WiringIllustration />
          </div>
        </div>

        {/* content */}
        <div style={{ position: "relative", maxWidth: 680 }}>
          <div style={{
            display: "inline-block",
            background: "rgba(0,91,166,0.25)",
            border: "1px solid rgba(0,91,166,0.4)",
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 12,
            color: "#7EC8E3",
            fontWeight: 500,
            marginBottom: 24,
            letterSpacing: 0.5,
          }}>
            Cinema Equipment Wiring Tool
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            margin: "0 0 20px",
            letterSpacing: -1,
          }}>
            現場の配線、<br />もう暗記しなくていい。
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "rgba(255,255,255,0.75)",
            margin: "0 0 12px",
            lineHeight: 1.6,
          }}>
            機材を選ぶだけで配線図が完成。バッテリーの本数も自動計算。
          </p>
          <p style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 40px",
            fontStyle: "italic",
            letterSpacing: 0.3,
          }}>
            Cinema equipment wiring, simplified.
          </p>

          <CTAButton label="アプリを開く →" onClick={go} />
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 14 }}>
            登録不要・完全無料
          </p>
        </div>
      </section>

      {/* ─── Problem ────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", maxWidth: 760, margin: "0 auto" }}>
        <h2 style={{
          fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700,
          color: "#1d1d1f", marginBottom: 8, textAlign: "center",
        }}>
          こんな経験、ありませんか？
        </h2>
        <p style={{ textAlign: "center", color: "#6e6e73", fontSize: 14, marginBottom: 40 }}>
          現場で毎回繰り返す、地味なストレス
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ProblemCard text='😓 「前回の構成、何本SDIだっけ…」' />
          <ProblemCard text='🔋 「バッテリー何本持っていけばいい？」' />
          <ProblemCard text='📡 「ワイヤレスの接続順、毎回確認してる」' />
        </div>
      </section>

      {/* ─── Solution ───────────────────────────────────────────── */}
      <section style={{
        background: "#F5F5F7",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            display: "inline-block",
            background: "#E6F0FA",
            color: accent,
            borderRadius: 6,
            padding: "3px 12px",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 16,
          }}>
            CineRig なら
          </div>
          <h2 style={{
            fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700,
            color: "#1d1d1f", marginBottom: 36,
          }}>
            現場の準備が、もっとスマートに。
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SolutionItem text="機材を選ぶだけで配線図が自動生成される" />
            <SolutionItem text="バッテリーの稼働時間・必要本数を自動計算" />
            <SolutionItem text="ワイヤレスの接続ルートも一目でわかる" />
            <SolutionItem text="案件ごとに保存・共有できる" />
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{
          fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700,
          color: "#1d1d1f", marginBottom: 8, textAlign: "center",
        }}>
          主な機能
        </h2>
        <p style={{ textAlign: "center", color: "#6e6e73", fontSize: 14, marginBottom: 40 }}>
          プロの現場で必要なことだけ、シンプルに。
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <FeatureCard
            icon="📐"
            title="配線図の自動生成"
            desc="カメラ・モニター・ワイヤレスを選ぶだけ。SDI / HDMI / 音声ラインが自動でつながる。"
          />
          <FeatureCard
            icon="🔋"
            title="バッテリー計算"
            desc="機材の消費電力を集計し、選んだバッテリーで何時間稼働できるか即座に計算。"
          />
          <FeatureCard
            icon="📁"
            title="案件管理"
            desc="撮影案件ごとに構成を保存。前回の機材リストをそのまま流用できる。"
          />
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section style={{
        background: accent,
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <h2 style={{
          fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700,
          color: "#fff", marginBottom: 12,
        }}>
          現場の準備を、今すぐ変えよう。
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, marginBottom: 32 }}>
          登録不要・完全無料ですぐ使える。
        </p>
        <button
          onClick={go}
          style={{
            background: "#fff",
            color: accent,
            border: "none",
            borderRadius: 10,
            padding: "14px 36px",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: font,
            cursor: "pointer",
          }}
        >
          無料で使ってみる →
        </button>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 14 }}>
          登録不要・完全無料
        </p>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(0,0,0,0.06)",
        padding: "24px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1d1d1f" }}>CineRig</span>
        <span style={{ fontSize: 12, color: "#86868b" }}>
          Cinema equipment wiring, simplified.
        </span>
      </footer>
    </div>
  );
}
