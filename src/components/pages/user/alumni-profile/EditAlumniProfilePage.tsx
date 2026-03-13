import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAlumniProfile, useSaveAlumniProfile, useAddAlumniSkill, useUploadAlumniProfilePhoto, useDeleteAlumniProfilePhoto, useRemoveAlumniSkill, useRemoveAlumniWorkExperience, useRemoveAlumniEducation, useRemoveAlumniCertification } from '@/service/alumni-profile-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Camera, X, Plus, Edit, Trash2 } from 'lucide-react';
import { showNotifSuccess, showNotifError } from '@/lib/show-notif';

interface WorkExperienceForm {
  id?: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface EducationForm {
  id?: string;
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface CertificationForm {
  id?: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  credentialUrl: string;
  credentialId: string;
}

interface SkillForm {
  name: string;
  level: string;
}

export const EditAlumniProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [tempPhotoThumbnailUrl, setTempPhotoThumbnailUrl] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<SkillForm>({ name: '', level: '' });
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceForm[]>([]);
  const [educationList, setEducationList] = useState<EducationForm[]>([]);
  const [certificationList, setCertificationList] = useState<CertificationForm[]>([]);
  
  const { data: profile, isLoading: isLoadingProfile } = useAlumniProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveAlumniProfile();
  const { mutate: addSkill, isPending: isAddingSkill } = useAddAlumniSkill();
  const { mutate: uploadPhoto, isPending: isUploadingPhoto } = useUploadAlumniProfilePhoto();
  const { mutate: deletePhoto, isPending: isDeletingPhoto } = useDeleteAlumniProfilePhoto();
  const { mutate: removeSkill } = useRemoveAlumniSkill();
  const { mutate: deleteWorkExp } = useRemoveAlumniWorkExperience();
  const { mutate: deleteEdu } = useRemoveAlumniEducation();
  const { mutate: deleteCert } = useRemoveAlumniCertification();

  const [formData, setFormData] = useState({
    fullName: '',
    photoUrl: '',
    bootcampName: '',
    bootcampBatch: '',
    graduationYear: new Date().getFullYear(),
    currentRole: '',
    currentCompany: '',
    yearsOfExperience: 0,
    employmentStatus: '',
    salary: 0,
    isPublic: false,
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    email: '',
    phone: '',
    currentLocation: '',
    headline: '',
    bio: '',
    testimonial: '',
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile?.data) {
      setFormData({
        fullName: profile.data.fullName,
        photoUrl: profile.data.photoUrl || '',
        bootcampName: profile.data.bootcampName,
        bootcampBatch: profile.data.bootcampBatch || '',
        graduationYear: profile.data.graduationYear,
        currentRole: profile.data.currentRole || '',
        currentCompany: profile.data.currentCompany || '',
        yearsOfExperience: profile.data.yearsOfExperience || 0,
        employmentStatus: profile.data.employmentStatus || '',
        salary: profile.data.salary || 0,
        isPublic: profile.data.isPublic,
        portfolioUrl: profile.data.portfolioUrl || '',
        linkedinUrl: profile.data.linkedinUrl || '',
        githubUrl: profile.data.githubUrl || '',
        twitterUrl: profile.data.twitterUrl || '',
        email: profile.data.email || '',
        phone: profile.data.phone || '',
        currentLocation: profile.data.currentLocation || '',
        headline: profile.data.headline || '',
        bio: profile.data.bio || '',
        testimonial: profile.data.testimonial || '',
      });

      // Initialize work experiences
      if (profile.data.workExperiences) {
        setWorkExperiences(profile.data.workExperiences.map((exp: any) => ({
          id: exp.id,
          companyName: exp.companyName,
          position: exp.position,
          startDate: new Date(exp.startDate).toISOString().split('T')[0],
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
          isCurrent: exp.isCurrent,
          description: exp.description || '',
        })));
      }

      // Initialize education
      if (profile.data.educationHistory) {
        setEducationList(profile.data.educationHistory.map((edu: any) => ({
          id: edu.id,
          schoolName: edu.schoolName,
          degree: edu.degree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
          endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
          isCurrent: edu.isCurrent,
        })));
      }

      // Initialize certifications
      if (profile.data.certificationsData) {
        setCertificationList(profile.data.certificationsData.map((cert: any) => ({
          id: cert.id,
          certificationName: cert.certificationName,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
          credentialUrl: cert.credentialUrl || '',
          credentialId: cert.credentialId || '',
        })));
      }

      if (profile.data.photoThumbnailUrl) {
        setTempPhotoThumbnailUrl(profile.data.photoThumbnailUrl);
      }
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' || name === 'salary' || name === 'graduationYear' ? Number(value) : value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isPublic: checked
    }));
  };

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
      onError: (error: Error) => {
        showNotifError({ message: error.message || 'Failed to upload photo.' });
      },
    });
  };

  const handlePhotoDelete = () => {
    if (!profile?.data?.photoUrl) return;

    deletePhoto(undefined, {
      onSuccess: () => {
        setTempPhotoThumbnailUrl(null);
        setFormData(prev => ({ ...prev, photoUrl: '' }));
        showNotifSuccess({ message: 'Photo deleted successfully!' });
      },
      onError: (error: Error) => {
        showNotifError({ message: error.message || 'Failed to delete photo.' });
      },
    });
  };

  const handleAddWorkExperience = () => {
    const newExp: WorkExperienceForm = {
      companyName: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    };
    // For new items, they'll be saved when user clicks "Save All Changes"
    setWorkExperiences([...workExperiences, newExp]);
  };

  const handleUpdateWorkExperience = (index: number, field: string, value: any) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperiences(updated);
  };

  const handleDeleteWorkExperience = (index: number) => {
    const exp = workExperiences[index];
    if (exp.id) {
      deleteWorkExp({ id: exp.id }, {
        onSuccess: () => {
          setWorkExperiences(workExperiences.filter((_, i) => i !== index));
          showNotifSuccess({ message: 'Work experience deleted!' });
        },
        onError: (error) => {
          showNotifError({ message: error.message || 'Failed to delete work experience.' });
        },
      });
    } else {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  };

  const handleAddEducation = () => {
    const newEdu: EducationForm = {
      schoolName: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    };
    setEducationList([...educationList, newEdu]);
  };

  const handleUpdateEducation = (index: number, field: string, value: any) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: value };
    setEducationList(updated);
  };

  const handleDeleteEducation = (index: number) => {
    const edu = educationList[index];
    if (edu.id) {
      deleteEdu({ id: edu.id }, {
        onSuccess: () => {
          setEducationList(educationList.filter((_, i) => i !== index));
          showNotifSuccess({ message: 'Education deleted!' });
        },
        onError: (error) => {
          showNotifError({ message: error.message || 'Failed to delete education.' });
        },
      });
    } else {
      setEducationList(educationList.filter((_, i) => i !== index));
    }
  };

  const handleAddCertification = () => {
    const newCert: CertificationForm = {
      certificationName: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialUrl: '',
      credentialId: '',
    };
    setCertificationList([...certificationList, newCert]);
  };

  const handleUpdateCertification = (index: number, field: string, value: any) => {
    const updated = [...certificationList];
    updated[index] = { ...updated[index], [field]: value };
    setCertificationList(updated);
  };

  const handleDeleteCertification = (index: number) => {
    const cert = certificationList[index];
    if (cert.id) {
      deleteCert({ id: cert.id }, {
        onSuccess: () => {
          setCertificationList(certificationList.filter((_, i) => i !== index));
          showNotifSuccess({ message: 'Certification deleted!' });
        },
        onError: (error) => {
          showNotifError({ message: error.message || 'Failed to delete certification.' });
        },
      });
    } else {
      setCertificationList(certificationList.filter((_, i) => i !== index));
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      showNotifError({ message: 'Please enter a skill name.' });
      return;
    }

    addSkill(
      { 
        skillName: newSkill.name, 
        proficiencyLevel: newSkill.level || undefined 
      },
      {
        onSuccess: () => {
          showNotifSuccess({ message: 'Skill added successfully!' });
          setNewSkill({ name: '', level: '' });
        },
        onError: (error) => {
          showNotifError({ message: error.message || 'Failed to add skill.' });
        }
      }
    );
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
    const profileData: Partial<any> = {
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
      currentCompany: formData.currentCompany,
      currentRole: formData.currentRole,
      salary: formData.salary || undefined,
      employmentStatus: formData.employmentStatus,
      yearsOfExperience: formData.yearsOfExperience || undefined,
      testimonial: formData.testimonial,
      workExperiences: workExperiences.filter(exp => exp.companyName || exp.position || exp.startDate).map(exp => ({
        ...((exp.id) && { id: exp.id }),
        companyName: exp.companyName,
        position: exp.position,
        startDate: exp.startDate ? new Date(exp.startDate + '-01').toISOString() : '',
        endDate: exp.endDate ? new Date(exp.endDate + '-01').toISOString() : null,
        isCurrent: exp.isCurrent,
        description: exp.description || null,
      })) as any,
      educationHistory: educationList.filter(edu => edu.schoolName).map(edu => ({
        ...((edu.id) && { id: edu.id }),
        schoolName: edu.schoolName,
        degree: edu.degree || null,
        fieldOfStudy: edu.fieldOfStudy || null,
        startDate: edu.startDate ? new Date(edu.startDate + '-01').toISOString() : null,
        endDate: edu.endDate ? new Date(edu.endDate + '-01').toISOString() : null,
        isCurrent: edu.isCurrent,
      })) as any,
      certificationsData: certificationList.filter(cert => cert.certificationName || cert.issuingOrganization).map(cert => ({
        ...((cert.id) && { id: cert.id }),
        certificationName: cert.certificationName,
        issuingOrganization: cert.issuingOrganization,
        issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString() : null,
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString() : null,
        credentialUrl: cert.credentialUrl || null,
        credentialId: cert.credentialId || null,
      })) as any,
    };
    
    saveProfile(profileData, {
      onSuccess: () => {
        showNotifSuccess({ message: "Profile saved successfully!" });
      },
      onError: (error) => {
        showNotifError({ message: error.message || "Failed to save profile." });
      }
    });
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
        <h1 className="text-4xl font-black leading-tight tracking-tighter">Edit Profile</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-sm font-medium">
          <Edit className="w-4 h-4" />
          <span>Edit Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Left Sidebar */}
        <aside className="lg:col-span-1 lg:sticky lg:top-28 space-y-8">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                {/* Photo Upload */}
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full bg-center bg-no-repeat bg-cover border-4 border-gray-200 dark:border-gray-700"
                    style={tempPhotoThumbnailUrl ? { backgroundImage: `url(${tempPhotoThumbnailUrl})` } : { backgroundColor: '#f0f0f0' }}
                  />
                  <label 
                    htmlFor="photo-upload"
                    className="absolute bottom-1 right-1 flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                  />
                </div>

                {/* Name */}
                <div className="flex flex-col justify-center w-full">
                  <p className="text-2xl font-bold tracking-tight">{formData.fullName || 'Your Name'}</p>
                  <p className="text-gray-600 dark:text-gray-400">{formData.headline || 'Your headline'}</p>
                </div>
              </div>

              {/* Contact Fields */}
              <div className="mt-8 space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium pb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium pb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium pb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium pb-2">GitHub Profile</label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium pb-2">Twitter/X Profile</label>
                  <input
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium pb-2">Portfolio URL</label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Public Profile Toggle */}
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Make my profile public</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => handleSwitchChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-orange-600 text-white hover:bg-orange-700 h-12 text-base font-bold"
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
                <button
                  onClick={() => navigate({ to: '/profile/alumni' })}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-base font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors rounded-lg py-3"
                >
                  View Profile
                </button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold tracking-tight mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Headline</label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    name="currentLocation"
                    value={formData.currentLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Professional Summary</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white min-h-[120px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold tracking-tight mb-6">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Role</label>
                  <input
                    type="text"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employment Status</label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(e as any)}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select status</option>
                    <option value="Employed">Employed</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Job Seeking">Job Seeking</option>
                    <option value="Self-Employed">Self-Employed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salary (Optional)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bootcamp Information */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold tracking-tight mb-6">Bootcamp Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Bootcamp Name</label>
                  <input
                    type="text"
                    name="bootcampName"
                    value={formData.bootcampName}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bootcamp Batch</label>
                  <input
                    type="text"
                    name="bootcampBatch"
                    value={formData.bootcampBatch}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Graduation Year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    className="w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold tracking-tight mb-6">Testimonial</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Testimonial about Intelligo ID (Optional)</label>
                <textarea
                  name="testimonial"
                  value={formData.testimonial}
                  onChange={handleInputChange}
                  placeholder="Share your experience with Intelligo ID bootcamp"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold tracking-tight mb-6">Skills</h3>
              <div className="flex flex-wrap items-center gap-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                {profile?.data?.skills?.map((skill: any) => (
                  <span key={skill.id} className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 py-1 px-3 rounded-full text-sm font-medium">
                    {skill.skillName}
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="hover:text-orange-900 dark:hover:text-orange-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                <div className="flex gap-2 flex-1 min-w-[150px]">
                  <input
                    type="text"
                    placeholder="Add a new skill..."
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddSkill}
                    disabled={isAddingSkill}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {isAddingSkill ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Work Experience</h3>
                <Button
                  onClick={handleAddWorkExperience}
                  className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
              <div className="space-y-6">
                {workExperiences.map((exp, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={exp.position}
                          onChange={(e) => handleUpdateWorkExperience(index, 'position', e.target.value)}
                          className="w-full px-2 py-1 font-bold text-lg bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded mb-2 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={exp.companyName}
                          onChange={(e) => handleUpdateWorkExperience(index, 'companyName', e.target.value)}
                          className="w-full px-2 py-1 text-gray-600 dark:text-gray-400 bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded"
                        />
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1">
                        <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkExperience(index)}
                          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Start Date</label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => handleUpdateWorkExperience(index, 'startDate', e.target.value)}
                          className="w-full px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">End Date</label>
                        <div className="flex gap-2">
                          <input
                            type="month"
                            value={exp.endDate}
                            disabled={exp.isCurrent}
                            onChange={(e) => handleUpdateWorkExperience(index, 'endDate', e.target.value)}
                            className="flex-1 px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white disabled:opacity-50"
                          />
                          <label className="flex items-center gap-2 px-3">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={(e) => handleUpdateWorkExperience(index, 'isCurrent', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-xs">Present</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleUpdateWorkExperience(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white min-h-[90px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Education</h3>
                <Button
                  onClick={handleAddEducation}
                  className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
              <div className="space-y-6">
                {educationList.map((edu, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="School/University Name"
                          value={edu.schoolName}
                          onChange={(e) => handleUpdateEducation(index, 'schoolName', e.target.value)}
                          className="w-full px-2 py-1 font-bold text-lg bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded mb-2 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                          className="w-full px-2 py-1 text-gray-600 dark:text-gray-400 bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded"
                        />
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1">
                        <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteEducation(index)}
                          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Field of Study</label>
                        <input
                          type="text"
                          placeholder="Field of Study"
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleUpdateEducation(index, 'fieldOfStudy', e.target.value)}
                          className="w-full px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Start Year</label>
                        <input
                          type="number"
                          placeholder="2020"
                          value={edu.startDate.slice(0, 4)}
                          onChange={(e) => handleUpdateEducation(index, 'startDate', e.target.value + '-01')}
                          className="w-full px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">End Year</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="2024"
                            value={edu.endDate.slice(0, 4)}
                            disabled={edu.isCurrent}
                            onChange={(e) => handleUpdateEducation(index, 'endDate', e.target.value + '-12')}
                            className="flex-1 px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white disabled:opacity-50"
                          />
                          <label className="flex items-center gap-2 px-3">
                            <input
                              type="checkbox"
                              checked={edu.isCurrent}
                              onChange={(e) => handleUpdateEducation(index, 'isCurrent', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-xs">Current</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Certifications</h3>
                <Button
                  onClick={handleAddCertification}
                  className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
              <div className="space-y-6">
                {certificationList.map((cert, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Certification Name"
                          value={cert.certificationName}
                          onChange={(e) => handleUpdateCertification(index, 'certificationName', e.target.value)}
                          className="w-full px-2 py-1 font-bold text-lg bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded mb-2 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Issuing Organization"
                          value={cert.issuingOrganization}
                          onChange={(e) => handleUpdateCertification(index, 'issuingOrganization', e.target.value)}
                          className="w-full px-2 py-1 text-gray-600 dark:text-gray-400 bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded"
                        />
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1">
                        <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteCertification(index)}
                          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Issue Date</label>
                        <input
                          type="date"
                          value={cert.issueDate}
                          onChange={(e) => handleUpdateCertification(index, 'issueDate', e.target.value)}
                          className="w-full px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Expiry Date</label>
                        <input
                          type="date"
                          value={cert.expiryDate}
                          onChange={(e) => handleUpdateCertification(index, 'expiryDate', e.target.value)}
                          className="w-full px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Credential URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/credential"
                          value={cert.credentialUrl}
                          onChange={(e) => handleUpdateCertification(index, 'credentialUrl', e.target.value)}
                          className="w-full px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Credential ID</label>
                        <input
                          type="text"
                          placeholder="Credential ID"
                          value={cert.credentialId}
                          onChange={(e) => handleUpdateCertification(index, 'credentialId', e.target.value)}
                          className="w-full px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
