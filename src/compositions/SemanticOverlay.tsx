import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { editPlan } from "../data/runtime";
import { PlanEvent } from "./SemanticTalkingHead";

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
        <PlanEvent
          key={event.id}
          event={event}
          timelineFps={timelineFps}
          width={width}
          height={height}
          frameOffset={Math.round(timeOffsetSeconds * timelineFps)}
        />
      ))}
    </AbsoluteFill>
  );
};
