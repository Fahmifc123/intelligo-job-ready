import { db } from '../db/index.ts';
import { cvAnalysis, cvAnalysisAspects } from '../db/schema/cv-analysis.schema.ts';
import type { NewCvAnalysis, NewCvAnalysisAspect, CvAnalysis } from '../db/schema/cv-analysis.schema.ts';
import { eq } from 'drizzle-orm';
import axios from 'axios';
import config from '../config/env.config.ts';

export interface CvAnalysisResult {
  overallScore: number;
  // Removed experienceLevel
  aspects: CvAspectAnalysis[];
  suggestions: string[];
}

export interface CvAspectAnalysis {
  name: string;
  score: number;
  feedback: string;
}

// Define input interface for creating CV analysis
export interface CreateCvAnalysisInput {
  userId: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
  jobRole: string; // Added job role
  nama: string; // Added nama from session
}

// External API response interface
export interface ExternalCvAnalysisResponse {
  nama: string;
  role: string;
  skor_total_cv: string;
  skor_kecocokan_role: string;
  skor_aspek: {
    [key: string]: string;
  };
  kekuatan_utama: string[];
  gap: string[];
  prioritas_perbaikan: string[];
}

// Create a new CV analysis record
export async function createCvAnalysis(data: NewCvAnalysis) {
  const [result] = await db.insert(cvAnalysis).values(data).returning();
  return result;
}

// Create CV analysis aspects
export async function createCvAnalysisAspects(aspects: NewCvAnalysisAspect[]) {
  const results = await db.insert(cvAnalysisAspects).values(aspects).returning();
  return results;
}

// Get CV analysis by ID
export async function getCvAnalysisById(id: string): Promise<CvAnalysis | undefined> {
  const [result] = await db.select().from(cvAnalysis).where(eq(cvAnalysis.id, id));
  return result;
}

// Get CV analyses by user ID
export async function getCvAnalysesByUserId(userId: string) {
  const results = await db.select().from(cvAnalysis).where(eq(cvAnalysis.userId, userId)).orderBy(cvAnalysis.createdAt);
  return results;
}

// Get CV analysis aspects by CV analysis ID
export async function getCvAnalysisAspectsByAnalysisId(cvAnalysisId: string) {
  const results = await db.select().from(cvAnalysisAspects).where(eq(cvAnalysisAspects.cvAnalysisId, cvAnalysisId));
  return results;
}

// Call external CV analysis API using axios
export async function callExternalCvAnalysisApi(nama: string, jobRole: string, fileBuffer: Buffer, fileName: string): Promise<ExternalCvAnalysisResponse> {
  try {
    // DEBUG: Log the input parameters
    console.log('=== CV Analysis API Debug ===');
    console.log('API URL:', config.cvAnalysis.apiUrl);
    console.log('nama:', nama);
    console.log('jobRole:', jobRole);
    console.log('fileName:', fileName);
    console.log('fileBuffer type:', typeof fileBuffer);
    console.log('fileBuffer length:', fileBuffer?.length);
    
    // Create form data
    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('job_role', jobRole);
    // Convert Node.js Buffer to Uint8Array for use with Blob
    const uint8Array = new Uint8Array(fileBuffer);
    formData.append('cv', new Blob([uint8Array]), fileName);

    // DEBUG: Log FormData entries
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        console.log(`  ${key}: [Blob: ${value.type}, ${value.size} bytes]`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const response = await axios.post<ExternalCvAnalysisResponse>(
      config.cvAnalysis.apiUrl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error calling external CV analysis API:', error.message);
    console.error('API URL:', config.cvAnalysis.apiUrl);
    console.error('Request data:', { nama, jobRole, fileName });
    
    // If it's an axios error, include more details
    if (error.isAxiosError) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw new Error(`Failed to analyze CV with external API. Status: ${error.response?.status}. Message: ${error.response?.data || error.message}`);
    }
    
    throw new Error(`Failed to analyze CV with external API: ${error.message}`);
  }
}

// Transform external API response to our database format
export function transformExternalResponseToDbFormat(
  response: ExternalCvAnalysisResponse,
  userId: string
): NewCvAnalysis {
  return {
    userId,
    role: response.role,
    overallScore: parseInt(response.skor_total_cv),
    skorKecocokanRole: parseInt(response.skor_kecocokan_role),
    suggestions: response.prioritas_perbaikan,
    kekuatanUtama: response.kekuatan_utama,
    gaps: response.gap,
    prioritasPerbaikan: response.prioritas_perbaikan,
    updatedAt: new Date()
  };
}

// Exported async function following the pattern you showed
export async function createCvAnalysisWithFiles(input: CreateCvAnalysisInput) {
  try {
    // Call external API for CV analysis
    const externalResponse = await callExternalCvAnalysisApi(
      input.nama,
      input.jobRole,
      input.fileBuffer,
      input.fileName
    );
    
    // Transform response to our database format
    const cvAnalysisData = transformExternalResponseToDbFormat(externalResponse, input.userId);
    
    // Create CV analysis record in database
    const cvAnalysisRecord = await createCvAnalysis(cvAnalysisData);
    
    // Save aspects from the external response
    const aspectsToSave: NewCvAnalysisAspect[] = Object.entries(externalResponse.skor_aspek).map(([aspectName, score]) => ({
      cvAnalysisId: cvAnalysisRecord.id,
      aspectName: aspectName,
      score: parseInt(score), // Convert from 0-10 to 0-100 scale
      createdAt: new Date()
    }));
    
    if (aspectsToSave.length > 0) {
      await createCvAnalysisAspects(aspectsToSave);
    }
    
    return {
      success: true,
      data: cvAnalysisRecord,
      analysis: {
        overallScore: cvAnalysisRecord.overallScore,
        aspects: aspectsToSave.map(aspect => ({
          name: aspect.aspectName,
          score: aspect.score,
        })),
        suggestions: cvAnalysisRecord.suggestions
      }
    };
  } catch (error) {
    console.error('Error in createCvAnalysisWithFiles:', error);
    throw error;
  }
}