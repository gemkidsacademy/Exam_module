import React from "react";
import {
    DndContext,
    useDraggable,
    useDroppable,
    pointerWithin,
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
                width: "240px",
                height: "54px",
                background: isOver ? "#7fb7ff" : "#c7d7e8",
                border: "none",
                borderRadius: "2px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontWeight: 600,
                transition: "0.2s"
            }}
        >
            {children || ""}
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
    width: "240px",
    padding: "16px",
    marginBottom: "15px",
    border: "none",
    borderRadius: "2px",
    background: "#c7d7e8",
    color: "#ffffff",
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
  console.log("=================================");
  console.log("MATCHING BLOCK");
  console.log(block);
  console.log("match_mode:", block.match_mode);
  console.log("left_items:", block.left_items);
  console.log("right_items:", block.right_items);
  console.log("items:", block.items);
  console.log("=================================");
  

  // All draggable cards
const leftItems =
    block.left_items ||
    (block.items || []).slice(0, 3);

const rightItems =
    block.right_items ||
    (block.items || []).slice(3);


const layout =
    block.match_mode === "FIXED_LEFT"
        ? "fixed-left"
        : "free-pair";

const draggableItems =
    layout === "fixed-left"
        ? rightItems
        : block.items || [];
const [assignments, setAssignments] = React.useState(answer || {});
console.log("🔥 MatchingQuestion render");
  console.log("answer prop:", answer);
  console.log("assignments:", assignments);
  
// Student answer


const usedIds = Object.values(assignments);
console.log("layout:", layout);
console.log("rightItems:", rightItems);
console.log("assignments:", assignments);
console.log("usedIds:", Object.values(assignments));
console.log("draggableItems:", draggableItems); 


const availableItems = draggableItems.filter(
    item => !usedIds.includes(item.id)
);  

React.useEffect(() => {

    if (
        layout === "fixed-left" &&
        Array.isArray(answer)
    ) {

        const map = {};

        answer.forEach(pair => {
            map[pair.left] = pair.right;
        });

        setAssignments(map);

    } else {

        setAssignments(answer || {});

    }

}, [answer, layout]);

function isCorrect(leftId, rightId) {
    return (correctAnswer || []).some(
        pair =>
            pair.left === leftId &&
            pair.right === rightId
    );
}
function handleDragEnd(event) {
    const { active, over } = event;

    console.log("Dragged:", active.id);
    console.log("Over object:", over);
    console.log("Dropped on:", over?.id);

    if (!over) return;

    setAssignments(prev => {

        const updated = {
            ...prev,
            [over.id]: active.id,
        };

        console.log("Updated assignments:", updated);

        // Tell parent component about the answer
        if (layout === "fixed-left") {

          const pairs = Object.entries(updated).map(
              ([left, right]) => ({
                  left,
                  right
              })
          );

          onAnswer(pairs);

      } else {

          onAnswer(updated);

      }

        return updated;
    });
}

console.log("Assignments:", assignments);
console.log(
    "Lookup:",
    draggableItems.find(
        i => i.id === assignments["mass"]
    )
);
  return (
    <DndContext
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
    >
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
      {/* AVAILABLE CARDS */}

      {layout === "fixed-left" ? (

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "18px",
            marginBottom: "35px",
            flexWrap: "wrap"
          }}
        >
          {availableItems.map(item => (
            <DraggableCard
              key={item.id}
              item={item}
            />
          ))}
        </div>

      ) : (

        <>
          <div>
            <h3>Available Cards</h3>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "30px"
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

          <hr
            style={{
              margin: "20px 0",
              border: "1px solid #ddd"
            }}
          />
        </>

      )}
      {/* PAIRS */}
<div>

      {
    layout === "fixed-left"

    ?

    <div
        style={{
            display:"flex",
            flexDirection:"column",
            gap:"18px",
            width:"700px",
            margin:"0 auto"
        }}
    >

    {leftItems.map(left=>(

    <div
        key={left.id}
        style={{
            display:"grid",
            gridTemplateColumns:"240px 80px 240px",
            alignItems:"center",
            gap:"10px"
        }}
    >

    <div
        style={{
            background:"#005ea8",
            color:"white",
            padding:"16px",
            textAlign:"center",
            fontWeight:600,
            borderRadius:"2px"
        }}
    >
        {left.text}
    </div>

    <div
        style={{
            textAlign:"center",
            fontSize:"30px",
            color:"#2b82ff"
        }}
    >
        <div
          style={{
          display:"flex",
          justifyContent:"center"
          }}
          >

          <svg width="70" height="20">

          <line
          x1="0"
          y1="10"
          x2="70"
          y2="10"
          stroke="#2d8cff"
          strokeWidth="3"
          />

          </svg>

          </div>
    </div>

    <DropZone id={left.id}>
        {
            draggableItems.find(
                i=>i.id===assignments[left.id]
            )?.text
        }
    </DropZone>

    </div>

    ))}

    </div>

    :

    [1,2,3].map(pair => (

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