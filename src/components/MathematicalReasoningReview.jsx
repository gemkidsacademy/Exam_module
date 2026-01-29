export default function MathematicalReasoningReview({
  studentId,
  examAttemptId,
  onExitReview
}) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(
      `${API_BASE}/api/student/exam-review/mathematical-reasoning?attempt_id=${examAttemptId}`
    )
      .then(res => res.json())
      .then(setQuestions);
  }, [examAttemptId]);

  if (!questions.length) {
    return <p className="loading">Loading review…</p>;
  }

  return (
    <ReviewShell
      questions={questions}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      onExit={onExitReview}
    />
  );
}
