import { createFileRoute } from '@tanstack/react-router'
import { CvAnalysisPage } from '@/components/pages/user/cv-analysis/CvAnalysisPage'

export const Route = createFileRoute('/_standalone/cv/analysis')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CvAnalysisPage />
}
