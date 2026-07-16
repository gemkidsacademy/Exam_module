import React from "react";
import {
    DndContext,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";



function DropZone({
    id,
    children,
}) {

    const {
        setNodeRef,
        isOver,
    } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                width: "220px",
                height: "60px",
                border: isOver
                    ? "3px solid #4caf50"
                    : "2px dashed #999",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#fafafa",
            }}
        >
            {children || "Drop Here"}
        </div>
    );
}

function DraggableCard({ item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: item.id,
  });

  const style = {
    width: "150px",
    padding: "14px",
    marginBottom: "15px",
    border: "2px solid #5aa9e6",
    borderRadius: "8px",
    background: "#fff",
    textAlign: "center",
    fontWeight: 600,
    cursor: "grab",
    userSelect: "none",
    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {item.text}
    </div>
  );
}

export default function MatchingQuestion({
  block,
  answer,
  onAnswer,
  review,
  correctAnswer
}) {
  

  // All draggable cards
const draggableItems = block.items || [];
const [assignments, setAssignments] = React.useState(answer || {});
console.log("🔥 MatchingQuestion render");
  console.log("answer prop:", answer);
  console.log("assignments:", assignments);
  const items = block.items || [];
// Student answer
const studentPairs = Array.isArray(answer)
  ? answer
  : [];

const usedIds = Object.values(assignments);

const availableItems = draggableItems.filter(
    item => !usedIds.includes(item.id)
);  

React.useEffect(() => {
    setAssignments(answer || {});
}, [answer]);

function isCorrect(firstId, secondId) {

  if (!review) return false;

  return (
    correctAnswer || []
  ).some(pair => {

    return (
      (pair.left === firstId &&
       pair.right === secondId)

      ||

      (pair.left === secondId &&
       pair.right === firstId)
    );

  });

}
function handleDragEnd(event) {
    const { active, over } = event;

    console.log("Dragged:", active.id);
    console.log("Dropped on:", over?.id);

    if (!over) return;

    setAssignments(prev => {

        const updated = {
            ...prev,
            [over.id]: active.id,
        };

        // Tell parent component about the answer
        onAnswer(updated);

        return updated;
    });
}


  return (
    <DndContext onDragEnd={handleDragEnd}>
    <div
      style={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          marginTop: "30px"
      }}
    >
      {/* LEFT COLUMN */}
      
      {/* AVAILABLE CARDS */}
      <div>
        <h3
          style={{
            marginBottom: "20px"
          }}
        >
          Available Cards
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          {availableItems.map(item => (
              <DraggableCard
                  key={item.id}
                  item={item}
              />
          ))}
        </div>
      </div>
      {/* SEPARATOR */}
      <hr
        style={{
          margin: "20px 0",
          border: "1px solid #ddd"
        }}
      />
      {/* PAIRS */}
<div>

  {[1,2,3].map(pair => (

    <div
      key={pair}
      style={{
        marginBottom: "40px"
      }}
    >

      

      <div
        style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px"
        }}
      >

        <DropZone id={`pair-${pair}-left`}>
            {
                draggableItems.find(
                    item => item.id === assignments[`pair-${pair}-left`]
                )?.text
            }
        </DropZone>

        ↔

        <DropZone id={`pair-${pair}-right`}>
            {
                draggableItems.find(
                    item => item.id === assignments[`pair-${pair}-right`]
                )?.text
            }
        </DropZone>

      </div>

    </div>

  ))}

</div>

      
    </div>
    </DndContext>
  );
}