export type ReviewStatus = "approved" | "review_required" | "blocked";

export type EffectType =
  | "kinetic-label"
  | "headline"
  | "callout"
  | "step-by-step"
  | "comparison"
  | "diagram"
  | "punch-in";

export type AnimationParams = {
  enterDurationFrames?: number;
  exitDurationFrames?: number;
  easing?: "linear" | "ease-out" | "spring";
  direction?: "left" | "right" | "up" | "down";
  emphasis?: "subtle" | "strong";
};

export type SceneData = {
  headline?: string;
  eyebrow?: string;
  items?: string[];
  leftLabel?: string;
  rightLabel?: string;
  leftValue?: string;
  rightValue?: string;
};

export type ReferencedAsset = {
  assetId: string;
  role: "broll" | "illustration" | "sfx";
  required: boolean;
};

export type Layout = {
  anchor: "top" | "center" | "bottom";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AudioCue = {
  assetId: string;
  startSeconds: number;
  durationSeconds: number;
  reason: string;
};

export type SemanticEditEvent = {
  id: string;
  sourceMediaId: string;
  transcriptSpan: {
    startSeconds: number;
    endSeconds: number;
    text: string;
    word?: string;
  };
  concept: string;
  meaning: string;
  visualExplanation: string;
  referenceTechniqueId: string;
  effectType: EffectType;
  layout: Layout;
  text?: string;
  accentColor: string;
  audioCues: AudioCue[];
  confidence: number;
  reviewStatus: ReviewStatus;
  decisionReason: string;
  creativeIntent?: string;
  selectionRationale?: string;
  startSeconds?: number;
  endSeconds?: number;
  animation?: AnimationParams;
  sceneData?: SceneData;
  referencedAssets?: ReferencedAsset[];
  skipOrBlockReason?: string;
};

export type EditPlan = {
  schemaVersion: "1.0" | "1.1";
  planId: string;
  sourceMediaId: string;
  generatedAt: string;
  sourceDurationSeconds: number;
  sourceFps: number;
  events: SemanticEditEvent[];
};

const effectTypes = new Set<EffectType>([
  "kinetic-label",
  "headline",
  "callout",
  "step-by-step",
  "comparison",
  "diagram",
  "punch-in",
]);

export function validateEditPlan(value: unknown): EditPlan {
  if (!value || typeof value !== "object") {
    throw new Error("Edit plan must be an object");
  }

  const plan = value as Partial<EditPlan>;
  if ((plan.schemaVersion !== "1.0" && plan.schemaVersion !== "1.1") || typeof plan.planId !== "string") {
    throw new Error("Edit plan has an unsupported schema or missing planId");
  }
  if (typeof plan.sourceMediaId !== "string" || typeof plan.sourceFps !== "number") {
    throw new Error("Edit plan is missing source identity or FPS");
  }
  if (!Array.isArray(plan.events)) {
    throw new Error("Edit plan events must be an array");
  }

  const ids = new Set<string>();
  for (const event of plan.events) {
    if (
      typeof event.id !== "string" ||
      ids.has(event.id) ||
      typeof event.sourceMediaId !== "string" ||
      typeof event.transcriptSpan?.startSeconds !== "number" ||
      typeof event.transcriptSpan?.endSeconds !== "number" ||
      event.transcriptSpan.endSeconds <= event.transcriptSpan.startSeconds ||
      event.transcriptSpan.startSeconds < 0 ||
      typeof event.confidence !== "number" ||
      event.confidence < 0 ||
      event.confidence > 1 ||
      !effectTypes.has(event.effectType)
    ) {
      throw new Error(`Invalid semantic edit event: ${event.id ?? "unknown"}`);
    }
    if (event.reviewStatus === "approved" && event.confidence < 0.8) {
      throw new Error(`Approved event ${event.id} must have confidence >= 0.8`);
    }
    ids.add(event.id);
  }

  return plan as EditPlan;
}
