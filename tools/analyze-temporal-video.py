import json
import sys
from pathlib import Path

import cv2
import numpy as np

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
manifest = json.loads((root / "analysis" / "media-manifest.json").read_text(encoding="utf-8"))
output = root / "analysis" / "reference-profiles"
output.mkdir(parents=True, exist_ok=True)
source_output = root / "analysis" / "source-visual-analysis"
source_output.mkdir(parents=True, exist_ok=True)

profiles = []
high_frequency_sequences = []

def analyze_reference(entry):
    video_path = root / entry["path"]
    capture = cv2.VideoCapture(str(video_path))
    fps = capture.get(cv2.CAP_PROP_FPS) or entry["metadata"]["fps"]
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps else entry["metadata"]["durationSeconds"]
    sample_times = np.arange(0.0, min(duration, entry["metadata"]["durationSeconds"]), 0.5)
    previous = None
    samples = []
    peak_frames = {}

    for index, seconds in enumerate(sample_times):
        capture.set(cv2.CAP_PROP_POS_MSEC, float(seconds * 1000))
        ok, frame = capture.read()
        if not ok:
            continue
        small = cv2.resize(frame, (180, 320))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        if previous is not None:
            diff = cv2.absdiff(gray, previous)
            mean = float(diff.mean())
            _, mask = cv2.threshold(diff, 18, 255, cv2.THRESH_BINARY)
            ys, xs = np.where(mask > 0)
            bounds = None
            if len(xs) >= 20:
                bounds = {
                    "x": int(xs.min()),
                    "y": int(ys.min()),
                    "width": int(xs.max() - xs.min()),
                    "height": int(ys.max() - ys.min()),
                }
            samples.append({
                "startSeconds": float(seconds),
                "frameDifference": mean,
                "changedBounds180x320": bounds,
            })
            if mean >= 0:
                peak_frames[float(seconds)] = (mean, frame.copy(), small)
        previous = gray
    capture.release()

    if samples:
        differences = np.array([item["frameDifference"] for item in samples])
        threshold = float(differences.mean() + differences.std() * 1.25)
        peaks = [item for item in samples if item["frameDifference"] >= threshold]
    else:
        threshold = 0.0
        peaks = []

    intervals = []
    evidence_frames = []
    for peak in peaks:
        start = peak["startSeconds"]
        nearby = [item for item in samples if item["startSeconds"] >= start and item["startSeconds"] <= start + 1.5]
        end = nearby[-1]["startSeconds"] if nearby else start
        overlap = next((interval for interval in intervals if start <= interval["endSeconds"] + 0.75), None)
        if overlap:
            overlap["endSeconds"] = max(overlap["endSeconds"], end)
            overlap["peakFrameDifference"] = max(overlap["peakFrameDifference"], peak["frameDifference"])
            continue
        interval = {
            "startSeconds": start,
            "endSeconds": end,
            "peakFrameDifference": peak["frameDifference"],
        }
        intervals.append(interval)

    for index, interval in enumerate(intervals[:12]):
        capture = cv2.VideoCapture(str(video_path))
        capture.set(cv2.CAP_PROP_POS_MSEC, interval["startSeconds"] * 1000)
        ok, frame = capture.read()
        capture.release()
        if ok:
            evidence_path = output / entry["id"] / f"motion-{index + 1:02d}.jpg"
            evidence_path.parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(evidence_path), frame)
            evidence_frames.append(str(evidence_path.relative_to(root)).replace("\\", "/"))

    focused_intervals = sorted(intervals, key=lambda item: item["peakFrameDifference"], reverse=True)[:1]
    for intervalIndex, interval in enumerate(focused_intervals):
        sequence = []
        capture = cv2.VideoCapture(str(video_path))
        fps = capture.get(cv2.CAP_PROP_FPS) or entry["metadata"]["fps"]
        start = max(0.0, interval["startSeconds"])
        end = min(entry["metadata"]["durationSeconds"], interval["endSeconds"])
        seconds = start
        frameIndex = 0
        previous = None
        while seconds <= end:
            capture.set(cv2.CAP_PROP_POS_MSEC, seconds * 1000)
            ok, frame = capture.read()
            if ok:
                frameEvidence = output / entry["id"] / f"focused-{intervalIndex + 1:02d}-{frameIndex:02d}.jpg"
                frameEvidence.parent.mkdir(parents=True, exist_ok=True)
                cv2.imwrite(str(frameEvidence), frame)
                small = cv2.resize(frame, (180, 320))
                gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
                difference = None
                changedBounds = None
                if previous is not None:
                    absdiff = cv2.absdiff(gray, previous)
                    difference = float(absdiff.mean())
                    _, mask = cv2.threshold(absdiff, 18, 255, cv2.THRESH_BINARY)
                    ys, xs = np.where(mask > 0)
                    if len(xs) >= 20:
                        changedBounds = {
                            "x": int(xs.min()),
                            "y": int(ys.min()),
                            "width": int(xs.max() - xs.min()),
                            "height": int(ys.max() - ys.min()),
                        }
                sequence.append({
                    "timeSeconds": float(seconds),
                    "frameDifferenceFromPrevious": difference,
                    "changedBounds180x320": changedBounds,
                    "evidenceFrame": str(frameEvidence.relative_to(root)).replace("\\", "/"),
                })
                previous = gray
                frameIndex += 1
            seconds += 0.1
        capture.release()
        high_frequency_sequences.append({
            "referenceMediaId": entry["id"],
            "candidateStartSeconds": start,
            "candidateEndSeconds": end,
            "sampleRateHz": 10,
            "method": "opencv_consecutive_frame_difference",
            "frames": sequence,
            "limitations": [
                "No OCR or text bounding-box model was available.",
                "Frame differences are not proof of typography, easing, masks, or exact keyframes.",
            ],
        })

    profile = {
        "schemaVersion": "1.0",
        "referenceMediaId": entry["id"],
        "sourceSha256": entry["sha256"],
        "method": "opencv_adjacent_frame_difference_and_change_bounds",
        "sampleRateHz": 2,
        "threshold": threshold,
        "measuredMotionIntervals": intervals,
        "evidenceFrames": evidence_frames,
        "limitations": [
            "Pixel motion is not proof of typography, easing, masks, or camera motion.",
            "Exact animation category remains visually review-gated.",
        ],
    }
    profiles.append(profile)

