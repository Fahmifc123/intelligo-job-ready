import { useEffect, useState } from "react";

const API_URL = "/api";

/** Fetches the admin-controlled on/off state of Job Ready Hub features.
 * Fails open: a missing key or a failed fetch is treated as enabled, so a
 * flaky network never locks alumni out of a feature that should work. */
export function useJobReadyHubFeatures() {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/job-ready-hub/features`)
      .then((r) => (r.ok ? r.json() : { features: {} }))
      .then((data) => setFeatures(data.features || {}))
      .catch(() => setFeatures({}))
      .finally(() => setLoading(false));
  }, []);

  const isEnabled = (key: string) => features[key] !== false;

  return { features, isEnabled, loading };
}
