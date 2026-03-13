import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Aspect {
  name: string;
  score: number;
  feedback: string;
}

interface CvAnalysisResultData {
  role: string;
  overallScore: number;
  skorKecocokanRole: number;
  kekuatanUtama?: string[];
  gaps?: string[];
  prioritasPerbaikan?: string[];
  aspects?: Aspect[];
}

interface CvAnalysisResultPageProps {
  data: CvAnalysisResultData;
}

export const CvAnalysisResultPage: React.FC<CvAnalysisResultPageProps> = ({ data }) => {
  const formatAspectName = (name: string): string => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRoleMatchDescription = (score: number): string => {
    if (score <= 30) {
      return `Profil Anda saat ini belum selaras dengan kebutuhan utama untuk posisi ${data.role}. Disarankan untuk memperkuat keterampilan dan pengalaman yang relevan agar lebih kompetitif.`;
    } else if (score <= 50) {
      return `Anda memiliki beberapa kualifikasi dasar untuk posisi ${data.role}, namun masih ada area yang perlu dikembangkan agar lebih sesuai dengan ekspektasi posisi ini.`;
    } else if (score <= 70) {
      return `Profil Anda cukup relevan dengan posisi ${data.role}. Dengan sedikit peningkatan di beberapa area, Anda dapat menjadi kandidat yang lebih kompetitif.`;
    } else if (score <= 85) {
      return `Anda adalah kandidat yang sangat cocok untuk posisi ${data.role}. Pengalaman dan keterampilan Anda sejalan dengan kebutuhan utama posisi ini.`;
    } else {
      return `Profil Anda sangat ideal untuk posisi ${data.role}. Kualifikasi dan pengalaman Anda sepenuhnya memenuhi bahkan melampaui ekspektasi untuk posisi ini.`;
    }
  };
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Hero Section */}
      <div className="flex flex-col gap-2 text-center max-w-2xl mx-auto">
        <h1 className="text-[#0F172A] text-4xl sm:text-5xl font-extrabold leading-tight tracking-tighter">
          Hasil Analisis CV
        </h1>
        <h2 className="text-[#6B7280] text-base sm:text-lg font-normal leading-normal">
          Analisis yang membantu menyempurnakan resume agar lebih siap untuk tahap karier berikutnya.
        </h2>
      </div>

      {/* Main Results Card */}
      <Card className="w-full max-w-4xl mx-auto rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-200/50">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-8">
            {/* Header with Role and Score */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-[#0F172A] text-2xl font-bold">
                  Rekomendasi untuk Posisi {data.role}
                </h3>
                <p className="text-[#6B7280]">Analisis komprehensif untuk membantu Anda berkembang di posisi ini.</p>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#F97316] to-[#E85D04] text-white py-2 px-4 rounded-lg whitespace-nowrap">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold">Skor Keseluruhan: {data.overallScore}/100</span>
              </div>
            </div>

            {/* Role Match Score & Improvement Priorities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Match Score */}
              <div className="flex flex-col gap-3 bg-[#F9FAFB] p-4 rounded-lg border border-gray-200">
                <h4 className="text-[#0F172A] font-bold text-lg">Skor Kecocokan Posisi</h4>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="stroke-current text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                      />
                      <path
                        className="stroke-current text-[#F97316]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray={`${data.skorKecocokanRole}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#0F172A]">
                        {data.skorKecocokanRole}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[#6B7280] flex-1">
                    {getRoleMatchDescription(data.skorKecocokanRole)}
                  </p>
                </div>
              </div>

              {/* Improvement Priorities */}
              <div className="flex flex-col gap-4 bg-[#F9FAFB] p-6 rounded-lg border border-gray-200">
                <h4 className="text-[#0F172A] font-bold text-lg">Prioritas Perbaikan</h4>
                <ul className="space-y-2 text-[#6B7280]">
                  {data.prioritasPerbaikan && data.prioritasPerbaikan.length > 0 ? (
                    data.prioritasPerbaikan.slice(0, 2).map((priority, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#F97316] mt-0.5 flex-shrink-0" />
                        <span>{priority}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#F97316] mt-0.5 flex-shrink-0" />
                        <span>Highlight specific project outcomes with quantifiable metrics.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#F97316] mt-0.5 flex-shrink-0" />
                        <span>Tailor the professional summary to be more role-centric.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Key Strengths & Areas for Improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Strengths */}
              <div className="flex flex-col gap-3">
                <h4 className="text-lg font-bold text-[#0F172A]">Keunggulan Utama</h4>
                <ul className="space-y-2">
                  {data.kekuatanUtama && data.kekuatanUtama.length > 0 ? (
                    data.kekuatanUtama.map((strength, idx) => (
                      <li key={idx} className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-[#0F172A]">{strength}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-[#0F172A]">Strong technical skills and experience.</span>
                      </li>
                      <li className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-[#0F172A]">Extensive project portfolio.</span>
                      </li>
                      <li className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-[#0F172A]">Solid academic background.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="flex flex-col gap-3">
                <h4 className="text-lg font-bold text-[#0F172A]">Hal yang Perlu Dikembangkan</h4>
                <ul className="space-y-2">
                  {data.gaps && data.gaps.length > 0 ? (
                    data.gaps.map((gap, idx) => (
                      <li key={idx} className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <span className="text-[#0F172A]">{gap}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span className="text-[#0F172A]">Lack of cloud platform experience.</span>
                      </li>
                      <li className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span className="text-[#0F172A]">Vague descriptions of achievements.</span>
                      </li>
                      <li className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span className="text-[#0F172A]">Generic professional summary.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div>
              <h4 className="text-lg font-bold text-[#0F172A] mb-4">Detail Penilaian</h4>
              <div className="space-y-3">
                {data.aspects && data.aspects.length > 0 ? (
                  data.aspects.map((aspect, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-[#0F172A] font-medium">{formatAspectName(aspect.name)}</p>
                        <p className="text-[#0F172A] font-semibold">{aspect.score}/100</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#F97316] to-[#E85D04] h-2 rounded-full"
                          style={{ width: `${aspect.score}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-[#0F172A] font-medium">Skill Relevancy</p>
                        <p className="text-[#0F172A] font-semibold">95/100</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#F97316] to-[#E85D04] h-2 rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-[#0F172A] font-medium">Work Experience</p>
                        <p className="text-[#0F172A] font-semibold">90/100</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#F97316] to-[#E85D04] h-2 rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-[#0F172A] font-medium">Achievements</p>
                        <p className="text-[#0F172A] font-semibold">82/100</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#F97316] to-[#E85D04] h-2 rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-[#0F172A] font-medium">Professional Summary</p>
                        <p className="text-[#0F172A] font-semibold">75/100</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#F97316] to-[#E85D04] h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-[#0F172A] font-medium">Format & Structure</p>
                        <p className="text-[#0F172A] font-semibold">98/100</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#F97316] to-[#E85D04] h-2 rounded-full" style={{ width: '98%' }} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-[#0F172A] font-medium">ATS Keywords</p>
                        <p className="text-[#0F172A] font-semibold">89/100</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#F97316] to-[#E85D04] h-2 rounded-full" style={{ width: '89%' }} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
