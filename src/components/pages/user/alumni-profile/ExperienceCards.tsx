import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Medal, Building2, ExternalLink } from 'lucide-react';

interface ExperienceItem {
  id: string;
  title: string;
  subtitle?: string;
  detail?: string;
  dates?: string;
  description?: string;
  isCurrent?: boolean;
  credentialUrl?: string;
  icon: React.ReactNode;
  emptyIcon: React.ReactNode;
}

interface ExperienceCardsProps {
  profile: any;
}

// Generic Experience Item Component
const ExperienceItem: React.FC<{ item: ExperienceItem }> = ({ item }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900 flex items-center justify-center">
        {item.icon}
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-[#0F172A] dark:text-white">{item.title}</h4>
          {item.subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{item.subtitle}</p>}
          {item.detail && <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>}
        </div>
        {item.isCurrent && (
          <Badge className="bg-orange-100 dark:bg-orange-900 text-[#F97316] dark:text-orange-300 hover:bg-orange-200 border-0">
            Current
          </Badge>
        )}
      </div>
      {item.dates && <p className="text-sm text-gray-500 mt-1">{item.dates}</p>}
      {item.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">{item.description}</p>}
      {item.credentialUrl && (
        <a
          href={item.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[#F97316] hover:underline mt-2"
        >
          View Credential
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  </div>
);

// Generic Card Component
const ExperienceSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: ExperienceItem[];
  emptyMessage: string;
  emptyIcon: React.ReactNode;
}> = ({ title, icon, items, emptyMessage, emptyIcon }) => (
  <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl">
    <CardHeader>
      <CardTitle className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-white flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {items && items.length > 0 ? (
          items.map((item) => <ExperienceItem key={item.id} item={item} />)
        ) : (
          <div className="text-center py-8">
            {emptyIcon}
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const ExperienceCards: React.FC<ExperienceCardsProps> = ({ profile }) => {
  // Work Experience
  const workItems: ExperienceItem[] = (profile?.data?.workExperiences || []).map((exp: any) => ({
    id: exp.id,
    title: exp.position,
    subtitle: `${exp.companyName} • Full-time`,
    dates: `${new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}`,
    description: exp.description,
    isCurrent: exp.isCurrent,
    icon: <Building2 className="h-6 w-6 text-[#F97316]" />,
    emptyIcon: <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />,
  }));

  // Education
  const eduItems: ExperienceItem[] = (profile?.data?.educationHistory || []).map((edu: any) => ({
    id: edu.id,
    title: edu.schoolName,
    detail: edu.degree || edu.fieldOfStudy ? `${edu.degree}${edu.degree && edu.fieldOfStudy ? ', ' : ''}${edu.fieldOfStudy}` : undefined,
    dates: edu.startDate || edu.endDate ? `${edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' }) : ''} - ${edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric' }) : 'Present'}` : undefined,
    description: edu.description,
    isCurrent: edu.isCurrent,
    icon: <GraduationCap className="h-6 w-6 text-[#F97316]" />,
    emptyIcon: <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />,
  }));

  // Certifications
  const certItems: ExperienceItem[] = (profile?.data?.certificationsData || []).map((cert: any) => ({
    id: cert.id,
    title: cert.certificationName,
    subtitle: cert.issuingOrganization,
    dates: cert.issueDate || cert.expiryDate ? `Issued: ${cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}${cert.expiryDate ? ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}` : undefined,
    credentialUrl: cert.credentialUrl,
    icon: <Medal className="h-6 w-6 text-[#F97316]" />,
    emptyIcon: <Medal className="h-12 w-12 text-gray-300 mx-auto mb-3" />,
  }));

  return (
    <>
      <ExperienceSection
        title="Work Experience"
        icon={<Briefcase className="h-5 w-5 text-[#F97316]" />}
        items={workItems}
        emptyMessage="No work experiences added yet"
        emptyIcon={<Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />}
      />
      <ExperienceSection
        title="Education"
        icon={<GraduationCap className="h-5 w-5 text-[#F97316]" />}
        items={eduItems}
        emptyMessage="No education added yet"
        emptyIcon={<GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />}
      />
      <ExperienceSection
        title="Certifications"
        icon={<Medal className="h-5 w-5 text-[#F97316]" />}
        items={certItems}
        emptyMessage="No certifications added yet"
        emptyIcon={<Medal className="h-12 w-12 text-gray-300 mx-auto mb-3" />}
      />
    </>
  );
};
