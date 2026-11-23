import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StoryScene } from "../storytelling/StorySceneTypes";

type AudioStorytellingProps = {
  sourceFile: string;
  scenes: StoryScene[];
};

export const AudioStorytelling: React.FC<AudioStorytellingProps> = ({
  sourceFile,
  scenes,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const seconds = frame / fps;
  const activeScenes = scenes.filter(
    (scene) =>
      scene.factualVerification !== "review_required" &&
      seconds >= scene.startSeconds &&
      seconds <= scene.endSeconds,
  );

  return (
    <AbsoluteFill style={{ background: "#07111f", overflow: "hidden" }}>
      <Audio src={staticFile(sourceFile)} />
      <StoryBackdrop activeScenes={activeScenes} />
      {activeScenes.map((scene) => (
        <StorySceneCard
          key={scene.id}
          scene={scene}
          frame={frame}
          fps={fps}
          width={width}
          height={height}
        />
      ))}
    </AbsoluteFill>
  );
};

const StoryBackdrop: React.FC<{ activeScenes: StoryScene[] }> = ({ activeScenes }) => {
  const scene = activeScenes[0];
  if (!scene) return null;
  if (scene.visualConcept === "location") {
    return (
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#07111f 0%,#102b46 58%,#1a1714 58%,#090d12 100%)" }}>
        <div style={{ position:"absolute", left:"8%", right:"8%", bottom:"18%", height:"12%", border:"3px solid #cbd5e1", borderRadius:16, background:"#1f2937" }} />
        <div style={{ position:"absolute", left:"16%", bottom:"30%", width:"68%", height:"2px", background:"#94a3b8", opacity:.7 }} />
        <div style={{ position:"absolute", right:"12%", top:"18%", width:18, height:18, borderRadius:"50%", background:"#ffe6a8", boxShadow:"0 0 28px #ffe6a8" }} />
      </AbsoluteFill>
    );
  }
  if (scene.visualConcept === "process") {
    return (
      <AbsoluteFill style={{ background:"linear-gradient(135deg,#101827,#1b2d45)" }}>
        <div style={{ position:"absolute", left:"10%", right:"10%", bottom:"16%", height:"28%", borderRadius:28, background:"#111827", border:"2px solid #334155" }} />
        {["किताब","पेंसिल","कक्षा"].map((label,index) => (
          <div key={label} style={{ position:"absolute", left:`${16+index*27}%`, bottom:`${21+index*2}%`, width:"19%", aspectRatio:"1", borderRadius:"50%", background:index===2?"#ffd400":"#dbeafe", color:"#07111f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26,fontWeight:900 }}>{label}</div>
        ))}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background:"linear-gradient(180deg,#07111f,#18314f)" }}>
      <div style={{ position:"absolute", left:"50%", bottom:"18%", width:"52%", height:"32%", transform:"translateX(-50%)", borderRadius:"22px 22px 8px 8px", background:"#1f2937", border:"3px solid #64748b" }} />
      <div style={{ position:"absolute", left:"50%", bottom:"20%", width:"36%", height:"22%", transform:"translateX(-50%) rotate(-4deg)", borderRadius:12, background:"#a16207", border:"3px solid #facc15" }} />
    </AbsoluteFill>
  );
};

const StorySceneCard: React.FC<{
  scene: StoryScene;
  frame: number;
  fps: number;
  width: number;
  height: number;
}> = ({ scene, frame, fps, width, height }) => {
  const start = Math.round(scene.startSeconds * fps);
  const end = Math.round(scene.endSeconds * fps);
  const enterEnd = start + scene.animation.enterFrames;
  const holdEnd = enterEnd + scene.animation.holdFrames;
  const exitStart = Math.min(end - scene.animation.exitFrames, holdEnd);
  const opacity = interpolate(
    frame,
    [start, enterEnd, exitStart, end],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = width / 1080;
  const left = Math.max(24 * scale, scene.layout.x * scale);
  const top = scene.layout.y * scale;
  const cardWidth = Math.min(scene.layout.width * scale, width - left - 24 * scale);
  const title = typeof scene.visualContent.title === "string"
    ? scene.visualContent.title
    : "";
  const eyebrow = typeof scene.visualContent.eyebrow === "string"
    ? scene.visualContent.eyebrow
    : "";

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: cardWidth,
        minHeight: 180 * scale,
        padding: 28 * scale,
        boxSizing: "border-box",
        borderRadius: 20 * scale,
        borderLeft: `${8 * scale}px solid #ffd400`,
        background: "rgba(7,17,31,.92)",
        color: "white",
        opacity,
        transform: `translateY(${interpolate(opacity, [0, 1], [18 * scale, 0])}px)`,
      }}
    >
      {eyebrow && (
        <div style={{ color: "#ffd400", fontSize: 24 * scale, fontWeight: 800 }}>
          {eyebrow}
        </div>
      )}
      <div
        style={{
          marginTop: 8 * scale,
          fontSize: 42 * scale,
          lineHeight: 1.25,
          fontWeight: 900,
          overflowWrap: "anywhere",
        }}
      >
        {title}
      </div>
    </div>
  );
};
