import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { editPlan } from "../data/runtime";
import { resolveEffect } from "../effects/EffectRegistry";

type SemanticOverlayProps = {
  timelineFps: number;
  timeOffsetSeconds: number;
};

export const SemanticOverlay: React.FC<SemanticOverlayProps> = ({
  timelineFps,
  timeOffsetSeconds,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seconds = timeOffsetSeconds + frame / timelineFps;
  const activeEvents = editPlan.events.filter(
    (event) =>
      event.reviewStatus === "approved" &&
      seconds >= event.transcriptSpan.startSeconds &&
      seconds <= event.transcriptSpan.endSeconds + 1.2,
  );

  return (
    <AbsoluteFill>
      {activeEvents.map((event) => (
        (() => {
          const Effect = resolveEffect(event.effectType);
          return (
            <Effect
              key={event.id}
              event={{ ...event, startSeconds: event.startSeconds ?? event.transcriptSpan.startSeconds }}
              frame={frame + Math.round(timeOffsetSeconds * timelineFps)}
              fps={timelineFps}
              scale={width / 1080}
            />
          );
        })()
      ))}
    </AbsoluteFill>
  );
};
