/**
 * Schema validation system index
 * Exports all Zod schemas for data validation throughout the PRG project
 */

// OSZ and beatmap schemas
export { OszSchemas } from './osz.schema';
export type {
  ValidatedBeatmap,
  ValidatedChartMetadata,
  ValidatedOszContent,
  ValidatedImportRequest,
  ValidatedProcessingResult,
} from './osz.schema';

// IPC communication schemas
export { IpcSchemas } from './ipc.schema';
export type {
  ValidatedGameStartRequest,
  ValidatedGameStartResponse,
  ValidatedOszImportRequest,
  ValidatedOszImportResponse,
  ValidatedKnifeThrowRequest,
  ValidatedKnifeResultEvent,
  ValidatedGameModifiers,
} from './ipc.schema';

// Settings and configuration schemas
export { SettingsSchemas } from './settings.schema';
export type {
  ValidatedUserSettings,
  ValidatedAudioSettings,
  ValidatedVisualSettings,
  ValidatedInputSettings,
  ValidatedGameplaySettings,
  ValidatedSettingsImport,
  ValidatedSettingsExport,
  ValidatedSettingsPatch,
  ValidatedSettingsValidationResult,
} from './settings.schema';

/**
 * Combined schema collections for easy access
 */
export const AllSchemas = {
  Osz: () => import('./osz.schema').then(m => m.OszSchemas),
  Ipc: () => import('./ipc.schema').then(m => m.IpcSchemas),
  Settings: () => import('./settings.schema').then(m => m.SettingsSchemas),
} as const;

/**
 * Schema validation utilities
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    issues: Array<{
      path: string[];
      message: string;
      code: string;
    }>;
  };
}

/**
 * Generic schema validator helper
 */
export function validateWithSchema<T>(
  schema: import('zod').ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data validation failed',
          issues: result.error.issues.map(issue => ({
            path: issue.path.map(String),
            message: issue.message,
            code: issue.code,
          })),
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'SCHEMA_ERROR',
        message: error instanceof Error ? error.message : 'Unknown schema error',
        issues: [],
      },
    };
  }
}
