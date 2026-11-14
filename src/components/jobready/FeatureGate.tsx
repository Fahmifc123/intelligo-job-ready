import { JOB_READY_HUB_FEATURES } from "@/config/jobReadyHubFeatures";
import { useJobReadyHubFeatures } from "@/hooks/use-job-ready-hub-features";
import { ReactNode } from "react";
import ComingSoon from "./ComingSoon";

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
}

/** Wraps a Job Ready Hub route: renders the real feature when admin has it
 * enabled, otherwise a "Coming Soon" placeholder -- without needing a code
 * change/deploy to flip a feature on or off. */
export default function FeatureGate({ featureKey, children }: FeatureGateProps) {
  const { isEnabled, loading } = useJobReadyHubFeatures();

  if (loading) return null;

  if (!isEnabled(featureKey)) {
    const def = JOB_READY_HUB_FEATURES.find((f) => f.key === featureKey);
    if (!def) return <>{children}</>;
    return <ComingSoon icon={def.icon} title={def.label} description={def.comingSoonDescription} />;
  }

  return <>{children}</>;
}
