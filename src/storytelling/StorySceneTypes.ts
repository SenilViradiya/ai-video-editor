export type StoryInputMode = "video_enhancement" | "audio_storytelling";

export type StoryScene = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  narrativeRole:
    | "hook"
    | "character"
    | "place"
    | "background"
    | "event"
    | "cause_effect"
    | "challenge"
    | "turning_point"
    | "fact"
    | "resolution";
  spokenHindi: string;
  factualVerification: "verified" | "candidate" | "review_required";
  visualConcept: "no_effect" | "hook_typography" | "timeline" | "location" | "comparison" | "process" | "callout";
  visualContent: Record<string, unknown>;
  referenceTechniqueId: string | null;
  effectComponentId: string;
  animation: {
    enterFrames: number;
    holdFrames: number;
    exitFrames: number;
    easing: "linear" | "ease-out" | "spring";
  };
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  assets: string[];
  sfxCue: null | {
    assetId: string;
    startSeconds: number;
    durationSeconds: number;
    gainDb: number;
  };
};
