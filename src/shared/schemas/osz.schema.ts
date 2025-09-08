/**
 * Zod schemas for OSZ file processing and beatmap validation
 * Comprehensive validation for all osu! beatmap formats and edge cases
 */

import { z } from 'zod';

/**
 * Basic validation utilities
 */
const NonEmptyString = z.string().min(1).trim();
const PositiveNumber = z.number().positive();
const NonNegativeNumber = z.number().nonnegative();
const BoundedNumber = (min: number, max: number) => z.number().min(min).max(max);
const SafeInteger = z.number().int().safe();
const Percentage = BoundedNumber(0, 100);

/**
 * Audio format validation
 */
export const AudioFormatSchema = z.object({
    sampleRate: PositiveNumber,
    channels: z.number().int().min(1).max(8),
    bitDepth: z.union([z.literal(16), z.literal(24), z.literal(32)]),
    codec: z.enum(['mp3', 'wav', 'ogg', 'm4a']),
    duration: PositiveNumber,
    bitrate: PositiveNumber.optional(),
});

/**
 * RGB Color validation
 */
export const RGBColorSchema = z.object({
    r: BoundedNumber(0, 255),
    g: BoundedNumber(0, 255),
    b: BoundedNumber(0, 255),
});

/**
 * Point2D validation
 */
export const Point2DSchema = z.object({
    x: z.number(),
    y: z.number(),
});

/**
 * Beatmap General section
 */
export const BeatmapGeneralSchema = z.object({
    audioFilename: NonEmptyString.refine(
        (filename) => /\.(mp3|wav|ogg|m4a)$/i.test(filename),
        { message: 'Audio filename must have valid audio extension' }
    ),
    audioLeadIn: NonNegativeNumber.default(0),
    previewTime: z.number().int().min(-1).default(-1), // -1 means no preview
    countdown: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(1),
    sampleSet: z.enum(['Normal', 'Soft', 'Drum']).default('Normal'),
    stackLeniency: BoundedNumber(0, 1).default(0.7),
    mode: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
    letterboxInBreaks: z.boolean().default(false),
    widescreenStoryboard: z.boolean().default(false),
}).strict();

/**
 * Beatmap Editor section
 */
export const BeatmapEditorSchema = z.object({
    bookmarks: z.array(NonNegativeNumber).default([]),
    distanceSpacing: PositiveNumber.default(1.0),
    beatDivisor: z.number().int().positive().default(4),
    gridSize: z.number().int().positive().default(4),
    timelineZoom: PositiveNumber.default(1.0),
}).strict().optional();

/**
 * Beatmap Metadata section
 */
export const BeatmapMetadataSchema = z.object({
    title: NonEmptyString,
    titleUnicode: z.string().default(''),
    artist: NonEmptyString,
    artistUnicode: z.string().default(''),
    creator: NonEmptyString,
    version: NonEmptyString,
    source: z.string().default(''),
    tags: z.array(z.string()).default([]),
    beatmapID: SafeInteger.default(0),
    beatmapSetID: SafeInteger.default(0),
}).strict();

/**
 * Beatmap Difficulty section
 */
export const BeatmapDifficultySchema = z.object({
    hpDrainRate: BoundedNumber(0, 10).default(5),
    circleSize: BoundedNumber(0, 10).default(4),
    overallDifficulty: BoundedNumber(0, 10).default(5),
    approachRate: BoundedNumber(0, 10).default(5),
    sliderMultiplier: PositiveNumber.default(1.4),
    sliderTickRate: PositiveNumber.default(1),
}).strict();

/**
 * Timing Point validation
 */
export const TimingPointSchema = z.object({
    time: z.number(),
    beatLength: z.number().refine(
        (val) => val !== 0,
        { message: 'Beat length cannot be zero' }
    ),
    meter: z.number().int().positive().default(4),
    sampleSet: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
    sampleIndex: NonNegativeNumber.default(0),
    volume: Percentage.default(100),
    uninherited: z.boolean().default(true),
    effects: z.object({
        kiaiTime: z.boolean().default(false),
        omitFirstBarLine: z.boolean().default(false),
    }).default(() => ({ kiaiTime: false, omitFirstBarLine: false })),
}).strict();

/**
 * Hit Sound validation
 */
export const HitSoundSchema = z.object({
    normal: z.boolean().default(true),
    whistle: z.boolean().default(false),
    finish: z.boolean().default(false),
    clap: z.boolean().default(false),
});

/**
 * Hit Object Type validation
 */
export const HitObjectTypeSchema = z.object({
    circle: z.boolean().default(false),
    slider: z.boolean().default(false),
    newCombo: z.boolean().default(false),
    spinner: z.boolean().default(false),
    colourSkip: BoundedNumber(0, 3).default(0),
    hold: z.boolean().default(false), // mania only
});

/**
 * Hit Sample Additions validation
 */
export const HitSampleAdditionsSchema = z.object({
    sampleSet: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
    additionSet: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
    customIndex: NonNegativeNumber.default(0),
    volume: Percentage.default(100),
    filename: z.string().optional(),
}).optional();

