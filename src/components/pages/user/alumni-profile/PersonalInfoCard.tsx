import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User, ExternalLink, Link as LinkIcon } from 'lucide-react';

interface PersonalInfoCardProps {
  isEditing: boolean;
  formData: any;
  profile: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (checked: boolean) => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  isEditing,
  formData,
  profile,
  onInputChange,
  onSwitchChange,
}) => {
  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0F172A] dark:text-white">
          <User className="h-5 w-5 text-[#F97316]" />
          About Me
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={onInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  name="headline"
                  value={formData.headline}
                  onChange={onInputChange}
                  placeholder="Professional headline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={onInputChange}
                  placeholder="AI Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={onInputChange}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={onInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Input
                  id="employmentStatus"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={onInputChange}
                  placeholder="Employed, Freelance, Job Seeking"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={onInputChange}
                  placeholder="0"
                />
              </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onInputChange}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={onInputChange}
                  placeholder="+62 xxx xxxx xxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input
                  id="currentLocation"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={onInputChange}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={onInputChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={onInputChange}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={onInputChange}
                  placeholder="https://github.com/yourname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter URL</Label>
                <Input
                  id="twitterUrl"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={onInputChange}
                  placeholder="https://twitter.com/yourname"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={onInputChange}
                  placeholder="Write about yourself..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Make Profile Public</Label>
                <p className="text-sm text-gray-500">Allow others to view your profile</p>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={onSwitchChange}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bio Section */}
            <div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                {profile?.data?.bio || 'No bio added yet.'}
              </p>
            </div>
            
            
            {/* Social Links Section */}
            {(profile?.data?.portfolioUrl || profile?.data?.linkedinUrl || profile?.data?.githubUrl || profile?.data?.twitterUrl) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Social Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.data?.portfolioUrl && (
                      <a 
                        href={profile.data.portfolioUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Portfolio</span>
                      </a>
                    )}
                    {profile?.data?.linkedinUrl && (
                      <a 
                        href={profile.data.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">LinkedIn</span>
                      </a>
                    )}
                    {profile?.data?.githubUrl && (
                      <a 
                        href={profile.data.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">GitHub</span>
                      </a>
                    )}
                    {profile?.data?.twitterUrl && (
                      <a 
                        href={profile.data.twitterUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Twitter</span>
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
