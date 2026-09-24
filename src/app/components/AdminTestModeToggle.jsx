"use client";

import { useState } from "react";

export default function AdminTestModeToggle({ assessmentId, enabled, onChange }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function toggle(event) {
    const nextEnabled = event.target.checked;
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/test-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update test mode.");
      onChange(result.adminTestMode);
    } catch (toggleError) {
      setError(toggleError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return <label className="admin-test-mode" title="Violations are recorded but do not terminate an admin test session">
    <input type="checkbox" checked={enabled} onChange={toggle} disabled={isSaving} />
    <span>{isSaving ? "Saving…" : "Admin test mode"}</span>
    {enabled && <span className="admin-test-mode__hint">Violations are logged; termination is disabled.</span>}
    {error && <span className="admin-test-mode__error" role="alert">{error}</span>}
  </label>;
}