/**
 * Slider Data validation
 */
export const SliderDataSchema = z.object({
    curveType: z.enum(['L', 'P', 'B', 'C']),
    curvePoints: z.array(Point2DSchema).min(1),
    slides: z.number().int().positive(),
    length: PositiveNumber,
    edgeSounds: z.array(HitSoundSchema).default([]),
    edgeSets: z.array(HitSampleAdditionsSchema).default([]),
}).optional();

/**
 * Hit Object validation
 */
export const HitObjectSchema = z.object({
    x: BoundedNumber(0, 512),
    y: BoundedNumber(0, 384),
    time: NonNegativeNumber,
    type: HitObjectTypeSchema,
    hitSound: HitSoundSchema,
    endTime: NonNegativeNumber.optional(),
    additions: HitSampleAdditionsSchema,
    sliderData: SliderDataSchema,
}).strict().refine(
    (obj) => {
        // Validate that sliders have slider data
        if (obj.type.slider && !obj.sliderData) {
            return false;
        }
        // Validate that spinners have end time
        if (obj.type.spinner && !obj.endTime) {
            return false;
        }
        // Validate hit object coordinates are within bounds
        if (obj.x < 0 || obj.x > 512 || obj.y < 0 || obj.y > 384) {
            return false;
        }
        return true;
    },
    {
        message: 'Invalid hit object configuration',
    }
);

/**
 * Break Period validation
 */
export const BreakPeriodSchema = z.object({
    startTime: NonNegativeNumber,
    endTime: NonNegativeNumber,
}).refine(
    (brk) => brk.endTime > brk.startTime,
    { message: 'Break end time must be after start time' }
);

/**
 * Beatmap Events section
 */
export const BeatmapEventsSchema = z.object({
    backgroundPath: z.string().optional(),
    videoPath: z.string().optional(),
    breaks: z.array(BreakPeriodSchema).default([]),
    storyboard: z.object({
        sprites: z.array(z.unknown()).default([]),
        animations: z.array(z.unknown()).default([]),
    }).optional(),
}).default(() => ({ breaks: [] }));

/**
 * Beatmap Colours section
 */
export const BeatmapColoursSchema = z.object({
    combo: z.array(RGBColorSchema).min(1).default([
        { r: 255, g: 192, b: 0 },
        { r: 0, g: 202, b: 0 },
        { r: 18, g: 124, b: 255 },
        { r: 242, g: 24, b: 57 },
    ]),
    sliderTrackOverride: RGBColorSchema.optional(),
    sliderBorder: RGBColorSchema.optional(),
}).default(() => ({
    combo: [
        { r: 255, g: 192, b: 0 },
        { r: 0, g: 202, b: 0 },
        { r: 18, g: 124, b: 255 },
        { r: 242, g: 24, b: 57 },
    ]
}));

/**
 * Complete Beatmap validation
 */
export const BeatmapSchema = z.object({
    general: BeatmapGeneralSchema,
    editor: BeatmapEditorSchema,
    metadata: BeatmapMetadataSchema,
    difficulty: BeatmapDifficultySchema,
    events: BeatmapEventsSchema,
    timingPoints: z.array(TimingPointSchema).min(1).refine(
        (points) => {
            // Must have at least one uninherited timing point
            return points.some(point => point.uninherited);
        },
        { message: 'Beatmap must have at least one uninherited timing point' }
    ),
    colours: BeatmapColoursSchema,
    hitObjects: z.array(HitObjectSchema).refine(
        (objects) => {
            // Hit objects must be sorted by time
            for (let i = 1; i < objects.length; i++) {
                const current = objects[i];
                const previous = objects[i - 1];
                if (current && previous && current.time < previous.time) {
                    return false;
                }
            }
            return true;
        },
        { message: 'Hit objects must be sorted by time' }
    ),
}).strict();

/**
 * Difficulty Metadata validation
 */
export const DifficultyMetadataSchema = z.object({
    version: NonEmptyString,
    starRating: NonNegativeNumber.default(0),
    overallDifficulty: BoundedNumber(0, 10),
    approachRate: BoundedNumber(0, 10),
    circleSize: BoundedNumber(0, 10),
    hpDrainRate: BoundedNumber(0, 10),
    maxCombo: NonNegativeNumber.default(0),
    objectCount: NonNegativeNumber.default(0),
}).strict();

/**
 * Chart Metadata validation
 */
export const ChartMetadataSchema = z.object({
    id: NonEmptyString,
    title: NonEmptyString,
    artist: NonEmptyString,
    creator: NonEmptyString,
    source: z.string().optional(),
    tags: z.array(z.string()).default([]),
    bpm: PositiveNumber,
    duration: PositiveNumber,
    gameMode: z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
    difficulties: z.array(DifficultyMetadataSchema).min(1),
    backgroundImage: z.string().optional(),
    previewTime: NonNegativeNumber.optional(),
    audioFilename: NonEmptyString,
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
}).strict();

/**
 * OSZ File structure validation
 */
export const OszFileEntrySchema = z.object({
    name: NonEmptyString,
    path: NonEmptyString,
    size: NonNegativeNumber,
    isDirectory: z.boolean(),
    data: z.instanceof(Buffer).optional(),
});

