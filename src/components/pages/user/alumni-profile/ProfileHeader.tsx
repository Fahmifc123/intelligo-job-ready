import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Linkedin, Link as LinkIcon } from 'lucide-react';

interface ProfileHeaderProps {
  profile: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Profile Info Section */}
          <div className="flex items-start gap-4">
            {/* Profile Photo */}
            {(profile?.data?.photoThumbnailUrl || profile?.data?.photoUrl) ? (
              <div className="w-24 h-24 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-md">
                <img
                  src={profile?.data?.photoThumbnailUrl || profile?.data?.photoUrl}
                  alt={profile?.data?.fullName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 shadow-md">
                <User className="h-12 w-12 text-[#F97316]" />
              </div>
            )}
            
            {/* Profile Text Info */}
            <div className="flex flex-col justify-center flex-1">
              <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-[-0.015em] leading-tight">
                {profile?.data?.fullName || 'Your Name'}
              </h1>
              {profile?.data?.headline && (
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal mt-1">
                  {profile.data.headline}
                </p>
              )}
              <div className="mt-2 space-y-1">
                {(profile?.data?.currentRole || profile?.data?.currentCompany) && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">
                    {profile?.data?.currentRole}
                    {profile?.data?.currentRole && profile?.data?.currentCompany && ' • '}
                    {profile?.data?.currentCompany}
                  </p>
                )}
                {profile?.data?.currentLocation && (
                  <p className="text-gray-500 dark:text-gray-500 text-sm font-normal leading-normal">
                    {profile.data.currentLocation}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Contact Actions */}
          <div className="gap-3 flex flex-wrap justify-start border-t border-gray-200 dark:border-gray-700 pt-4">
            {profile?.data?.email && (
              <a
                href={`mailto:${profile.data.email}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900 hover:text-[#F97316] dark:hover:text-[#F97316] cursor-pointer transition-colors text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                <p>Email</p>
              </a>
            )}
            {profile?.data?.linkedinUrl && (
              <a
                href={profile.data.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900 hover:text-[#F97316] dark:hover:text-[#F97316] cursor-pointer transition-colors text-sm font-medium"
              >
                <Linkedin className="w-4 h-4" />
                <p>LinkedIn</p>
              </a>
            )}
            {profile?.data?.portfolioUrl && (
              <a
                href={profile.data.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900 hover:text-[#F97316] dark:hover:text-[#F97316] cursor-pointer transition-colors text-sm font-medium"
              >
                <LinkIcon className="w-4 h-4" />
                <p>Website</p>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
