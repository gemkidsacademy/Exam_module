import React from "react";
import "./NaplanProtractor.css";

export default function NaplanProtractor() {
  const outerR = 300;
  const innerR = 210;
  const holeR = 58;
  const cx = 320;
  const cy = 310;

  const polarToCartesian = (deg, radius) => {
    const rad = ((deg - 180) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  };

  const arcPath = (radius) => {
    const start = polarToCartesian(0, radius);
    const end = polarToCartesian(180, radius);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  };

  const ticks = [];
  const radialLines = [];
  const outerLabels = [];
  const innerLabels = [];

  for (let deg = 0; deg <= 180; deg += 1) {
    const isMajor = deg % 10 === 0;
    const isMid = deg % 5 === 0;

    let tickLen = 8;
    if (isMajor) tickLen = 22;
    else if (isMid) tickLen = 14;

    const outer = polarToCartesian(deg, outerR);
    const inner = polarToCartesian(deg, outerR - tickLen);

    ticks.push(
      <line
        key={`tick-${deg}`}
        x1={outer.x}
        y1={outer.y}
        x2={inner.x}
        y2={inner.y}
        className={isMajor ? "protractor-tick-major" : "protractor-tick-minor"}
      />
    );

    if (deg % 10 === 0) {
      // outer scale (0 → 180)
      const outerPos = polarToCartesian(deg, outerR - 42);

      // inner scale (180 → 0)
      const innerPos = polarToCartesian(deg, innerR + 28);

      outerLabels.push(
        <text
          key={`outer-${deg}`}
          x={outerPos.x}
          y={outerPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="protractor-label outer"
        >
          {deg}
        </text>
      );

      // avoid clutter at 0 / 180 / 90 on inner row
      if (deg !== 0 && deg !== 180 && deg !== 90) {
        innerLabels.push(
          <text
            key={`inner-${deg}`}
            x={innerPos.x}
            y={innerPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="protractor-label inner"
          >
            {180 - deg}
          </text>
        );
      }

      // radial guide lines
      if (deg > 0 && deg < 180) {
        const radialEnd = polarToCartesian(deg, innerR);
        radialLines.push(
          <line
            key={`radial-${deg}`}
            x1={cx}
            y1={cy}
            x2={radialEnd.x}
            y2={radialEnd.y}
            className="protractor-radial"
          />
        );
      }
    }
  }

  return (
    <div className="naplan-protractor">
      <svg
        viewBox="0 0 640 340"
        className="naplan-protractor-svg"
        aria-label="Protractor"
      >
        {/* Main translucent body */}
        <path
          d={`
            M ${cx - outerR} ${cy}
            A ${outerR} ${outerR} 0 0 1 ${cx + outerR} ${cy}
            L ${cx + innerR} ${cy}
            A ${innerR} ${innerR} 0 0 0 ${cx - innerR} ${cy}
            Z
          `}
          className="protractor-fill"
        />

        {/* outer + inner arc */}
        <path d={arcPath(outerR)} className="protractor-outer-arc" />
        <path d={arcPath(innerR)} className="protractor-inner-arc" />

        {/* base line */}
        <line
          x1={cx - outerR}
          y1={cy}
          x2={cx + outerR}
          y2={cy}
          className="protractor-base"
        />

        {/* centre hole */}
        <path
          d={`
            M ${cx - holeR} ${cy}
            A ${holeR} ${holeR} 0 0 1 ${cx + holeR} ${cy}
          `}
          className="protractor-hole"
        />
        <line
          x1={cx - holeR}
          y1={cy}
          x2={cx + holeR}
          y2={cy}
          className="protractor-hole"
        />

        {/* center vertical line */}
        <line
          x1={cx}
          y1={cy - holeR}
          x2={cx}
          y2={cy}
          className="protractor-center-line"
        />

        {/* radial guide lines */}
        {radialLines}

        {/* ticks */}
        {ticks}

        {/* labels */}
        {outerLabels}
        {innerLabels}

        {/* top label */}
        <text
          x={cx}
          y={36}
          textAnchor="middle"
          className="protractor-top-label"
        >
          90°
        </text>

        {/* center dot */}
        <circle cx={cx} cy={cy} r="3.5" className="protractor-center-dot" />
      </svg>
    </div>
  );
} 