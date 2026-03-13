import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GraduationCap, Plus, X } from 'lucide-react';

interface EducationCardProps {
  isEditing: boolean;
  formData: any;
  profile: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const EducationCard: React.FC<EducationCardProps> = ({
  isEditing,
  formData,
  profile,
  onInputChange,
}) => {
  const [educationList, setEducationList] = React.useState<any[]>(
    profile?.data?.educationHistory || [{
      school: '',
      degree: '',
      field: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
    }]
  );

  React.useEffect(() => {
    if (profile?.data?.educationHistory) {
      setEducationList(profile.data.educationHistory);
    }
  }, [profile?.data?.educationHistory]);

  const handleAddEducation = () => {
    setEducationList([...educationList, {
      school: '',
      degree: '',
      field: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
    }]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: value };
    setEducationList(updated);
  };
  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0F172A] dark:text-white">
          <GraduationCap className="h-5 w-5 text-[#F97316]" />
          Education
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            {educationList.map((education, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Education #{index + 1}</h4>
                  {educationList.length > 1 && (
                    <button
                      onClick={() => handleRemoveEducation(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>School/University</Label>
                    <Input
                      value={education.school}
                      onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                      placeholder="School or University name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={education.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      placeholder="e.g., Bachelor, Master"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={education.field}
                      onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Input
                      type="number"
                      value={education.startYear}
                      onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <Input
                      type="number"
                      value={education.endYear}
                      onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={handleAddEducation}
              variant="outline"
              className="w-full border-orange-300 text-[#F97316] hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {educationList && educationList.length > 0 ? (
              educationList.map((education, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg mt-1">
                    <GraduationCap className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{education.school || '-'}</p>
                    {education.degree && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{education.degree}{education.field ? ` in ${education.field}` : ''}</p>
                    )}
                    {(education.startYear || education.endYear) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{education.startYear} - {education.endYear}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GraduationCap className="h-8 w-8 text-gray-400 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No education added yet</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
