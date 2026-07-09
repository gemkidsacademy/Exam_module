import React from "react";

export default function NaplanRuler() {
  const totalCm = 15;
  const pxPerCm = 28;
  const rulerWidth = totalCm * pxPerCm;

  return (
    <div
      style={{
        position: "relative",
        width: `${rulerWidth + 32}px`,
        padding: "14px 16px 24px 16px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.14)",
        backdropFilter: "blur(1.5px)",
        WebkitBackdropFilter: "blur(1.5px)",
        border: "1px solid rgba(30,64,175,0.22)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.10)"
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${rulerWidth}px`,
          height: "90px",
          margin: "0 auto",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.22)",
          border: "1px solid rgba(100,116,139,0.35)",
          overflow: "hidden"
        }}
      >
        {/* baseline */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "28px",
            height: "2px",
            background: "rgba(30,41,59,0.72)"
          }}
        />

        {/* mm / cm ticks */}
        {Array.from({ length: totalCm * 10 + 1 }, (_, i) => {
          const left = i * (pxPerCm / 10);
          const isCm = i % 10 === 0;
          const isHalf = i % 5 === 0 && !isCm;

          let tickHeight = 14;
          if (isCm) tickHeight = 40;
          else if (isHalf) tickHeight = 26;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${left}px`,
                bottom: "28px",
                width: isCm ? "2px" : "1px",
                height: `${tickHeight}px`,
                background: "rgba(15,23,42,0.88)"
              }}
            />
          );
        })}

        {/* labels */}
        {Array.from({ length: totalCm + 1 }, (_, cm) => {
          const left = cm * pxPerCm;
          return (
            <div
              key={cm}
              style={{
                position: "absolute",
                left: `${left}px`,
                bottom: "6px",
                transform: cm === 0 ? "translateX(0)" : "translateX(-50%)",
                fontSize: "16px",
                fontWeight: 700,
                color: "#1e3a8a",
                textShadow: "0 1px 0 rgba(255,255,255,0.55)"
              }}
            >
              {cm}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "10px",
          textAlign: "center",
          fontSize: "15px",
          fontWeight: 700,
          color: "#1e3a8a",
          textShadow: "0 1px 0 rgba(255,255,255,0.5)"
        }}
      >
        centimetres
      </div>
    </div>
  );
}