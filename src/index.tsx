import { Composition, registerRoot } from "remotion";
import { SemanticTalkingHead } from "./compositions/SemanticTalkingHead";
import { SemanticOverlay } from "./compositions/SemanticOverlay";
import { TalkingHead } from "./compositions/TalkingHead";
import { outputSpec } from "./data/runtime";
import { AudioStorytelling } from "./compositions/AudioStorytelling";
import { CinematicStorytelling } from "./compositions/CinematicStorytelling";
import { cinematicPreviewScenes } from "./storytelling/cinematicStoryData";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="TalkingHead"
      component={TalkingHead}
      durationInFrames={1754}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="SemanticTalkingHead"
      component={SemanticTalkingHead}
      durationInFrames={outputSpec.durationInFrames}
      fps={outputSpec.fps}
      width={outputSpec.width}
      height={outputSpec.height}
      defaultProps={{ sourceFile: "source-video-4k30.mp4", timelineFps: outputSpec.fps, durationInFrames: outputSpec.durationInFrames }}
    />
    <Composition
      id="SemanticTalkingHeadPreview"
      component={SemanticTalkingHead}
      durationInFrames={1754}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ sourceFile: "raw-video.mp4", timelineFps: 30, durationInFrames: 1754 }}
    />
    <Composition
      id="SemanticOverlayProbe"
      component={SemanticOverlay}
      durationInFrames={60}
      fps={outputSpec.fps}
      width={outputSpec.width}
      height={outputSpec.height}
      defaultProps={{ timelineFps: outputSpec.fps, timeOffsetSeconds: 20.48 }}
    />
    <Composition
      id="HindiAudioStorytelling"
      component={AudioStorytelling}
      durationInFrames={1800}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        sourceFile: "hindi-narration.mp3",
        scenes: [],
      }}
    />
    <Composition
      id="HindiCinematicPreview"
      component={CinematicStorytelling}
      durationInFrames={540}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        sourceFile: "hindi-story.mp3",
        scenes: cinematicPreviewScenes,
      }}
    />
  </>
);

registerRoot(RemotionRoot);
