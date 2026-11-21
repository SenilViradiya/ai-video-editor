import React from "react";
import { interpolate } from "remotion";
import { EffectType, SceneData, SemanticEditEvent } from "../types/editPlan";

export type EffectProps = {
  event: SemanticEditEvent;
  frame: number;
  fps: number;
  scale: number;
};

export const effectRegistry: Record<EffectType, React.FC<EffectProps>> = {
  "kinetic-label": KineticLabel,
  headline: Headline,
  callout: Callout,
  "step-by-step": StepByStep,
  comparison: Comparison,
  diagram: GenericDiagram,
  "punch-in": PunchIn,
};

export function resolveEffect(effectType: EffectType): React.FC<EffectProps> {
  const component = effectRegistry[effectType];
  if (!component) throw new Error(`No renderer is registered for effect ${effectType}`);
  return component;
}

function baseLayout(event: SemanticEditEvent, scale: number) {
  return {
    left: event.layout.x * scale,
    top: event.layout.y * scale,
    width: event.layout.width * scale,
  };
}

function enterOpacity(frame: number, event: SemanticEditEvent, fps: number) {
  const start = Math.round((event.startSeconds ?? event.transcriptSpan.startSeconds) * fps);
  const duration = event.animation?.enterDurationFrames ?? 10;
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function KineticLabel({ event, frame, fps, scale }: EffectProps) {
  const opacity = enterOpacity(frame, event, fps);
  const layout = baseLayout(event, scale);
  return (
    <div style={{
      position: "absolute", left: layout.left, top: layout.top, width: layout.width,
      minHeight: 110 * scale, padding: `${22 * scale}px ${28 * scale}px`,
      boxSizing: "border-box", borderLeft: `${8 * scale}px solid ${event.accentColor}`,
      borderRadius: 16 * scale, background: "rgba(5,8,12,.82)", color: "white",
      opacity, transform: `translateY(${interpolate(opacity,[0,1],[-18,0])}px)`,
      textShadow: "0 2px 6px rgba(0,0,0,.65)",
    }}>
      <div style={{ color: event.accentColor, fontSize: 24 * scale, fontWeight: 800, letterSpacing: 2 }}>
        {event.sceneData?.eyebrow ?? event.concept.toUpperCase()}
      </div>
      <div style={{ marginTop: 8 * scale, fontSize: 44 * scale, fontWeight: 900 }}>
        {event.sceneData?.headline ?? event.text}
      </div>
    </div>
  );
}

export function Headline(props: EffectProps) {
  return <KineticLabel {...props} />;
}

export function Callout({ event, frame, fps, scale }: EffectProps) {
  const opacity = enterOpacity(frame, event, fps);
  const layout = baseLayout(event, scale);
  return (
    <div style={{
      position: "absolute", left: layout.left, top: layout.top, width: layout.width,
      padding: 24 * scale, borderRadius: 18 * scale, border: `${3 * scale}px solid ${event.accentColor}`,
      background: "rgba(8,10,14,.88)", color: "white", opacity,
    }}>
      <div style={{ fontSize: 22 * scale, color: event.accentColor, fontWeight: 800 }}>
        {event.sceneData?.eyebrow ?? "CONTEXT"}
      </div>
      <div style={{ marginTop: 8 * scale, fontSize: 36 * scale, fontWeight: 800 }}>
        {event.sceneData?.headline ?? event.visualExplanation}
      </div>
    </div>
  );
}

export function StepByStep({ event, frame, fps, scale }: EffectProps) {
  const opacity = enterOpacity(frame, event, fps);
  const layout = baseLayout(event, scale);
  const items = event.sceneData?.items ?? [];
  return (
    <div style={{
      position: "absolute", left: layout.left, top: layout.top, width: layout.width,
      padding: 22 * scale, borderRadius: 18 * scale, background: "rgba(8,10,14,.88)",
      color: "white", opacity,
    }}>
      {items.map((item, index) => (
        <div key={item} style={{ display: "flex", alignItems: "center", marginBottom: index === items.length - 1 ? 0 : 12 * scale }}>
          <div style={{
            width: 44 * scale, height: 44 * scale, borderRadius: "50%", background: event.accentColor,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#08100f",
            fontWeight: 900, marginRight: 12 * scale,
          }}>{index + 1}</div>
          <div style={{ fontSize: 32 * scale, fontWeight: 800 }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

export function Comparison({ event, frame, fps, scale }: EffectProps) {
  const opacity = enterOpacity(frame, event, fps);
  const layout = baseLayout(event, scale);
  const left = event.sceneData?.leftValue ?? "";
  const right = event.sceneData?.rightValue ?? "";
  return (
    <div style={{ position:"absolute", left:layout.left, top:layout.top, width:layout.width, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12*scale, opacity }}>
      {[{ label:event.sceneData?.leftLabel, value:left }, { label:event.sceneData?.rightLabel, value:right }].map((item) => (
        <div key={item.label} style={{ padding:20*scale, borderRadius:16*scale, background:"rgba(8,10,14,.88)", color:"white", borderTop:`6px solid ${event.accentColor}` }}>
          <div style={{ fontSize:22*scale, color:event.accentColor, fontWeight:800 }}>{item.label}</div>
          <div style={{ fontSize:34*scale, fontWeight:900, marginTop:8*scale }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function GenericDiagram({ event, frame, fps, scale }: EffectProps) {
  const opacity = enterOpacity(frame, event, fps);
  const layout = baseLayout(event, scale);
  return (
    <div style={{
      position:"absolute", left:layout.left, top:layout.top, width:layout.width,
      padding:20*scale, borderRadius:18*scale, background:"rgba(8,10,14,.88)",
      color:"white", display:"flex", alignItems:"center", gap:12*scale, opacity,
    }}>
      <div style={{ width:54*scale, height:54*scale, borderRadius:"50%", border:`5px solid ${event.accentColor}` }} />
      <div>
        <div style={{ fontSize:22*scale, color:event.accentColor, fontWeight:800 }}>{event.sceneData?.eyebrow ?? "KEY POINT"}</div>
        <div style={{ fontSize:34*scale, fontWeight:900 }}>{event.sceneData?.headline ?? event.text ?? event.concept}</div>
      </div>
    </div>
  );
}

export function PunchIn({ event, frame, fps, scale }: EffectProps) {
  const opacity = enterOpacity(frame, event, fps);
  const layout = baseLayout(event, scale);
  return (
    <div style={{
      position:"absolute", left:layout.left, top:layout.top, width:layout.width,
      padding:20*scale, borderLeft:`8px solid ${event.accentColor}`,
      background:"rgba(8,10,14,.82)", color:"white", opacity,
    }}>
      <div style={{ fontSize:38*scale, fontWeight:900 }}>{event.sceneData?.headline ?? event.text}</div>
    </div>
  );
}
