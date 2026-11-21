import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  Video,
} from "remotion";
import { editPlan, sourceDurationInFrames, sourceFps } from "../data/runtime";
import { SemanticEditEvent } from "../types/editPlan";

type SemanticTalkingHeadProps = {
  sourceFile?: string;
  timelineFps?: number;
  durationInFrames?: number;
};

export const SemanticTalkingHead: React.FC<SemanticTalkingHeadProps> = ({
  sourceFile = "source-video.mp4",
  timelineFps = sourceFps,
  durationInFrames = sourceDurationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seconds = frame / timelineFps;
  const zoom = interpolate(
    frame,
    [0, durationInFrames * 0.25, durationInFrames * 0.55, durationInFrames],
    [1, 1.025, 1.01, 1.02],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const activeEvents = editPlan.events.filter(
    (event) =>
      event.reviewStatus === "approved" &&
      seconds >= event.transcriptSpan.startSeconds &&
      seconds <= event.transcriptSpan.endSeconds + 1.2,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Video
          src={staticFile(sourceFile)}
          muted={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {activeEvents.map((event) => (
        <PlanEvent key={event.id} event={event} timelineFps={timelineFps} width={width} height={height} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8, background: "#ffffff33" }}>
        <div
          style={{
            height: "100%",
            width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`,
            background: "#ffd400",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const PlanEvent: React.FC<{
  event: SemanticEditEvent;
  timelineFps: number;
  width: number;
  height: number;
  frameOffset?: number;
}> = ({ event, timelineFps, width, height, frameOffset = 0 }) => {
  const frame = useCurrentFrame() + frameOffset;
  const start = Math.round(event.transcriptSpan.startSeconds * timelineFps);
  const scale = width / 1080;
  const opacity = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(opacity, [0, 1], [-18, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${(event.layout.x * scale / width) * 100}%`,
        top: `${(event.layout.y * scale / height) * 100}%`,
        width: `${(event.layout.width * scale / width) * 100}%`,
        minHeight: 110 * scale,
        padding: `${22 * scale}px ${28 * scale}px`,
        boxSizing: "border-box",
        borderLeft: `${8 * scale}px solid ${event.accentColor}`,
        borderRadius: 16 * scale,
        background: "rgba(5, 8, 12, 0.82)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        opacity,
        transform: `translateY(${translateY}px)`,
        textShadow: "0 2px 6px rgba(0,0,0,0.65)",
      }}
    >
      <div style={{ color: event.accentColor,       fontSize: 24 * scale, fontWeight: 800, letterSpacing: 2 }}>
        {event.concept.toUpperCase()}
      </div>
      <div style={{ marginTop: 8 * scale, fontSize: 44 * scale, fontWeight: 900 }}>{event.text}</div>
    </div>
  );
};
