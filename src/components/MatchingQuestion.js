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

function DraggableCard({
    item,
    review = false,
}) {
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
    cursor: review ? "default" : "grab",
    userSelect: "none",
    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  const dragProps = review
    ? {}
    : {
        ...listeners,
        ...attributes,
    };

return (
    <div
        ref={setNodeRef}
        style={style}
        {...dragProps}
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
  console.log("========== MATCHING REVIEW ==========");
  console.log("review:", review);
  console.log("answer:", answer);
  console.log("correctAnswer:", correctAnswer);
  console.log("typeof correctAnswer:", typeof correctAnswer);
  console.log("Array.isArray:", Array.isArray(correctAnswer));
  console.log("block:", block);
  console.log("====================================");
  
  

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
console.log("assignments state:", assignments);
  
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

    console.log("useEffect fired");
    console.log("Incoming answer:", answer);

    if (
        layout === "fixed-left" &&
        Array.isArray(answer)
    ) {

        const map = {};

        answer.forEach(pair => {
            map[pair.left] = pair.right;
        });

        console.log("Mapped assignments:", map);

        setAssignments(map);

    } else {

        console.log("Using answer directly");

        setAssignments(answer || {});

    }

}, [answer, layout]);


function isCorrect(leftId, rightId) {
    return (correctAnswer || []).some(pair =>
        (
            pair.left === leftId &&
            pair.right === rightId
        ) ||
        (
            pair.left === rightId &&
            pair.right === leftId
        )
    );
}
function handleDragEnd(event) {
    const { active, over } = event;

    console.log("Dragged:", active.id);
    console.log("Over object:", over);
    console.log("Dropped on:", over?.id);

    if (!over) return;

    setAssignments(prev => {

        const updated = { ...prev };

        // Remove the card from whichever slot currently contains it
        const previousSlot = Object.keys(updated).find(
            key => updated[key] === active.id
        );

        if (previousSlot) {
            delete updated[previousSlot];
        }

        // If destination already contains another card,
        // send that card back to Available Cards
        if (updated[over.id]) {
            delete updated[over.id];
        }

        updated[over.id] = active.id;

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
console.log("Final assignments:", assignments);

if (review && layout === "free-pair") {
    const pairsToDisplay =
    Array.isArray(answer) && answer.length > 0
        ? answer
        : (correctAnswer || []);

    return (

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                marginTop: "30px",
                maxWidth: "900px",
                marginInline: "auto"
            }}
        >

            {pairsToDisplay.map((studentPair, index) => {

                const correct = isCorrect(
                    studentPair.left,
                    studentPair.right
                );

                const expectedPair = (correctAnswer || []).find(
                    pair =>
                        pair.left === studentPair.left ||
                        pair.right === studentPair.left ||
                        pair.left === studentPair.right ||
                        pair.right === studentPair.right
                );

                const studentLeft = block.items.find(
                    item => item.id === studentPair.left
                );

                const studentRight = block.items.find(
                    item => item.id === studentPair.right
                );

                const correctLeft = expectedPair
                    ? block.items.find(
                        item => item.id === expectedPair.left
                    )
                    : null;

                const correctRight = expectedPair
                    ? block.items.find(
                        item => item.id === expectedPair.right
                    )
                    : null;

                return (

                    <div
                        key={index}
                        style={{
                            border: `2px solid ${
                                correct
                                    ? "#2e7d32"
                                    : "#d32f2f"
                            }`,
                            borderRadius: "8px",
                            padding: "20px"
                        }}
                    >

                        <div
                            style={{
                                fontWeight: 700,
                                color: correct
                                    ? "#2e7d32"
                                    : "#d32f2f",
                                marginBottom: "15px"
                            }}
                        >
                            {correct
                                ? "Correct Match"
                                : "Student Match"}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "18px",
                                flexWrap: "wrap"
                            }}
                        >

                            <DraggableCard
                                item={studentLeft}
                                review
                            />

                            <span
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 700
                                }}
                            >
                                ↔
                            </span>

                            <DraggableCard
                                item={studentRight}
                                review
                            />

                            <span
                                style={{
                                    fontSize: "28px",
                                    color: correct
                                        ? "#2e7d32"
                                        : "#d32f2f"
                                }}
                            >
                                {correct ? "✓" : "✕"}
                            </span>

                        </div>

                        {!correct && expectedPair && (

                            <>

                                <div
                                    style={{
                                        marginTop: "24px",
                                        marginBottom: "12px",
                                        color: "#2e7d32",
                                        fontWeight: 700
                                    }}
                                >
                                    Correct Pair
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "18px",
                                        flexWrap: "wrap"
                                    }}
                                >

                                    <DraggableCard
                                        item={correctLeft}
                                        review
                                    />

                                    <span
                                        style={{
                                            fontSize: "28px",
                                            fontWeight: 700
                                        }}
                                    >
                                        ↔
                                    </span>

                                    <DraggableCard
                                        item={correctRight}
                                        review
                                    />

                                    <span
                                        style={{
                                            fontSize: "28px",
                                            color: "#2e7d32"
                                        }}
                                    >
                                        ✓
                                    </span>

                                </div>

                            </>

                        )}

                    </div>

                );

            })}

        </div>

    );

}

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
                review={review}
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
                    review={review}
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

      {(() => {

          const assignedItem = draggableItems.find(
              item => item.id === assignments[left.id]
          );

          return assignedItem ? (

              <DraggableCard
                  item={assignedItem}
                  review={review}
              />

          ) : null;

      })()}

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

        {(() => {

            const assignedItem = draggableItems.find(
                item =>
                    item.id === assignments[`pair-${pair}-left`]
            );

            return assignedItem ? (

                <DraggableCard
                    item={assignedItem}
                    review={review}
                />

            ) : null;

        })()}

    </DropZone>

        ↔

        <DropZone id={`pair-${pair}-right`}>

          {(() => {

              const assignedItem = draggableItems.find(
                  item =>
                      item.id === assignments[`pair-${pair}-right`]
              );

              return assignedItem ? (

                  <DraggableCard
                      item={assignedItem}
                      review={review}
                  />

              ) : null;

          })()}

      </DropZone>

      </div>

    </div>

  ))}

</div>

      
    </div>
    </DndContext>
  );
}