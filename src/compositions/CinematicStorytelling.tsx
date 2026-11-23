import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StoryScene } from "../storytelling/StorySceneTypes";

type Props = {
  sourceFile: string;
  scenes: StoryScene[];
};

const palette = {
  sky: "#071522",
  horizon: "#15263a",
  platform: "#3d3a38",
  rail: "#aeb7bd",
  warm: "#f6c453",
  coat: "#283b4b",
  skin: "#a96543",
  paper: "#d8c69b",
};

export const CinematicStorytelling: React.FC<Props> = ({ sourceFile, scenes }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const seconds = frame / fps;
  const scene = scenes.find(
    (candidate) => seconds >= candidate.startSeconds && seconds < candidate.endSeconds,
  );
  const sceneProgress = scene
    ? (seconds - scene.startSeconds) / Math.max(0.01, scene.endSeconds - scene.startSeconds)
    : 0;

  return (
    <AbsoluteFill style={{ background: palette.sky, overflow: "hidden" }}>
      <Audio src={staticFile(sourceFile)} />
      {scene ? (
        <CinematicShot
          scene={scene}
          frame={frame}
          sceneProgress={sceneProgress}
          width={width}
          height={height}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const CinematicShot: React.FC<{
  scene: StoryScene;
  frame: number;
  sceneProgress: number;
  width: number;
  height: number;
}> = ({ scene, frame, sceneProgress, width, height }) => {
  const scale = width / 1080;
  const cameraZoom = interpolate(sceneProgress, [0, 1], [1, 1.055], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cameraX = interpolate(sceneProgress, [0, 1], [0, -18 * scale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isDiary = scene.id === "p2-4-diary-closeup";
  const isWaiting = scene.id === "p2-4-waiting-beat";

  return (
    <AbsoluteFill
      style={{
        color: "#fff",
        fontFamily: "Nirmala UI, Mangal, sans-serif",
        background: palette.sky,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -70 * scale,
          transform: `translateX(${cameraX}px) scale(${cameraZoom})`,
          transformOrigin: "center center",
        }}
      >
        <NightSky frame={frame} scale={scale} />
        <StationArchitecture scale={scale} dimmed={isWaiting} />
        <Train frame={frame} scale={scale} departing={scene.id === "p2-4-station-establishing"} />
        <Platform scale={scale} />
        <Teacher
          frame={frame}
          scale={scale}
          closeUp={isDiary}
          waiting={isWaiting}
        />
        {isDiary ? <DiaryCloseUp frame={frame} scale={scale} /> : null}
      </div>
      <SceneCaption scene={scene} progress={sceneProgress} scale={scale} />
      <Vignette />
    </AbsoluteFill>
  );
};

const NightSky: React.FC<{ frame: number; scale: number }> = ({ frame, scale }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#071522 0%,#102b40 64%,#28313a 100%)" }}>
    <div
      style={{
        position: "absolute",
        left: 760 * scale,
        top: 170 * scale,
        width: 76 * scale,
        height: 76 * scale,
        borderRadius: "50%",
        background: "#ffe8ad",
        boxShadow: `0 0 ${28 * scale}px ${10 * scale}px rgba(255,232,173,.22)`,
      }}
    />
    {[0, 1, 2, 3, 4, 5].map((index) => (
      <div
        key={index}
        style={{
          position: "absolute",
          left: (105 + index * 157) * scale,
          top: (130 + (index % 3) * 90) * scale,
          width: (index % 2 ? 4 : 7) * scale,
          height: (index % 2 ? 4 : 7) * scale,
          borderRadius: "50%",
          background: "#dce9ef",
          opacity: 0.35 + ((frame + index * 9) % 25) / 100,
        }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        left: -60 * scale,
        bottom: 610 * scale,
        width: 1220 * scale,
        height: 210 * scale,
        background: "#102435",
        clipPath: "polygon(0 100%, 12% 45%, 25% 78%, 41% 20%, 55% 65%, 71% 28%, 86% 72%, 100% 35%, 100% 100%)",
      }}
    />
  </AbsoluteFill>
);

const StationArchitecture: React.FC<{ scale: number; dimmed: boolean }> = ({ scale, dimmed }) => (
  <div style={{ position: "absolute", left: 55 * scale, bottom: 610 * scale, width: 970 * scale, height: 360 * scale, opacity: dimmed ? 0.68 : 1 }}>
    <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 290 * scale, background: "#7d6757", borderTop: `${8 * scale}px solid #c09a64` }} />
    <div style={{ position: "absolute", left: -25 * scale, top: 0, width: 1020 * scale, height: 50 * scale, background: "#bd8c55", transform: "skewX(-12deg)" } } />
    {[0, 1, 2, 3, 4].map((index) => (
      <div key={index} style={{ position: "absolute", left: (58 + index * 180) * scale, bottom: 100 * scale, width: 100 * scale, height: 125 * scale, background: "#1d2b35", border: `${6 * scale}px solid #d6aa66`, boxShadow: `inset 0 0 ${18 * scale}px rgba(248,196,83,.4)` }} />
    ))}
    <div style={{ position: "absolute", left: 320 * scale, top: 58 * scale, width: 330 * scale, height: 75 * scale, background: "#f1dba4", color: "#263442", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 35 * scale, fontWeight: 800, letterSpacing: 1 }}>
      छोटा स्टेशन
    </div>
    <div style={{ position: "absolute", right: 42 * scale, top: 80 * scale, width: 90 * scale, height: 90 * scale, borderRadius: "50%", border: `${7 * scale}px solid #d6aa66`, background: "#182631", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffe8ad", fontSize: 23 * scale, fontWeight: 800 }}>
      9:30
    </div>
  </div>
);

const Platform: React.FC<{ scale: number }> = ({ scale }) => (
  <>
    <div style={{ position: "absolute", left: -80 * scale, bottom: 0, width: 1240 * scale, height: 620 * scale, background: "linear-gradient(168deg,#58514c 0%,#2d2928 72%)", clipPath: "polygon(0 20%,100% 0,100% 100%,0 100%)" }} />
    <div style={{ position: "absolute", left: -100 * scale, bottom: 485 * scale, width: 1280 * scale, height: 12 * scale, background: "#d0b078" }} />
    {[0, 1, 2].map((index) => (
      <div key={index} style={{ position: "absolute", left: (120 - index * 115) * scale, bottom: 50 * scale, width: 1100 * scale, height: 7 * scale, background: palette.rail, transform: `skewY(${index * -1.5}deg)`, opacity: 0.7 - index * 0.15 }} />
    ))}
  </>
);

const Train: React.FC<{ frame: number; scale: number; departing: boolean }> = ({ frame, scale, departing }) => {
  const travel = departing ? ((frame * 6) % 1700) - 1250 : 160;
  return (
    <div style={{ position: "absolute", left: travel * scale, bottom: 720 * scale, width: 870 * scale, height: 170 * scale, background: "#9b3f35", border: `${7 * scale}px solid #e6b66e`, borderRadius: `${18 * scale}px ${18 * scale}px 0 0`, opacity: departing ? 1 : 0.55 }}>
      <div style={{ position: "absolute", left: 35 * scale, top: 38 * scale, width: 145 * scale, height: 72 * scale, background: "#182832", border: `${5 * scale}px solid #edca88` }} />
      {[0, 1, 2, 3].map((index) => <div key={index} style={{ position: "absolute", left: (230 + index * 145) * scale, top: 38 * scale, width: 100 * scale, height: 72 * scale, background: "#182832", border: `${5 * scale}px solid #edca88` }} />)}
      <div style={{ position: "absolute", right: 28 * scale, bottom: 18 * scale, width: 40 * scale, height: 40 * scale, borderRadius: "50%", background: "#ffe8ad", boxShadow: `0 0 ${22 * scale}px #ffe8ad` }} />
    </div>
  );
};

const Teacher: React.FC<{ frame: number; scale: number; closeUp: boolean; waiting: boolean }> = ({ frame, scale, closeUp, waiting }) => {
  const sway = Math.sin(frame / 16) * 2;
  const left = closeUp ? 380 : 690;
  const bottom = closeUp ? 280 : 365;
  return (
    <div style={{ position: "absolute", left: left * scale, bottom: bottom * scale, width: (closeUp ? 330 : 170) * scale, height: (closeUp ? 610 : 410) * scale, transform: `rotate(${sway}deg)`, transformOrigin: "bottom center", filter: waiting ? "saturate(.65)" : "none" }}>
      <div style={{ position: "absolute", left: "30%", top: 0, width: "40%", aspectRatio: "1", borderRadius: "50%", background: palette.skin, border: `${6 * scale}px solid #4e3229` }} />
      <div style={{ position: "absolute", left: "27%", top: "1%", width: "46%", height: "22%", borderRadius: "50% 50% 35% 35%", background: "#30251f" }} />
      <div style={{ position: "absolute", left: "18%", top: "23%", width: "64%", height: "57%", background: palette.coat, borderRadius: `${30 * scale}px ${30 * scale}px 0 0`, border: `${6 * scale}px solid #172936` }} />
      <div style={{ position: "absolute", left: "1%", top: "32%", width: "30%", height: "10%", background: palette.skin, borderRadius: 30, transform: "rotate(-25deg)" }} />
      <div style={{ position: "absolute", right: "3%", top: "37%", width: "31%", height: "10%", background: palette.skin, borderRadius: 30, transform: `rotate(${closeUp ? 18 : 28}deg)` }} />
      <div style={{ position: "absolute", left: "35%", bottom: 0, width: "12%", height: "28%", background: "#17232d", transform: "rotate(5deg)" }} />
      <div style={{ position: "absolute", right: "35%", bottom: 0, width: "12%", height: "28%", background: "#17232d", transform: "rotate(-5deg)" }} />
      {!closeUp && <DiaryCloseUp frame={frame} scale={scale} compact />}
    </div>
  );
};

const DiaryCloseUp: React.FC<{ frame: number; scale: number; compact?: boolean }> = ({ frame, scale, compact = false }) => {
  const open = interpolate(Math.sin(frame / 22), [-1, 1], [0.12, 0.92]);
  const size = compact ? 105 : 330;
  return (
    <div style={{ position: "absolute", left: (compact ? 45 : 320) * scale, bottom: (compact ? 145 : 150) * scale, width: size * scale, height: (compact ? 82 : 235) * scale, transform: `rotate(${compact ? -12 : -7}deg)`, transformOrigin: "center", zIndex: 5 }}>
      <div style={{ position: "absolute", inset: 0, background: palette.paper, border: `${6 * scale}px solid #714a2c`, borderRadius: 8 * scale, transform: `perspective(500px) rotateY(${-12 * open}deg)`, transformOrigin: "right center", boxShadow: `0 ${12 * scale}px ${22 * scale}px rgba(0,0,0,.4)` }}>
        <div style={{ position: "absolute", left: "15%", top: "22%", width: "66%", height: `${3 * scale}px`, background: "#987d58" }} />
        <div style={{ position: "absolute", left: "15%", top: "42%", width: "55%", height: `${3 * scale}px`, background: "#987d58" }} />
      </div>
      <div style={{ position: "absolute", left: "50%", top: 0, width: `${5 * scale}px`, height: "100%", background: "#6d4527" }} />
    </div>
  );
};

const SceneCaption: React.FC<{ scene: StoryScene; progress: number; scale: number }> = ({ scene, progress, scale }) => {
  const opacity = interpolate(progress, [0, 0.12, 0.82, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const title = typeof scene.visualContent.title === "string" ? scene.visualContent.title : "";
  return (
    <div style={{ position: "absolute", left: 72 * scale, top: 134 * scale, opacity, textShadow: "0 3px 12px rgba(0,0,0,.8)" }}>
      <div style={{ color: palette.warm, fontSize: 30 * scale, fontWeight: 800, letterSpacing: 1 }}>एक छोटी कहानी</div>
      <div style={{ marginTop: 10 * scale, fontSize: 62 * scale, lineHeight: 1.08, fontWeight: 900 }}>{title}</div>
    </div>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", boxShadow: "inset 0 0 180px rgba(0,0,0,.62)" }} />
);
