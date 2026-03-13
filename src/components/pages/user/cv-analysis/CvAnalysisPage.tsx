import React, { useState } from 'react';
import { useCvAnalysisUpload, useCvAnalysisList, useCvAnalysisDelete } from '@/service/cv-analysis-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showNotifSuccess, showNotifError } from '@/lib/show-notif';
import { Loader2, Upload, FileText, Briefcase, CheckCircle2, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { CvAnalysisResultPage } from './CvAnalysisResultPage';
import { cvAnalysisLabels, cvAnalysisMessages } from '@/locale/id/cv-analysis-locale';
import './cv-analysis-animations.css';

export const CvAnalysisPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState<string>('AI Engineer');
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const navigate = useNavigate();

  const { mutate: uploadCv, isPending: isUploading } = useCvAnalysisUpload();
  const { data: analysisList, isLoading: isLoadingList } = useCvAnalysisList();
  const { mutate: deleteCvAnalysis, isPending: isDeleting } = useCvAnalysisDelete();

  const [dragOver, setDragOver] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      showNotifError({
        message: cvAnalysisMessages.selectCvFile,
      });
      return;
    }

    if (!jobRole.trim()) {
      showNotifError({
        message: cvAnalysisMessages.selectJobRole,
      });
      return;
    }

    const formData = new FormData();
    formData.append('cvFile', selectedFile);
    formData.append('jobRole', jobRole);

    uploadCv(
      formData,
      {
        onSuccess: (data) => {
          showNotifSuccess({
            message: cvAnalysisMessages.analyzeSuccess,
          });
        },
        onError: (error) => {
          showNotifError({
            message: error.message || cvAnalysisMessages.analyzeFailed,
          });
        },
      }
    );
  };

  const handleAnalysisClick = (analysis: any) => {
    setSelectedResult(analysis);
  };

  const handleDeleteAnalysis = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(cvAnalysisMessages.deleteConfirm)) {
      deleteCvAnalysis(id, {
        onSuccess: () => {
          showNotifSuccess({
            message: cvAnalysisMessages.deleteSuccess,
          });
        },
        onError: (error) => {
          showNotifError({
            message: error.message || cvAnalysisMessages.deleteFailed,
          });
        },
      });
    }
  };

  const toggleAnalysisSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (!analysisList?.data) return;
    if (selectedIds.size === analysisList.data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(analysisList.data.map(a => a.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(cvAnalysisMessages.deleteConfirm)) {
      selectedIds.forEach(id => {
        deleteCvAnalysis(id, {
          onSuccess: () => {
            setSelectedIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          },
          onError: (error) => {
            showNotifError({
              message: error.message || cvAnalysisMessages.deleteFailed,
            });
          },
        });
      });
      showNotifSuccess({
        message: cvAnalysisMessages.deletingAnalyses,
      });
    }
  };

  if (selectedResult) {
    return (
      <div>
        <Button
          onClick={() => setSelectedResult(null)}
          className="mb-4 ml-4 sm:ml-0"
          variant="outline"
        >
          {cvAnalysisLabels.back}
        </Button>
        <CvAnalysisResultPage data={selectedResult} />
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full animate-fade-in">
      {/* Hero Section - Compact */}
      <div className="relative mb-3 text-center floating-shapes-bg py-4 px-4 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F7F8] via-blue-50/30 to-orange-50/20 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}></div>

        <div className="relative z-10">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-md shadow-orange-500/30 neon-glow animate-scale-in">
            <Sparkles className="h-3 w-3 animate-pulse-subtle" />
            {cvAnalysisLabels.aiPoweredAnalysis}
          </div>

          <h1 className="mb-1.5 text-2xl sm:text-3xl font-black tracking-tight text-[#023047] leading-tight">
            {cvAnalysisLabels.elevateYourCv}
            <span className="block mt-1 gradient-text text-xl sm:text-2xl">Stand Out. Get Hired.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs text-[#4B5563] font-medium">
            {cvAnalysisLabels.getInstantFeedback}
          </p>
        </div>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Upload Form */}
          <div className="lg:col-span-3 animate-slide-up">
            <Card className="border-2 border-transparent hover:border-orange-200 shadow-lg shadow-slate-300/50 overflow-hidden transition-all duration-500 hover-lift">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Upload Area */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="h-3.5 w-3.5 text-orange-500" />
                      <h2 className="text-base font-black text-[#023047]">{cvAnalysisLabels.uploadYourCv}</h2>
                    </div>
                    <p className="text-xs text-[#4B5563] mb-2">{cvAnalysisLabels.startByUploading}</p>

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300 ${dragOver
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 scale-[1.01] shadow-md shadow-orange-300/50 animate-glow-pulse'
                          : selectedFile
                            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm shadow-emerald-200/50'
                            : 'border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50 hover:border-orange-400 hover:shadow-sm hover:shadow-orange-100/30'
                        }`}
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-orange-400/10 to-transparent rounded-bl-full"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-tr-full"></div>

                      <div className="relative p-4 text-center">
                        {selectedFile ? (
                          <div className="space-y-2 animate-scale-in">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-500/40 animate-bounce">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#023047] truncate">{selectedFile.name}</p>
                              <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {cvAnalysisLabels.ready} ✨
                              </p>
                            </div>
                            <Button
                              onClick={() => setSelectedFile(null)}
                              variant="outline"
                              size="sm"
                              className="border-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400 font-semibold transition-all hover-scale h-7 text-xs"
                            >
                              {cvAnalysisLabels.chooseDifferentFile}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm shadow-orange-500/40 animate-float">
                              <Upload className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-[#023047] mb-0.5">
                                {cvAnalysisLabels.dragDropCv}
                              </h3>
                              <p className="text-xs text-[#4B5563] font-medium">
                                {cvAnalysisLabels.pdfOrDocx} • {cvAnalysisLabels.upTo5mb}
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 my-1.5">
                              <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-300" />
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cvAnalysisLabels.or}</span>
                              <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-300" />
                            </div>
                            <Input
                              id="cv-upload"
                              type="file"
                              accept=".pdf,.docx"
                              onChange={handleFileChange}
                              disabled={isUploading}
                              className="hidden"
                            />
                            <Button
                              onClick={() => document.getElementById('cv-upload')?.click()}
                              disabled={isUploading}
                              size="sm"
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-5 text-xs shadow-md shadow-orange-500/40 hover:shadow-lg hover:shadow-orange-500/50 transition-all hover-scale rounded-full h-8"
                            >
                              <Upload className="mr-1 h-3.5 w-3.5" />
                              {cvAnalysisLabels.browseFiles}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative py-0.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-xs font-bold text-[#FF5400] uppercase tracking-wider">{cvAnalysisLabels.thenSpecifyRole}</span>
                    </div>
                  </div>

                  {/* Job Role Input */}
                  <div>
                    <Label htmlFor="role" className="text-xs font-black text-[#023047] mb-1.5 flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-orange-500" />
                      {cvAnalysisLabels.targetJobRole}
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg opacity-0 group-focus-within:opacity-20 blur transition-opacity"></div>
                      <Briefcase className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-10" />
                      <Input
                        id="role"
                        type="text"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        placeholder={cvAnalysisLabels.egAiEngineer}
                        disabled={isUploading || !selectedFile}
                        className="relative h-9 pl-9 pr-3 text-xs font-medium border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg transition-all"
                      />
                    </div>
                    <p className="mt-1 text-xs text-[#4B5563] font-medium flex items-center gap-0.5">
                      <Sparkles className="h-3 w-3 text-orange-500" />
                      {cvAnalysisLabels.tailorAnalysis}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !selectedFile || !jobRole.trim()}
                    size="default"
                    className="w-full h-10 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/70 transition-all duration-300 rounded-full hover-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-gradient-shift"
                    style={{ backgroundSize: '200% 100%' }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        {cvAnalysisLabels.analyzingYourCv}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-1.5 h-4 w-4" />
                        {cvAnalysisLabels.analyzeCv}
                        <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis History */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Card className="border-2 border-transparent hover:border-orange-200 shadow-lg shadow-slate-300/50 h-full transition-all duration-500">
              <CardContent className="p-4 h-full flex flex-col overflow-hidden">
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <FileText className="h-3.5 w-3.5 text-orange-500" />
                        <h2 className="text-base font-black text-[#023047]">{cvAnalysisLabels.recentAnalyses}</h2>
                      </div>
                      <p className="text-xs text-[#4B5563] font-medium">{cvAnalysisLabels.yourPreviousEvaluations}</p>
                    </div>
                    {selectedIds.size > 0 && (
                      <Button
                        onClick={handleBulkDelete}
                        disabled={isDeleting}
                        variant="destructive"
                        size="sm"
                        className="h-7 font-bold shadow-sm hover-scale text-xs px-2"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete ({selectedIds.size})
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {isLoadingList ? (
                    <div className="flex flex-col items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500 mb-1.5" />
                      <p className="text-xs font-semibold text-slate-500">Loading analyses...</p>
                    </div>
                  ) : analysisList?.data && analysisList.data.length > 0 ? (
                    <div className="space-y-2">
                      {analysisList.data.length > 0 && (
                        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                          <Checkbox
                            checked={selectedIds.size > 0 && selectedIds.size === analysisList.data.length}
                            onCheckedChange={toggleSelectAll}
                            className="cursor-pointer h-3.5 w-3.5 border-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                          <span className="text-xs font-bold text-[#023047]">
                            {selectedIds.size > 0 ? `${selectedIds.size}/${analysisList.data.length} ${cvAnalysisLabels.selected}` : 'Pilih Semua'}
                          </span>
                        </div>
                      )}
                      {analysisList.data.map((analysis, index) => (
                        <div
                          key={analysis.id}
                          className="group flex items-center justify-between gap-2.5 p-3 rounded-lg border-2 border-slate-200 hover:border-orange-400 bg-white hover:shadow-md hover:shadow-orange-100/50 cursor-pointer transition-all duration-300 hover-lift animate-slide-up"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <Checkbox
                              checked={selectedIds.has(analysis.id)}
                              onCheckedChange={() => toggleAnalysisSelection(analysis.id)}
                              className="cursor-pointer flex-shrink-0 h-3.5 w-3.5 border-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 group-hover:from-orange-500 group-hover:to-orange-700 transition-all shadow-sm shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-110 duration-300">
                              <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <div
                              onClick={() => !selectedIds.has(analysis.id) && handleAnalysisClick(analysis)}
                              className="flex-1 min-w-0"
                            >
                              <p className="font-bold text-[#023047] mb-0.5 text-xs truncate">{analysis.role}</p>
                              <p className="text-xs text-[#4B5563] font-medium">
                                {new Date(analysis.createdAt).toLocaleDateString('id-ID', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="text-right">
                              <div className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 group-hover:border-orange-400 transition-colors">
                                <span className="text-lg font-black gradient-text">{analysis.overallScore}</span>
                              </div>
                              <div className="text-xs font-bold text-slate-500 mt-0.5">{cvAnalysisLabels.overallScore}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center animate-fade-in">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-gray-100 shadow-inner">
                        <FileText className="h-7 w-7 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-black text-[#023047] mb-1">{cvAnalysisLabels.noAnalysesYet}</h3>
                      <p className="text-xs text-[#4B5563] font-medium">{cvAnalysisLabels.uploadCvToGetStarted}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FF5400, #FF7A33);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #FF7A33, #FF5400);
        }
      `}</style>
    </div>
  );
};