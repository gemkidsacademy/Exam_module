import React, { useEffect, useState } from "react";

export default function OrderingQuestion({
    block,
    answer,
    onAnswer,
    review = false,
    correctAnswer = []
}) {
    const [items, setItems] = useState([]);

    // -----------------------------------------
    // Initialize ordering
    // -----------------------------------------
    useEffect(() => {
        if (
            Array.isArray(answer) &&
            answer.length === block.items.length
        ) {
            const ordered = answer
                .map(id =>
                    block.items.find(item => item.id === id)
                )
                .filter(Boolean);

            setItems(ordered);
        } else {
            setItems(block.items);
        }
    }, [answer, block.items]);

    // -----------------------------------------
    // Move Up
    // -----------------------------------------
    const moveUp = (index) => {
        if (review || index === 0) return;

        const updated = [...items];

        [updated[index - 1], updated[index]] = [
            updated[index],
            updated[index - 1],
        ];

        setItems(updated);

        onAnswer(updated.map(i => i.id));
    };

    // -----------------------------------------
    // Move Down
    // -----------------------------------------
    const moveDown = (index) => {
        if (review || index === items.length - 1) return;

        const updated = [...items];

        [updated[index], updated[index + 1]] = [
            updated[index + 1],
            updated[index],
        ];

        setItems(updated);

        onAnswer(updated.map(i => i.id));
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                marginTop: "25px",
            }}
        >
            {items.map((item, index) => {

                const correctPosition =
                    correctAnswer[index] === item.id;

                return (
                    <div
                        key={item.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: review
                                ? correctPosition
                                    ? "3px solid #22c55e"
                                    : "3px solid #ef4444"
                                : "2px solid #d1d5db",
                            borderRadius: "12px",
                            padding: "12px",
                            background: review
                                ? correctPosition
                                    ? "#dcfce7"
                                    : "#fee2e2"
                                : "#ffffff",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "18px",
                            }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    fontWeight: "bold",
                                    fontSize: 20,
                                    textAlign: "center",
                                }}
                            >
                                {index + 1}
                            </div>

                            <img
                                src={item.image}
                                alt={item.id}
                                style={{
                                    maxWidth: "170px",
                                    maxHeight: "170px",
                                    objectFit: "contain",
                                }}
                            />
                        </div>

                        {!review && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                }}
                            >
                                <button
                                    onClick={() => moveUp(index)}
                                    disabled={index === 0}
                                >
                                    ▲
                                </button>

                                <button
                                    onClick={() => moveDown(index)}
                                    disabled={
                                        index === items.length - 1
                                    }
                                >
                                    ▼
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}