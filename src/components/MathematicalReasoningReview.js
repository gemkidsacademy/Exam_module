export default function MathematicalReasoningReview({
  studentId,
  onExitReview
}) {
  console.log("🧠 MathematicalReasoningReview MOUNTED");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_BASE = process.env.REACT_APP_API_URL;

  if (!API_BASE) {
    throw new Error("❌ REACT_APP_API_URL is not defined");
  }

  useEffect(() => {
    console.log("📥 Fetching review for student:", studentId);

    fetch(
      `${API_BASE}/api/student/exam-review/mathematical-reasoning?student_id=${studentId}`
    )
      .then(res => res.json())
      .then(data => {
        console.log("📊 Review response:", data);
        setQuestions(data.questions || []);
      })
      .catch(err => {
        console.error("❌ Review fetch failed:", err);
      });
  }, [studentId, API_BASE]);

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
