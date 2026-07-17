import React from "react";
import "./CalendarQuestion.css";

const DAYS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];

export default function CalendarQuestion({
    block,
    answer,
    onAnswer,
    review = false,
    correctAnswer,
}) {
    const {
        month,
        year,
        start_day,
        days_in_month,
        first_day_of_week = "Sunday",
    } = block;

    const firstDayIndex = DAYS.findIndex(
        d => d.toLowerCase() === start_day.slice(0, 3).toLowerCase()
    );

    const cells = [];

    // Empty cells before day 1
    for (let i = 0; i < firstDayIndex; i++) {
        cells.push(null);
    }

    // Calendar dates
    for (let day = 1; day <= days_in_month; day++) {
        cells.push(day);
    }

    const studentAnswer =
        answer == null ? null : String(answer);

    const correct =
        correctAnswer == null
            ? null
            : String(correctAnswer);

    return (
        <div className="calendar-question">

            <h2 className="calendar-title">
                {month}
            </h2>

            <div className="calendar-grid">

                {DAYS.map(day => (
                    <div
                        key={day}
                        className="calendar-header"
                    >
                        {day}
                    </div>
                ))}

                {cells.map((value, index) => {

                    if (value === null) {
                        return (
                            <div
                                key={index}
                                className="calendar-empty"
                            />
                        );
                    }

                    const valueString = String(value);

                    const isSelected =
                        studentAnswer === valueString;

                    const isCorrect =
                        correct === valueString;

                    let className = "calendar-cell";

                    if (!review && isSelected) {
                        className += " selected";
                    }

                    if (review) {

                        if (isCorrect) {
                            className += " review-correct";
                        }
                        else if (
                            isSelected &&
                            !isCorrect
                        ) {
                            className += " review-wrong";
                        }
                    }

                    return (
                        <button
                            key={index}
                            className={className}
                            disabled={review}
                            onClick={() =>
                                onAnswer(valueString)
                            }
                        >
                            {value}
                        </button>
                    );
                })}
            </div>

            {review &&
                studentAnswer !== correct && (
                    <div className="calendar-correct-answer">
                        Correct answer: {correct}
                    </div>
                )}
        </div>
    );
}