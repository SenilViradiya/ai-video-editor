import manifestJson from "../../analysis/media-manifest.json";
import planJson from "../../analysis/semantic-edit-plan.json";
import { EditPlan, validateEditPlan } from "../types/editPlan";
import { deriveOutputSpec } from "./outputPolicy";

export type MediaManifest = {
  schemaVersion: "1.0";
  primaryMediaId: string;
  entries: Array<{
    id: string;
    role: "primary_source" | "reference" | "asset" | "proxy";
    path: string;
    metadata: {
      width: number;
      height: number;
      fps: number;
      durationSeconds: number;
      audioStreams: number;
      sampleAspectRatio?: string | null;
    };
  }>;
};

export const mediaManifest = manifestJson as MediaManifest;
export const editPlan: EditPlan = validateEditPlan(planJson);
export const primaryMedia = mediaManifest.entries.find(
  (entry) => entry.id === mediaManifest.primaryMediaId,
);

if (!primaryMedia) {
  throw new Error(`Primary media ${mediaManifest.primaryMediaId} is missing from the manifest`);
}

export const sourceWidth = primaryMedia.metadata.width;
export const sourceHeight = primaryMedia.metadata.height;
export const sourceFps = primaryMedia.metadata.fps;
export const sourceDurationInFrames = Math.round(primaryMedia.metadata.durationSeconds * sourceFps);
export const outputSpec = deriveOutputSpec(primaryMedia.metadata);
export const renderSourceFile = "source-video-4k30.mp4";
