import React from "react";

export default function NaplanProtractor() {
  const radius = 190;
  const centerX = radius + 30;
  const centerY = radius + 24;
  const width = centerX * 2;
  const height = radius + 70;

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = ((angleDeg - 180) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  };

  const outerArcPath = () => {
    const start = polarToCartesian(centerX, centerY, radius, 0);
    const end = polarToCartesian(centerX, centerY, radius, 180);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 0 ${end.x} ${end.y}`;
  };

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        background: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(30,64,175,0.20)",
        borderRadius: "18px",
        backdropFilter: "blur(1.5px)",
        WebkitBackdropFilter: "blur(1.5px)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
        overflow: "hidden"
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        {/* transparent semicircle body */}
        <path
          d={`
            M ${centerX - radius} ${centerY}
            A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}
            L ${centerX + radius} ${centerY}
            L ${centerX - radius} ${centerY}
            Z
          `}
          fill="rgba(255,255,255,0.22)"
          stroke="rgba(15,23,42,0.55)"
          strokeWidth="2"
        />

        {/* inner semicircle */}
        <path
          d={`
            M ${centerX - (radius - 42)} ${centerY}
            A ${radius - 42} ${radius - 42} 0 0 1 ${centerX + (radius - 42)} ${centerY}
          `}
          fill="none"
          stroke="rgba(100,116,139,0.28)"
          strokeWidth="1.5"
        />

        {/* baseline */}
        <line
          x1={centerX - radius}
          y1={centerY}
          x2={centerX + radius}
          y2={centerY}
          stroke="rgba(15,23,42,0.85)"
          strokeWidth="2"
        />

        {/* center marker */}
        <circle
          cx={centerX}
          cy={centerY}
          r="5"
          fill="#1e3a8a"
        />

        {/* ticks + labels */}
        {Array.from({ length: 181 }, (_, deg) => {
          const isMajor10 = deg % 10 === 0;
          const isMajor5 = deg % 5 === 0;

          const outer = polarToCartesian(centerX, centerY, radius - 2, deg);

          let tickLength = 10;
          if (isMajor10) tickLength = 24;
          else if (isMajor5) tickLength = 16;

          const inner = polarToCartesian(
            centerX,
            centerY,
            radius - 2 - tickLength,
            deg
          );

          return (
            <line
              key={`tick-${deg}`}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke="rgba(15,23,42,0.85)"
              strokeWidth={isMajor10 ? 2 : 1}
            />
          );
        })}

        {/* outer degree labels: 0..180 */}
        {Array.from({ length: 19 }, (_, i) => {
          const deg = i * 10;
          const pos = polarToCartesian(centerX, centerY, radius - 38, deg);

          return (
            <text
              key={`outer-${deg}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="700"
              fill="#111827"
            >
              {deg}
            </text>
          );
        })}

        {/* inner reverse labels: 180..0 */}
        {Array.from({ length: 19 }, (_, i) => {
          const deg = i * 10;
          const reverseLabel = 180 - deg;
          const pos = polarToCartesian(centerX, centerY, radius - 68, deg);

          return (
            <text
              key={`inner-${deg}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="600"
              fill="#334155"
            >
              {reverseLabel}
            </text>
          );
        })}

        {/* 90 marker */}
        <text
          x={centerX}
          y={centerY - radius + 28}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#1e3a8a"
        >
          90
        </text>
      </svg>
    </div>
  );
}