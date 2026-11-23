import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const transcript = JSON.parse(await fs.readFile(path.join(root, "analysis", "hindi-story-transcript.json"), "utf8"));
const inputSelection = JSON.parse(await fs.readFile(path.join(root, "analysis", "input-mode-selection.json"), "utf8"));

const previewScenes = [
  {
    id: "hindi-candidate-hook",
    startSeconds: 0,
    endSeconds: 7.44,
    narrativeRole: "hook",
    spokenHindi: "हर रात साढ़े 9 बजे, एक छोटे रेलवे स्टेशन पर...",
    factualVerification: "candidate",
    visualConcept: "location",
    visualContent: { eyebrow:"कहानी का आरंभ", title:"रात 9 बजे\nरेलवे स्टेशन" },
    referenceTechniqueId: null,
    effectComponentId: "story-location",
    animation: { enterFrames: 12, holdFrames: 75, exitFrames: 12, easing:"ease-out" },
    layout: { x:70, y:520, width:940, height:220 },
    assets: [],
    sfxCue:null,
  },
  {
    id: "hindi-candidate-diary",
    startSeconds: 7.44,
    endSeconds: 13.14,
    narrativeRole: "character",
    spokenHindi: "एक पुरानी डायरी...",
    factualVerification: "candidate",
    visualConcept: "process",
    visualContent: { eyebrow:"अकेली चीज़", title:"पुरानी डायरी" },
    referenceTechniqueId: null,
    effectComponentId:"story-motif",
    animation: { enterFrames:12, holdFrames:55, exitFrames:12, easing:"ease-out" },
    layout: { x:70, y:520, width:940, height:220 },
    assets:[],
    sfxCue:null,
  },
  {
    id: "hindi-candidate-question",
    startSeconds: 18.36,
    endSeconds: 24.26,
    narrativeRole:"turning_point",
    spokenHindi:"चौकीदार का प्रश्न...",
    factualVerification:"candidate",
    visualConcept:"callout",
    visualContent:{ eyebrow:"एक सवाल", title:"रोज़ यहाँ किसका इंतज़ार?" },
    referenceTechniqueId:null,
    effectComponentId:"story-callout",
    animation:{ enterFrames:10, holdFrames:50, exitFrames:12, easing:"ease-out" },
    layout:{ x:70,y:520,width:940,height:220 },
    assets:[],
    sfxCue:null,
  },
  {
    id:"hindi-candidate-answer",
    startSeconds:24.74,
    endSeconds:30,
    narrativeRole:"cause_effect",
    spokenHindi:"वह मुस्कुराता है...",
    factualVerification:"candidate",
    visualConcept:"callout",
    visualContent:{ eyebrow:"रहस्य खुलता है", title:"कोई नहीं—मैं बच्चों के लिए आता हूँ" },
    referenceTechniqueId:null,
    effectComponentId:"story-callout",
    animation:{ enterFrames:10, holdFrames:45, exitFrames:12, easing:"ease-out" },
    layout:{ x:70,y:520,width:940,height:220 },
    assets:[],
    sfxCue:null,
  },
];

const plan = {
  schemaVersion:"1.0",
  source:"input/raw-audio/hindi-story.mp3",
  sourceSha256:transcript.sourceSha256,
  sourceMode:"audio_storytelling",
  durationSeconds:transcript.duration,
  target: { width:1080,height:1920,fps:30,codec:"h264",audioCodec:"aac" },
  status:"candidate_review_required",
  transcriptVerifiedCount:0,
  scenes:previewScenes,
  reviewRequired:previewScenes.map((scene)=>scene.id),
  limitations:[
    "The faster-whisper candidate uses an incorrect Urdu-script output for some narrative words.",
    "On-screen Devanagari lines are interpretive summaries, not human-verified verbatim subtitles.",
    "No SFX or supplied assets are present.",
  ],
};
await fs.writeFile(path.join(root,"analysis","hindi-story-scene-plan.json"),`${JSON.stringify(plan,null,2)}\n`);
await fs.writeFile(path.join(root,"analysis","hindi-story-preview-plan.json"),`${JSON.stringify({
  sourceFile:"hindi-story.mp3",
  startSeconds:0,
  endSeconds:30,
  scenes:previewScenes,
},null,2)}\n`);
console.log(`Hindi story scene plan written with ${previewScenes.length} candidate scenes.`);
