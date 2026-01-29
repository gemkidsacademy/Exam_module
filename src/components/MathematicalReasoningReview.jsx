export default function MathematicalReasoningReview({
  studentId,
  onExitReview
}) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(
      `${API_BASE}/api/student/exam-review/mathematical-reasoning?student_id=${studentId}`
    )
      .then(res => res.json())
      .then(data => setQuestions(data.questions || []));
  }, [studentId]);

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
