import { useLocation } from "react-router-dom";

export default function useVariant(fallbackVariant) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const urlVariant = params.get("variant");

  // Priority:
  // 1. URL (always correct after navigation)
  // 2. fallback prop (initial render)
  // 3. default = actual

  return urlVariant || fallbackVariant || "actual";
}