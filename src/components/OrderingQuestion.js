import React from "react";

import {
    DndContext,
    useDraggable,
    useDroppable,
    pointerWithin,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

function DropZone({
    id,
    children,
    style = {},
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
                height: "150px",
                background: isOver ? "#7fb7ff" : "#c7d7e8",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "2px",
                transition: "0.2s",
                ...style,
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
        width: "220px",
        height: "150px",
        padding: "12px",
        marginBottom: "15px",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        border: "none",
        borderRadius: "2px",
        background: "#c7d7e8",

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
            {item.image ? (
                <div
                    style={{
                        width: 180,
                        height: 120,
                        background: "#ffffff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        borderRadius: "4px",
                    }}
                >
                    <img
                        src={item.image}
                        alt={item.id}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            pointerEvents: "none",
                        }}
                    />
                </div>
            ) : (
                item.text
            )}
        </div>
    );
}


export default function OrderingQuestion({
    block,
    answer,
    onAnswer,
    review = false,
    correctAnswer = [],
}) {
    let normalizedCorrectAnswer = correctAnswer;

    if (typeof correctAnswer === "string") {
        try {
            normalizedCorrectAnswer = JSON.parse(
                correctAnswer.replace(/'/g, '"')
            );
        } catch (e) {
            normalizedCorrectAnswer = [];
        }
    }
    console.log("answer:", answer);
    console.log("correctAnswer:", correctAnswer);
    console.log("correctAnswer type:", typeof correctAnswer);
    console.log("isArray:", Array.isArray(correctAnswer));
    const [assignments, setAssignments] = React.useState({});
    const usedIds =
    Object.values(assignments);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );
    

    const availableItems =
        block.items.filter(
            item => !usedIds.includes(item.id)
        );
    const allCorrect =
        Array.isArray(answer) &&
        Array.isArray(normalizedCorrectAnswer) &&
        answer.length === normalizedCorrectAnswer.length &&
        answer.every(
            (id, index) => id === normalizedCorrectAnswer[index]
        );
    function handleDragEnd(event) {

    const { active, over } = event;

    if (!over) return;

    setAssignments(prev => {

        const updated = { ...prev };

        // Find which slot currently contains this item
        const previousSlot = Object.keys(updated).find(
            slot => updated[slot] === active.id
        );

        // Remove it from its old slot
        if (previousSlot) {
            delete updated[previousSlot];
        }

        // If destination already contains another image,
        // move that image back to the tray.
        if (updated[over.id]) {
            delete updated[over.id];
        }

        // Put dragged image into new slot
        updated[over.id] = active.id;

        onAnswer(Object.values(updated));

        return updated;

    });

}    
React.useEffect(() => {
    if (!answer) return;

    const map = {};

    answer.forEach((itemId, index) => {
        map[`slot-${index + 1}`] = itemId;
    });

    setAssignments(map);
}, [answer]);


    return (

    <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
    >

    <div
            style={{
                marginTop: 25,
                display: "flex",
                flexDirection: "column",
                gap: 24,
            }}
        >

            {/* ======================================================
                AVAILABLE IMAGES
            ====================================================== */}

            <div
                style={{
                    background: "#EEF3F8",
                    border: "1px solid #D9E2EC",
                    padding: 20,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 18,
                    flexWrap: "nowrap",
                    overflow: "visible",
                    padding: "20px 10px",
                    minHeight: 150,
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


            {/* ======================================================
                ORDERING SLOTS
            ====================================================== */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 8,
                }}
            >

                {[0, 1, 2, 3].map((index) => {

                    const studentId = assignments[`slot-${index + 1}`];
                    const expectedId = normalizedCorrectAnswer[index];
                    console.log({
                        slot: index + 1,
                        studentId,
                        expectedId,
                        studentType: typeof studentId,
                        expectedType: typeof expectedId,
                        equal: studentId === expectedId,
                    });

                    const isCorrect =
                        review &&
                        studentId === expectedId;

                    return (

                        <div
                            key={index}
                            style={{
                                minHeight: 220,
                                border: "2px solid #E4E7EB",
                                background: "#F9FAFB",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >

                            {/* Header */}

                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "12px 0",
                                    fontWeight: 700,
                                    color: "#555",
                                    borderBottom: "1px solid #E5E7EB",
                                    minHeight: 48,
                                }}
                            >

                                {index === 0 && "Smallest"}
                                {index === 3 && "Largest"}

                            </div>

                            {/* Placeholder */}

                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "flex-start",
                                    paddingTop: 18,
                                }}
                            >
                                <DropZone
                                    id={`slot-${index + 1}`}
                                    style={
                                        review
                                            ? {
                                                border: isCorrect
                                                    ? "3px solid #22c55e"
                                                    : "3px solid #ef4444",
                                                background: isCorrect
                                                    ? "#dcfce7"
                                                    : "#fee2e2",
                                            }
                                            : {}
                                    }
                                >
                                    {(() => {

                                        const assignedItem = block.items.find(
                                            item =>
                                                item.id === studentId
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

                    );

                })}

            </div>


                {review && !allCorrect && (
            <>
                <h3
                    style={{
                        marginTop: 40,
                        textAlign: "center"
                    }}
                >
                    Correct Order
                </h3>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 15,
                        flexWrap: "wrap",
                        marginTop: 20
                    }}
                >
                    {Array.isArray(normalizedCorrectAnswer) &&
                        normalizedCorrectAnswer.map(id => {
                        const item = block.items.find(
                            x => x.id === id
                        );

                        return (
                            <DraggableCard
                                key={id}
                                item={item}
                                review={true}
                            />
                        );
                    })}
                </div>
            </>
        )}

    </div>

</DndContext>

);

}