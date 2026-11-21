import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  Video,
} from "remotion";

export const TalkingHead: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#050505" }}>
    <EditedVideo />
  </AbsoluteFill>
);

const EditedVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(
    frame,
    [0, 350, 700, 1050, 1400, 1753],
    [1, 1.035, 1.015, 1.045, 1.02, 1.04],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const progress = interpolate(frame, [0, 1753], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visualPhase =
    frame < 350 ? "intro" : frame < 700 ? "flow" : frame < 1050 ? "warning" : "cta";

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Video
          src={staticFile("raw-video.mp4")}
          muted={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 1,
          }}
        />
      </AbsoluteFill>
      {visualPhase === "intro" ? <IntroLabel /> : <AdVisual phase={visualPhase} />}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 7,
          background: "rgba(255,255,255,0.25)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#ffd400",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

type VisualPhase = "intro" | "flow" | "warning" | "cta";

const IntroLabel: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 34,
      left: 28,
      padding: "8px 14px",
      borderLeft: "5px solid #ffd400",
      color: "white",
      fontFamily: "Arial, sans-serif",
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: 1.5,
      textShadow: "0 2px 6px rgba(0,0,0,0.65)",
    }}
  >
    SKINCARE ROUTINE
  </div>
);

const AdVisual: React.FC<{ phase: Exclude<VisualPhase, "intro"> }> = ({ phase }) => {
  const frame = useCurrentFrame();
  const phaseStart = phase === "flow" ? 350 : phase === "warning" ? 700 : 1050;
  const opacity = interpolate(frame, [phaseStart, phaseStart + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labels = {
    flow: { eyebrow: "SKIN CHECK", title: "SKIN TYPE", value: "BASICS", color: "#44d7ff" },
    warning: { eyebrow: "ATTENTION", title: "COMMON MISTAKE", value: "PRODUCT OVERLOAD", color: "#ffb000" },
    cta: { eyebrow: "NIGHT ROUTINE", title: "SKIN REPAIR", value: "SIMPLE STEPS", color: "#ffd400" },
  }[phase];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "140px 34px 90px",
        background:
          phase === "flow"
            ? "radial-gradient(circle at 50% 35%, #123e58dd 0%, #07131dcc 48%, #03070bcc 100%)"
            : phase === "warning"
              ? "radial-gradient(circle at 50% 35%, #512b0edd 0%, #1a1008cc 48%, #050403cc 100%)"
              : "radial-gradient(circle at 50% 35%, #4b3b08dd 0%, #181306cc 48%, #050403cc 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        opacity,
        transform: `scale(${interpolate(opacity, [0, 1], [1.04, 1])})`,
      }}
    >
      <div style={{ color: labels.color, fontSize: 17, fontWeight: 900, letterSpacing: 2 }}>
        {labels.eyebrow}
      </div>
      <div style={{ marginTop: 12, fontSize: 42, fontWeight: 900, lineHeight: 1.05 }}>
        {labels.title}
      </div>
      <div style={{ marginTop: 30 }}>
        {phase === "flow" && <FlowDiagram color={labels.color} frame={frame} />}
        {phase === "warning" && <WarningDashboard color={labels.color} frame={frame} />}
        {phase === "cta" && <SavingsCard color={labels.color} frame={frame} />}
      </div>
    </div>
  );
};

const FlowDiagram: React.FC<{ color: string; frame: number }> = ({ color, frame }) => (
  <div style={{ border: `2px solid ${color}`, borderRadius: 20, padding: 18, background: "#06131cdd" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <SystemNode label="CLEANSE" color={color} />
      <FlowLine color={color} frame={frame} />
      <SystemNode label="MOISTURIZE" color={color} />
    </div>
    <div style={{ marginTop: 18, height: 12, borderRadius: 10, background: "#ffffff22", overflow: "hidden" }}>
      <div style={{ width: "74%", height: "100%", background: color, transform: `translateX(${Math.sin(frame / 5) * 8}px)` }} />
    </div>
    <div style={{ marginTop: 12, color: "#d8f6ff", fontSize: 18, fontWeight: 700 }}>
      CONSISTENT DAILY ROUTINE
    </div>
  </div>
);

const WarningDashboard: React.FC<{ color: string; frame: number }> = ({ color, frame }) => (
  <div style={{ border: `2px solid ${color}`, borderRadius: 20, padding: 18, background: "#1d1006dd" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ fontSize: 72, color, lineHeight: 1 }}>!</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900 }}>RISK DETECTED</div>
        <div style={{ marginTop: 6, color: "#ffe2bb", fontSize: 17 }}>Too many products can irritate skin</div>
      </div>
    </div>
    <div style={{ marginTop: 22, height: 18, borderRadius: 10, background: "#ffffff22", overflow: "hidden" }}>
      <div style={{ width: `${68 + Math.sin(frame / 8) * 8}%`, height: "100%", background: color }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color, fontSize: 18, fontWeight: 900 }}>
      <span>SKIN HEALTH</span><span>CHECK</span>
    </div>
  </div>
);

const SavingsCard: React.FC<{ color: string; frame: number }> = ({ color, frame }) => (
  <div style={{ border: `2px solid ${color}`, borderRadius: 20, padding: 22, background: "#181304ee" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ color, fontSize: 22, fontWeight: 900 }}>NIGHT CARE</div>
      <div style={{ fontSize: 42, transform: `rotate(${Math.sin(frame / 8) * 4}deg)` }}>₹</div>
    </div>
    <div style={{ marginTop: 18, fontSize: 34, fontWeight: 900 }}>KEEP IT SIMPLE</div>
    <div style={{ marginTop: 14, color: "#fff1a6", fontSize: 19, lineHeight: 1.35 }}>
      Use a simple serum routine before bed and stay consistent.
    </div>
    <div style={{ marginTop: 22, display: "inline-block", padding: "11px 16px", borderRadius: 8, background: color, color: "#1a1300", fontSize: 19, fontWeight: 900 }}>
      COMMENT “SKIN”
    </div>
  </div>
);

const SystemNode: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div style={{ flex: 1, padding: "18px 8px", border: `2px solid ${color}`, borderRadius: 12, textAlign: "center", color, fontSize: 18, fontWeight: 900 }}>
    {label}
  </div>
);

const FlowLine: React.FC<{ color: string; frame: number }> = ({ color, frame }) => (
  <div style={{ width: 44, height: 8, borderRadius: 8, background: color, opacity: 0.55 + Math.abs(Math.sin(frame / 6)) * 0.45 }} />
);
