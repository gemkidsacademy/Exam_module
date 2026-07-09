import React, { useState, useRef, useEffect } from "react";

function DraggableCalculator({
  children,
  title = "Widget",
  initialX = 100,
  initialY = 100,
  width = "340px",
  transparentBody = false,
  hideBodyPadding = false,
  containerStyle = {},
  rotatable = false,
  initialRotation = 0
}) {
  const boxRef = useRef(null);

  const [position, setPosition] = useState({
    x: initialX,
    y: initialY
  });

  const [rotation, setRotation] = useState(initialRotation);

  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotateData, setRotateData] = useState({
    centerX: 0,
    centerY: 0,
    startAngle: 0,
    startRotation: 0
  });

  const handleMouseDownDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!boxRef.current) return;

    const rect = boxRef.current.getBoundingClientRect();

    setDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseDownRotate = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!boxRef.current) return;

    const rect = boxRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) *
      (180 / Math.PI);

    setRotating(true);
    setRotateData({
      centerX,
      centerY,
      startAngle,
      startRotation: rotation
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging && boxRef.current) {
        const boxWidth = boxRef.current.offsetWidth;
        const boxHeight = boxRef.current.offsetHeight;

        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        newX = Math.max(0, Math.min(newX, window.innerWidth - boxWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - boxHeight));

        setPosition({ x: newX, y: newY });
      }

      if (rotating) {
        const currentAngle =
          Math.atan2(
            e.clientY - rotateData.centerY,
            e.clientX - rotateData.centerX
          ) *
          (180 / Math.PI);

        const delta = currentAngle - rotateData.startAngle;
        setRotation(rotateData.startRotation + delta);
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
      setRotating(false);
    };

    if (dragging || rotating) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = rotating ? "crosshair" : "grabbing";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, rotating, dragOffset, rotateData]);

  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 999999,
        width,
        maxWidth: "calc(100vw - 20px)",
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        background: transparentBody ? "transparent" : "#ffffff",
        border: transparentBody ? "none" : "1px solid #d9e2f2",
        borderRadius: "14px",
        boxShadow: transparentBody
          ? "none"
          : "0 12px 30px rgba(0,0,0,0.18)",
        overflow: "visible",
        ...containerStyle
      }}
    >
      {/* top tool bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: transparentBody ? "8px" : 0
        }}
      >
        {/* drag handle */}
        <div
          onMouseDown={handleMouseDownDrag}
          style={{
            background: "#1e40af",
            color: "#ffffff",
            padding: "10px 14px",
            fontWeight: 600,
            fontSize: "15px",
            cursor: dragging ? "grabbing" : "grab",
            userSelect: "none",
            borderRadius: transparentBody ? "12px" : "12px 12px 0 0",
            width: "fit-content",
            minWidth: "120px",
            boxShadow: transparentBody
              ? "0 4px 12px rgba(0,0,0,0.18)"
              : "none"
          }}
        >
          {title}
        </div>

        {/* rotate handle */}
        {rotatable && (
          <button
            type="button"
            onMouseDown={handleMouseDownRotate}
            style={{
              border: "none",
              background: "#0f766e",
              color: "#fff",
              padding: "10px 12px",
              borderRadius: "12px",
              fontWeight: 700,
              cursor: "crosshair",
              boxShadow: "0 4px 12px rgba(0,0,0,0.16)"
            }}
            title="Rotate ruler"
          >
            ↻ Rotate
          </button>
        )}
      </div>

      <div
        style={{
          background: transparentBody ? "transparent" : "#ffffff",
          padding: hideBodyPadding ? 0 : "12px"
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default DraggableCalculator;