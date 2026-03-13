import React, { useState } from 'react';
import { useAlumniProfile, useSaveAlumniProfile, useAddAlumniSkill, useUploadAlumniProfilePhoto, useDeleteAlumniProfilePhoto, useRemoveAlumniSkill, useRemoveAlumniCertification } from '@/service/alumni-profile-api';
import { Loader2 } from 'lucide-react';
import { showNotifSuccess, showNotifError } from '@/lib/show-notif';
import { useAlumniProfileForm } from './useAlumniProfileForm';

// Import modular components
import { ProfileHeader } from './ProfileHeader';
import { PersonalInfoCard } from './PersonalInfoCard';
import { SkillsCard } from './SkillsCard';
import { ExperienceCards } from './ExperienceCards';
import { ProfileSidebar } from './ProfileSidebar';

export const AlumniProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: '' });
  
  const { data: profile, isLoading: isLoadingProfile } = useAlumniProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveAlumniProfile();
  const { mutate: addSkill, isPending: isAddingSkill } = useAddAlumniSkill();
  const { mutate: uploadPhoto, isPending: isUploadingPhoto } = useUploadAlumniProfilePhoto();
  const { mutate: deletePhoto, isPending: isDeletingPhoto } = useDeleteAlumniProfilePhoto();
  const { mutate: removeSkill } = useRemoveAlumniSkill();

  const {
    formData,
    setFormData,
    tempPhotoThumbnailUrl,
    setTempPhotoThumbnailUrl,
    handleInputChange,
    handleSwitchChange,
    calculateProfileStrength,
  } = useAlumniProfileForm(profile);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotifError({ message: 'Only image files are allowed.' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    uploadPhoto(formDataToSend, {
      onSuccess: (data: any) => {
        setFormData(prev => ({
          ...prev,
          photoUrl: data?.data?.photoUrl || ''
        }));
        setTempPhotoThumbnailUrl(data?.data?.photoThumbnailUrl || null);
        showNotifSuccess({ message: 'Photo uploaded successfully!' });
      },
      onError: (error) => {
        showNotifError({ message: error.message || 'Failed to upload photo.' });
      },
    });
  };

  const handlePhotoDelete = () => {
    if (!profile?.data?.photoUrl) return;

    deletePhoto(undefined, {
      onSuccess: () => {
        setTempPhotoThumbnailUrl(null);
        showNotifSuccess({ message: 'Photo deleted successfully!' });
      },
      onError: (error) => {
        showNotifError({ message: error.message || 'Failed to delete photo.' });
      },
    });
  };

  const handleRemoveSkill = (skillId: string) => {
    removeSkill(
      { id: skillId },
      {
        onSuccess: () => {
          showNotifSuccess({ message: 'Skill removed successfully!' });
        },
        onError: (error: Error) => {
          showNotifError({ message: error.message || 'Failed to remove skill.' });
        },
      }
    );
  };

  const handleSave = () => {
    const profileData = {
      fullName: formData.fullName,
      photoUrl: formData.photoUrl,
      bootcampName: formData.bootcampName,
      bootcampBatch: formData.bootcampBatch,
      graduationYear: formData.graduationYear,
      isPublic: formData.isPublic,
      portfolioUrl: formData.portfolioUrl,
      linkedinUrl: formData.linkedinUrl,
      githubUrl: formData.githubUrl,
      twitterUrl: formData.twitterUrl,
      email: formData.email,
      phone: formData.phone,
      currentLocation: formData.currentLocation,
      headline: formData.headline,
      bio: formData.bio,
      testimonial: formData.testimonial,
      currentCompany: formData.currentCompany,
      currentRole: formData.currentRole,
      salary: formData.salary || undefined,
      employmentStatus: formData.employmentStatus,
      yearsOfExperience: formData.yearsOfExperience || undefined,
    };
    
    saveProfile(profileData, {
      onSuccess: () => {
        showNotifSuccess({ message: "Profile saved successfully!" });
        setIsEditing(false);
      },
      onError: (error) => {
        showNotifError({ message: error.message || "Failed to save profile." });
      }
    });
  };

  const profileStrength = calculateProfileStrength();

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      showNotifError({ message: "Please enter a skill name." });
      return;
    }

    addSkill(
      { 
        skillName: newSkill.name, 
        proficiencyLevel: newSkill.level || undefined 
      },
      {
        onSuccess: () => {
          showNotifSuccess({ message: "Skill added successfully!" });
          setNewSkill({ name: '', level: '' });
        },
        onError: (error) => {
          showNotifError({ message: error.message || "Failed to add skill." });
        }
      }
    );
  };

  const handleSkillChange = (name: string, level: string) => {
    setNewSkill({ name, level });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-black leading-tight tracking-tighter text-[#0F172A] dark:text-white">{isEditing ? 'Edit Profile' : 'Your Profile'}</h1>
        {isEditing && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900 text-[#F97316] dark:text-orange-300 text-sm font-medium">
            <span className="material-symbols-outlined text-base">edit</span>
            <span>Edit Mode</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Profile Header - View Mode Only */}
          {!isEditing && <ProfileHeader profile={profile} />}

          {/* Personal Information */}
          <PersonalInfoCard
            isEditing={isEditing}
            formData={formData}
            profile={profile}
            onInputChange={handleInputChange}
            onSwitchChange={handleSwitchChange}
          />

          {/* Skills */}
          <SkillsCard
            isEditing={isEditing}
            profile={profile}
            newSkill={newSkill}
            isAddingSkill={isAddingSkill}
            onSkillChange={handleSkillChange}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />

          {/* Work Experience, Education, Certifications */}
          <ExperienceCards profile={profile} />
        </div>

        {/* Sidebar */}
        <ProfileSidebar
          profile={profile}
          formData={formData}
          isEditing={isEditing}
          profileStrength={profileStrength}
          tempPhotoThumbnailUrl={tempPhotoThumbnailUrl}
          isUploadingPhoto={isUploadingPhoto}
          isDeletingPhoto={isDeletingPhoto}
          isSaving={isSaving}
          onPhotoUpload={handlePhotoUpload}
          onPhotoDelete={handlePhotoDelete}
          onSave={handleSave}
          onEditClick={() => setIsEditing(true)}
          onViewClick={() => setIsEditing(false)}
        />
      </div>
    </div>
  );
};
