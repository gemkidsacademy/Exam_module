import React, { useMemo, useState } from "react";
import "./NaplanCalculator.css";

const BUTTONS = [
  ["AC", "(", ")", "π"],
  ["x²", "√", "÷", "×"],
  ["7", "8", "9", "-"],
  ["4", "5", "6", "+"],
  ["1", "2", "3", "="],
  ["0", ".", "(-)"]
];

export default function NaplanCalculator() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("");

  const shownValue = useMemo(() => {
    if (display !== "") return display;
    return expression || "0";
  }, [expression, display]);

  const sanitizeExpression = (expr) => {
    return expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "Math.PI")
      .replace(/√\(/g, "Math.sqrt(");
  };

  const handleAC = () => {
    setExpression("");
    setDisplay("");
  };

  const handleEquals = () => {
    try {
      let expr = expression.trim();

      if (!expr) return;

      // convert sqrt symbol when used directly before a number
      // e.g. √9 -> Math.sqrt(9)
      expr = expr.replace(/√(\d+(\.\d+)?)/g, "Math.sqrt($1)");

      const safeExpr = sanitizeExpression(expr);
      const result = Function(`"use strict"; return (${safeExpr})`)();

      if (result === undefined || Number.isNaN(result)) {
        setDisplay("Error");
        return;
      }

      setDisplay(String(result));
      setExpression(String(result));
    } catch (err) {
      setDisplay("Error");
    }
  };

  const appendValue = (value) => {
    if (display === "Error") {
      setDisplay("");
      setExpression("");
    }

    switch (value) {
      case "AC":
        handleAC();
        return;

      case "=":
        handleEquals();
        return;

      case "π":
        setDisplay("");
        setExpression((prev) => prev + "π");
        return;

      case "x²":
        setDisplay("");
        setExpression((prev) => {
          if (!prev) return prev;
          return `(${prev})²`;
        });
        return;

      case "√":
        setDisplay("");
        setExpression((prev) => prev + "√(");
        return;

      case "(-)":
        setDisplay("");
        setExpression((prev) => {
          if (!prev) return "-";
          return `(-1*(${prev}))`;
        });
        return;

      default:
        setDisplay("");
        setExpression((prev) => prev + value);
    }
  };

  // Before evaluation, convert (...)² into Math.pow(..., 2)
  const preparedExpression = useMemo(() => {
    if (!expression) return expression;

    let expr = expression;

    // Convert (...)² -> Math.pow((...), 2)
    expr = expr.replace(/(\([^)]+\)|\d+(\.\d+)?)²/g, "Math.pow($1,2)");

    return expr;
  }, [expression]);

  const onButtonClick = (value) => {
    if (value === "=") {
      try {
        let expr = preparedExpression.trim();
        if (!expr) return;

        expr = expr.replace(/√(\d+(\.\d+)?)/g, "Math.sqrt($1)");
        const safeExpr = sanitizeExpression(expr);

        const result = Function(`"use strict"; return (${safeExpr})`)();

        if (result === undefined || Number.isNaN(result)) {
          setDisplay("Error");
          return;
        }

        setDisplay(String(result));
        setExpression(String(result));
      } catch {
        setDisplay("Error");
      }
      return;
    }

    appendValue(value);
  };

  return (
    <div className="naplan-calculator">
      <div className="naplan-calculator-display">
        {shownValue}
      </div>

      <div className="naplan-calculator-grid">
        {BUTTONS.flat().map((btn, idx) => (
          <button
            key={`${btn}-${idx}`}
            className={`calc-btn ${
              btn === "=" ? "calc-btn-equals" : ""
            }`}
            onClick={() => onButtonClick(btn)}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}