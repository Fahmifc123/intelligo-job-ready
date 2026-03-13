import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SkillsCardProps {
  isEditing: boolean;
  profile: any;
  newSkill: { name: string; level: string };
  isAddingSkill: boolean;
  onSkillChange: (name: string, level: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skillId: string) => void;
}

export const SkillsCard: React.FC<SkillsCardProps> = ({
  isEditing,
  profile,
  newSkill,
  isAddingSkill,
  onSkillChange,
  onAddSkill,
  onRemoveSkill,
}) => {
  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-white">Skills</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing && (
          <div className="mb-4 flex flex-wrap items-center gap-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            {profile?.data?.skills && profile.data.skills.length > 0 && (
              profile.data.skills.map((skill: any) => (
                <span key={skill.id} className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900 text-[#F97316] dark:text-orange-300 py-1 px-3 rounded-full text-sm font-medium">
                  {skill.skillName}
                  <button 
                    onClick={() => onRemoveSkill(skill.id)}
                    className="ml-1"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </span>
              ))
            )}
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => onSkillChange(e.target.value, newSkill.level)}
              placeholder="Add a new skill..."
              className="form-input flex-1 bg-transparent outline-none border-none ring-0 focus:ring-0 p-1 min-w-[150px] dark:bg-transparent dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400"
            />
          </div>
        )}
        
        {!isEditing && (
          <div className="flex flex-wrap gap-2">
            {profile?.data?.skills && profile.data.skills.length > 0 ? (
              profile.data.skills.map((skill: any) => (
                <span key={skill.id} className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900 text-[#F97316] dark:text-orange-300 rounded-full text-sm font-medium">
                  {skill.skillName}
                  {skill.proficiencyLevel && (
                    <span className="ml-1">- {skill.proficiencyLevel}</span>
                  )}
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm py-2">
                No skills added yet
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