for entry in manifest["entries"]:
    if entry["role"] == "reference":
        analyze_reference(entry)

primary = next(entry for entry in manifest["entries"] if entry["id"] == manifest["primaryMediaId"])
capture = cv2.VideoCapture(str(root / primary["path"]))
fps = capture.get(cv2.CAP_PROP_FPS) or primary["metadata"]["fps"]
duration = primary["metadata"]["durationSeconds"]
face_cascade = None
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
except Exception:
    face_cascade = None
sample_times = [0.0, duration * 0.25, duration * 0.5, duration * 0.75, duration - 1.0]
face_samples = []
for index, seconds in enumerate(sample_times):
    capture.set(cv2.CAP_PROP_POS_MSEC, max(0.0, seconds) * 1000)
    ok, frame = capture.read()
    if not ok:
        continue
    small = cv2.resize(frame, (270, 480))
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    faces = []
    if face_cascade is not None:
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
    converted = [{
        "x": int(x * primary["metadata"]["width"] / 270),
        "y": int(y * primary["metadata"]["height"] / 480),
        "width": int(w * primary["metadata"]["width"] / 270),
        "height": int(h * primary["metadata"]["height"] / 480),
    } for x, y, w, h in faces]
    evidence = source_output / f"source-face-{index + 1:02d}.jpg"
    cv2.imwrite(str(evidence), frame)
    face_samples.append({
        "startSeconds": float(max(0.0, seconds)),
        "faceBoundsSourceResolution": converted,
        "evidenceFrame": str(evidence.relative_to(root)).replace("\\", "/"),
    })
capture.release()

source_profile = {
    "schemaVersion": "1.0",
    "sourceMediaId": primary["id"],
    "sourceSha256": primary["sha256"],
    "method": "haar_frontal_face_detection_with_safe_layout_fallback",
    "faceSamples": face_samples,
    "layoutRecommendation": {
        "portrait": {"anchor": "top", "x": 70, "y": 150, "width": 940, "height": 190, "safeRegion": "top"},
        "landscape": {"anchor": "top", "x": 120, "y": 80, "width": 1100, "height": 180, "safeRegion": "top"},
    },
    "limitations": ["Face detection is not identity or gesture analysis.", "Layout remains conservative until face bounds are stable."],
}

(output / "temporal-reference-profiles.json").write_text(json.dumps({"schemaVersion": "1.0", "profiles": profiles, "highFrequencySequences": high_frequency_sequences}, indent=2) + "\n", encoding="utf-8")
(source_output / "source-layout-profile.json").write_text(json.dumps(source_profile, indent=2) + "\n", encoding="utf-8")
print(f"Analyzed {len(profiles)} reference temporal profiles and source layout evidence.")
