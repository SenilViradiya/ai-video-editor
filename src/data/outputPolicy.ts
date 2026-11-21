export type SourceMetadata = {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  sampleAspectRatio?: string | null;
};

export type OutputSpec = {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  durationInFrames: number;
  orientation: "portrait" | "landscape";
  scaled: boolean;
  fpsConversion: "none" | "60-to-30" | "59.94-to-29.97" | "50-to-25" | "capped-to-30";
  maxWidth: number;
  maxHeight: number;
};

const UHD = {
  portrait: { width: 2160, height: 3840 },
  landscape: { width: 3840, height: 2160 },
} as const;

function even(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2);
}

function aspectRatioValue(value: string | null | undefined): number {
  if (!value || value === "N/A") return 1;
  const [numerator, denominator] = value.split(":").map(Number);
  return numerator > 0 && denominator > 0 ? numerator / denominator : 1;
}

function targetFps(sourceFps: number): Pick<OutputSpec, "fps" | "fpsConversion"> {
  if (sourceFps <= 30) return { fps: sourceFps, fpsConversion: "none" };
  if (Math.abs(sourceFps - 60) < 0.01) return { fps: 30, fpsConversion: "60-to-30" };
  if (Math.abs(sourceFps - 59.94) < 0.01) return { fps: 29.97, fpsConversion: "59.94-to-29.97" };
  if (Math.abs(sourceFps - 50) < 0.01) return { fps: 25, fpsConversion: "50-to-25" };
  return { fps: 30, fpsConversion: "capped-to-30" };
}

export function deriveOutputSpec(source: SourceMetadata): OutputSpec {
  if (
    !Number.isFinite(source.width) ||
    !Number.isFinite(source.height) ||
    source.width <= 0 ||
    source.height <= 0 ||
    !Number.isFinite(source.fps) ||
    source.fps <= 0 ||
    !Number.isFinite(source.durationSeconds) ||
    source.durationSeconds <= 0
  ) {
    throw new Error("Source metadata is incomplete or invalid");
  }

  const orientation = source.width >= source.height ? "landscape" : "portrait";
  const envelope = UHD[orientation];
  const displayWidth = source.width * aspectRatioValue(source.sampleAspectRatio);
  const scale = Math.min(1, envelope.width / displayWidth, envelope.height / source.height);
  const width = even(displayWidth * scale);
  const height = even(source.height * scale);
  const frameRate = targetFps(source.fps);

  return {
    width,
    height,
    fps: frameRate.fps,
    durationSeconds: source.durationSeconds,
    durationInFrames: Math.max(1, Math.round(source.durationSeconds * frameRate.fps)),
    orientation,
    scaled: scale < 1,
    fpsConversion: frameRate.fpsConversion,
    maxWidth: envelope.width,
    maxHeight: envelope.height,
  };
}
