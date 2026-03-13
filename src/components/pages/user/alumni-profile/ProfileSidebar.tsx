import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppRoute } from '@/constants/app-route';
import { Loader2, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface ProfileSidebarProps {
  profile: any;
  formData: any;
  isEditing: boolean;
  profileStrength: number;
  tempPhotoThumbnailUrl: string | null;
  isUploadingPhoto: boolean;
  isDeletingPhoto: boolean;
  isSaving: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoDelete: () => void;
  onSave: () => void;
  onEditClick?: () => void;
  onViewClick?: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profile,
  formData,
  isEditing,
  profileStrength,
  isSaving,
  onSave,
  onEditClick,
  onViewClick,
}) => {
  const navigate = useNavigate();
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-28 space-y-8">
        {/* Profile Strength Card */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#0F172A] dark:text-white">Profile Strength</span>
              <span className="text-sm font-semibold text-[#F97316]">{profileStrength}%</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#F97316] dark:bg-[#F97316] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${profileStrength}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete your profile to increase your visibility and connect with more alumni.</p>
          </div>
        </Card>

        {/* Quick Info Card - View Mode Only */}
        {!isEditing && (
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl p-6">
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {profile?.data?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span>{profile.data.email}</span>
                </li>
              )}
              {profile?.data?.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span>{profile.data.phone}</span>
                </li>
              )}
              {profile?.data?.currentLocation && (
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span>{profile.data.currentLocation}</span>
                </li>
              )}
              {profile?.data?.graduationYear && (
                <li className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span>Graduated: Class of '{String(profile.data.graduationYear).slice(-2)}</span>
                </li>
              )}
            </ul>
          </Card>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate({ to: AppRoute.user.editAlumniProfile.url })}
              className="w-full bg-[#F97316] text-white hover:bg-[#E85D04] h-12 text-base font-bold transition-colors rounded-lg"
            >
              Edit Profile
            </Button>
            <button className="w-full bg-orange-50 dark:bg-orange-950/20 text-[#F97316] dark:text-orange-400 text-base font-semibold hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors rounded-lg py-3">
              Download Resume
            </button>
          </div>
        )}
        
        {isEditing && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-[#F97316] to-[#E85D04] text-white hover:opacity-90 h-12 text-base font-bold transition-opacity"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save All Changes'
              )}
            </Button>
            <Button
              onClick={onViewClick}
              variant="outline"
              className="w-full h-12 text-base font-bold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#0F172A] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              View Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