export const OszFileStructureSchema = z.object({
    beatmapFiles: z.array(OszFileEntrySchema).min(1),
    audioFiles: z.array(OszFileEntrySchema).min(1),
    imageFiles: z.array(OszFileEntrySchema).default([]),
    videoFiles: z.array(OszFileEntrySchema).default([]),
    storyboardFiles: z.array(OszFileEntrySchema).default([]),
    hitsoundFiles: z.array(OszFileEntrySchema).default([]),
    skinFiles: z.array(OszFileEntrySchema).default([]),
    otherFiles: z.array(OszFileEntrySchema).default([]),
}).refine(
    (structure) => {
        // Validate that we have at least one audio file that matches beatmap references
        const audioFilenames = structure.audioFiles.map(f => f.name.toLowerCase());
        // We'd need to parse beatmap files to get audio references

        // Basic validation - at least one audio file exists
        return audioFilenames.length > 0;
    },
    {
        message: 'OSZ must contain at least one valid audio file',
    }
);

/**
 * OSZ Content validation (after parsing)
 */
export const OszContentSchema = z.object({
    metadata: ChartMetadataSchema,
    difficulties: z.map(z.string(), BeatmapSchema).refine(
        (difficulties) => difficulties.size > 0,
        { message: 'OSZ must contain at least one valid difficulty' }
    ),
    audioFile: z.object({
        filename: NonEmptyString,
        data: z.instanceof(Buffer),
        format: AudioFormatSchema.optional(),
    }),
    backgroundImage: z.object({
        filename: NonEmptyString,
        data: z.instanceof(Buffer),
    }).optional(),
    hitsounds: z.map(z.string(), z.instanceof(Buffer)).default(new Map()),
    videoFile: z.object({
        filename: NonEmptyString,
        data: z.instanceof(Buffer),
    }).optional(),
}).strict();

/**
 * OSZ Import Request validation
 */
export const OszImportRequestSchema = z.object({
    filePath: NonEmptyString.refine(
        (path) => path.endsWith('.osz'),
        { message: 'File must have .osz extension' }
    ),
    options: z.object({
        validateIntegrity: z.boolean().default(true),
        extractImages: z.boolean().default(true),
        extractVideo: z.boolean().default(false),
        extractHitsounds: z.boolean().default(true),
        overwriteExisting: z.boolean().default(false),
        generatePreviews: z.boolean().default(true),
    }).default(() => ({
        validateIntegrity: true,
        extractImages: true,
        extractVideo: false,
        extractHitsounds: true,
        overwriteExisting: false,
        generatePreviews: true,
    })),
}).strict();

/**
 * OSZ Processing Result validation
 */
export const OszProcessingResultSchema = z.object({
    success: z.boolean(),
    chartId: z.string().optional(),
    metadata: ChartMetadataSchema.optional(),
    errors: z.array(z.object({
        code: z.string(),
        message: z.string(),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        file: z.string().optional(),
        line: z.number().optional(),
    })).default([]),
    warnings: z.array(z.object({
        code: z.string(),
        message: z.string(),
        file: z.string().optional(),
    })).default([]),
    importedFiles: z.array(z.string()).default([]),
    skippedFiles: z.array(z.string()).default([]),
    processingTime: PositiveNumber,
    memoryUsed: NonNegativeNumber,
}).strict();

/**
 * Raw OSZ data validation (before parsing)
 */
export const RawOszDataSchema = z.object({
    filePath: NonEmptyString,
    fileSize: PositiveNumber,
    zipEntries: z.array(z.object({
        entryName: NonEmptyString,
        size: NonNegativeNumber,
        compressedSize: NonNegativeNumber,
        crc: z.number(),
        isDirectory: z.boolean(),
    })),
    extractionPath: z.string().optional(),
}).strict();

/**
 * Export all schemas for use throughout the application
 */
export const OszSchemas = {
    // Core schemas
    Beatmap: BeatmapSchema,
    ChartMetadata: ChartMetadataSchema,
    OszContent: OszContentSchema,

    // Processing schemas
    ImportRequest: OszImportRequestSchema,
    ProcessingResult: OszProcessingResultSchema,
    FileStructure: OszFileStructureSchema,
    RawData: RawOszDataSchema,

    // Component schemas
    General: BeatmapGeneralSchema,
    Metadata: BeatmapMetadataSchema,
    Difficulty: BeatmapDifficultySchema,
    TimingPoint: TimingPointSchema,
    HitObject: HitObjectSchema,
    AudioFormat: AudioFormatSchema,
} as const;

// Type exports for TypeScript
export type ValidatedBeatmap = z.infer<typeof BeatmapSchema>;
export type ValidatedChartMetadata = z.infer<typeof ChartMetadataSchema>;
export type ValidatedOszContent = z.infer<typeof OszContentSchema>;
export type ValidatedImportRequest = z.infer<typeof OszImportRequestSchema>;
export type ValidatedProcessingResult = z.infer<typeof OszProcessingResultSchema>;
