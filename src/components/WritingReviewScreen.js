import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";

export default function WritingReviewScreen({ route }) {
  const { attemptId } = route.params;

  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    fetch(`${API_BASE}/api/student/writing/review/${attemptId}`)
      .then(res => res.json())
      .then(data => {
        setEssay(data.essay_text || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, lineHeight: 24 }}>
        {essay}
      </Text>
    </ScrollView>
  );
}