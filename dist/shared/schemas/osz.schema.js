"use strict";
/**
 * Zod schemas for OSZ file processing and beatmap validation
 * Comprehensive validation for all osu! beatmap formats and edge cases
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OszSchemas = exports.RawOszDataSchema = exports.OszProcessingResultSchema = exports.OszImportRequestSchema = exports.OszContentSchema = exports.OszFileStructureSchema = exports.OszFileEntrySchema = exports.ChartMetadataSchema = exports.DifficultyMetadataSchema = exports.BeatmapSchema = exports.BeatmapColoursSchema = exports.BeatmapEventsSchema = exports.BreakPeriodSchema = exports.HitObjectSchema = exports.SliderDataSchema = exports.HitSampleAdditionsSchema = exports.HitObjectTypeSchema = exports.HitSoundSchema = exports.TimingPointSchema = exports.BeatmapDifficultySchema = exports.BeatmapMetadataSchema = exports.BeatmapEditorSchema = exports.BeatmapGeneralSchema = exports.Point2DSchema = exports.RGBColorSchema = exports.AudioFormatSchema = void 0;
const zod_1 = require("zod");
/**
 * Basic validation utilities
 */
const NonEmptyString = zod_1.z.string().min(1).trim();
const PositiveNumber = zod_1.z.number().positive();
const NonNegativeNumber = zod_1.z.number().nonnegative();
const BoundedNumber = (min, max) => zod_1.z.number().min(min).max(max);
const SafeInteger = zod_1.z.number().int().safe();
const Percentage = BoundedNumber(0, 100);
/**
 * Audio format validation
 */
exports.AudioFormatSchema = zod_1.z.object({
    sampleRate: PositiveNumber,
    channels: zod_1.z.number().int().min(1).max(8),
    bitDepth: zod_1.z.union([zod_1.z.literal(16), zod_1.z.literal(24), zod_1.z.literal(32)]),
    codec: zod_1.z.enum(['mp3', 'wav', 'ogg', 'm4a']),
    duration: PositiveNumber,
    bitrate: PositiveNumber.optional(),
});
/**
 * RGB Color validation
 */
exports.RGBColorSchema = zod_1.z.object({
    r: BoundedNumber(0, 255),
    g: BoundedNumber(0, 255),
    b: BoundedNumber(0, 255),
});
/**
 * Point2D validation
 */
exports.Point2DSchema = zod_1.z.object({
    x: zod_1.z.number(),
    y: zod_1.z.number(),
});
/**
 * Beatmap General section
 */
exports.BeatmapGeneralSchema = zod_1.z.object({
    audioFilename: NonEmptyString.refine((filename) => /\.(mp3|wav|ogg|m4a)$/i.test(filename), { message: 'Audio filename must have valid audio extension' }),
    audioLeadIn: NonNegativeNumber.default(0),
    previewTime: zod_1.z.number().int().min(-1).default(-1), // -1 means no preview
    countdown: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]).default(1),
    sampleSet: zod_1.z.enum(['Normal', 'Soft', 'Drum']).default('Normal'),
    stackLeniency: BoundedNumber(0, 1).default(0.7),
    mode: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]).default(0),
    letterboxInBreaks: zod_1.z.boolean().default(false),
    widescreenStoryboard: zod_1.z.boolean().default(false),
}).strict();
/**
 * Beatmap Editor section
 */
exports.BeatmapEditorSchema = zod_1.z.object({
    bookmarks: zod_1.z.array(NonNegativeNumber).default([]),
    distanceSpacing: PositiveNumber.default(1.0),
    beatDivisor: zod_1.z.number().int().positive().default(4),
    gridSize: zod_1.z.number().int().positive().default(4),
    timelineZoom: PositiveNumber.default(1.0),
}).strict().optional();
/**
 * Beatmap Metadata section
 */
exports.BeatmapMetadataSchema = zod_1.z.object({
    title: NonEmptyString,
    titleUnicode: zod_1.z.string().default(''),
    artist: NonEmptyString,
    artistUnicode: zod_1.z.string().default(''),
    creator: NonEmptyString,
    version: NonEmptyString,
    source: zod_1.z.string().default(''),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    beatmapID: SafeInteger.default(0),
    beatmapSetID: SafeInteger.default(0),
}).strict();
/**
 * Beatmap Difficulty section
 */
exports.BeatmapDifficultySchema = zod_1.z.object({
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
exports.TimingPointSchema = zod_1.z.object({
    time: zod_1.z.number(),
    beatLength: zod_1.z.number().refine((val) => val !== 0, { message: 'Beat length cannot be zero' }),
    meter: zod_1.z.number().int().positive().default(4),
    sampleSet: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]).default(0),
    sampleIndex: NonNegativeNumber.default(0),
    volume: Percentage.default(100),
    uninherited: zod_1.z.boolean().default(true),
    effects: zod_1.z.object({
        kiaiTime: zod_1.z.boolean().default(false),
        omitFirstBarLine: zod_1.z.boolean().default(false),
    }).default(() => ({ kiaiTime: false, omitFirstBarLine: false })),
}).strict();
/**
 * Hit Sound validation
 */
exports.HitSoundSchema = zod_1.z.object({
    normal: zod_1.z.boolean().default(true),
    whistle: zod_1.z.boolean().default(false),
    finish: zod_1.z.boolean().default(false),
    clap: zod_1.z.boolean().default(false),
});
/**
 * Hit Object Type validation
 */
exports.HitObjectTypeSchema = zod_1.z.object({
    circle: zod_1.z.boolean().default(false),
    slider: zod_1.z.boolean().default(false),
    newCombo: zod_1.z.boolean().default(false),
    spinner: zod_1.z.boolean().default(false),
    colourSkip: BoundedNumber(0, 3).default(0),
    hold: zod_1.z.boolean().default(false), // mania only
});
/**
 * Hit Sample Additions validation
 */
exports.HitSampleAdditionsSchema = zod_1.z.object({
    sampleSet: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]).default(0),
    additionSet: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]).default(0),
    customIndex: NonNegativeNumber.default(0),
    volume: Percentage.default(100),
    filename: zod_1.z.string().optional(),
}).optional();
/**
 * Slider Data validation
 */
exports.SliderDataSchema = zod_1.z.object({
    curveType: zod_1.z.enum(['L', 'P', 'B', 'C']),
    curvePoints: zod_1.z.array(exports.Point2DSchema).min(1),
    slides: zod_1.z.number().int().positive(),
    length: PositiveNumber,
    edgeSounds: zod_1.z.array(exports.HitSoundSchema).default([]),
    edgeSets: zod_1.z.array(exports.HitSampleAdditionsSchema).default([]),
}).optional();
/**
 * Hit Object validation
 */
exports.HitObjectSchema = zod_1.z.object({
    x: BoundedNumber(0, 512),
    y: BoundedNumber(0, 384),
    time: NonNegativeNumber,
    type: exports.HitObjectTypeSchema,
    hitSound: exports.HitSoundSchema,
    endTime: NonNegativeNumber.optional(),
    additions: exports.HitSampleAdditionsSchema,
    sliderData: exports.SliderDataSchema,
}).strict().refine((obj) => {
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
}, {
    message: 'Invalid hit object configuration',
});
/**
 * Break Period validation
 */
exports.BreakPeriodSchema = zod_1.z.object({
    startTime: NonNegativeNumber,
    endTime: NonNegativeNumber,
}).refine((brk) => brk.endTime > brk.startTime, { message: 'Break end time must be after start time' });
/**
 * Beatmap Events section
 */
exports.BeatmapEventsSchema = zod_1.z.object({
    backgroundPath: zod_1.z.string().optional(),
    videoPath: zod_1.z.string().optional(),
    breaks: zod_1.z.array(exports.BreakPeriodSchema).default([]),
    storyboard: zod_1.z.object({
        sprites: zod_1.z.array(zod_1.z.unknown()).default([]),
        animations: zod_1.z.array(zod_1.z.unknown()).default([]),
    }).optional(),
}).default(() => ({ breaks: [] }));
/**
 * Beatmap Colours section
 */
exports.BeatmapColoursSchema = zod_1.z.object({
    combo: zod_1.z.array(exports.RGBColorSchema).min(1).default([
        { r: 255, g: 192, b: 0 },
        { r: 0, g: 202, b: 0 },
        { r: 18, g: 124, b: 255 },
        { r: 242, g: 24, b: 57 },
    ]),
    sliderTrackOverride: exports.RGBColorSchema.optional(),
    sliderBorder: exports.RGBColorSchema.optional(),
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
exports.BeatmapSchema = zod_1.z.object({
    general: exports.BeatmapGeneralSchema,
    editor: exports.BeatmapEditorSchema,
    metadata: exports.BeatmapMetadataSchema,
    difficulty: exports.BeatmapDifficultySchema,
    events: exports.BeatmapEventsSchema,
    timingPoints: zod_1.z.array(exports.TimingPointSchema).min(1).refine((points) => {
        // Must have at least one uninherited timing point
        return points.some(point => point.uninherited);
    }, { message: 'Beatmap must have at least one uninherited timing point' }),
    colours: exports.BeatmapColoursSchema,
    hitObjects: zod_1.z.array(exports.HitObjectSchema).refine((objects) => {
        // Hit objects must be sorted by time
        for (let i = 1; i < objects.length; i++) {
            const current = objects[i];
            const previous = objects[i - 1];
            if (current && previous && current.time < previous.time) {
                return false;
            }
        }
        return true;
    }, { message: 'Hit objects must be sorted by time' }),
}).strict();
/**
 * Difficulty Metadata validation
 */
exports.DifficultyMetadataSchema = zod_1.z.object({
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
exports.ChartMetadataSchema = zod_1.z.object({
    id: NonEmptyString,
    title: NonEmptyString,
    artist: NonEmptyString,
    creator: NonEmptyString,
    source: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    bpm: PositiveNumber,
    duration: PositiveNumber,
    gameMode: zod_1.z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
    difficulties: zod_1.z.array(exports.DifficultyMetadataSchema).min(1),
    backgroundImage: zod_1.z.string().optional(),
    previewTime: NonNegativeNumber.optional(),
    audioFilename: NonEmptyString,
    createdAt: zod_1.z.date().default(() => new Date()),
    updatedAt: zod_1.z.date().default(() => new Date()),
}).strict();
/**
 * OSZ File structure validation
 */
exports.OszFileEntrySchema = zod_1.z.object({
    name: NonEmptyString,
    path: NonEmptyString,
    size: NonNegativeNumber,
    isDirectory: zod_1.z.boolean(),
    data: zod_1.z.instanceof(Buffer).optional(),
});
exports.OszFileStructureSchema = zod_1.z.object({
    beatmapFiles: zod_1.z.array(exports.OszFileEntrySchema).min(1),
    audioFiles: zod_1.z.array(exports.OszFileEntrySchema).min(1),
    imageFiles: zod_1.z.array(exports.OszFileEntrySchema).default([]),
    videoFiles: zod_1.z.array(exports.OszFileEntrySchema).default([]),
    storyboardFiles: zod_1.z.array(exports.OszFileEntrySchema).default([]),
    hitsoundFiles: zod_1.z.array(exports.OszFileEntrySchema).default([]),
    skinFiles: zod_1.z.array(exports.OszFileEntrySchema).default([]),
    otherFiles: zod_1.z.array(exports.OszFileEntrySchema).default([]),
}).refine((structure) => {
    // Validate that we have at least one audio file that matches beatmap references
    const audioFilenames = structure.audioFiles.map(f => f.name.toLowerCase());
    // We'd need to parse beatmap files to get audio references
    // Basic validation - at least one audio file exists
    return audioFilenames.length > 0;
}, {
    message: 'OSZ must contain at least one valid audio file',
});
/**
 * OSZ Content validation (after parsing)
 */
exports.OszContentSchema = zod_1.z.object({
    metadata: exports.ChartMetadataSchema,
    difficulties: zod_1.z.map(zod_1.z.string(), exports.BeatmapSchema).refine((difficulties) => difficulties.size > 0, { message: 'OSZ must contain at least one valid difficulty' }),
    audioFile: zod_1.z.object({
        filename: NonEmptyString,
        data: zod_1.z.instanceof(Buffer),
        format: exports.AudioFormatSchema.optional(),
    }),
    backgroundImage: zod_1.z.object({
        filename: NonEmptyString,
        data: zod_1.z.instanceof(Buffer),
    }).optional(),
    hitsounds: zod_1.z.map(zod_1.z.string(), zod_1.z.instanceof(Buffer)).default(new Map()),
    videoFile: zod_1.z.object({
        filename: NonEmptyString,
        data: zod_1.z.instanceof(Buffer),
    }).optional(),
}).strict();
/**
 * OSZ Import Request validation
 */
exports.OszImportRequestSchema = zod_1.z.object({
    filePath: NonEmptyString.refine((path) => path.endsWith('.osz'), { message: 'File must have .osz extension' }),
    options: zod_1.z.object({
        validateIntegrity: zod_1.z.boolean().default(true),
        extractImages: zod_1.z.boolean().default(true),
        extractVideo: zod_1.z.boolean().default(false),
        extractHitsounds: zod_1.z.boolean().default(true),
        overwriteExisting: zod_1.z.boolean().default(false),
        generatePreviews: zod_1.z.boolean().default(true),
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
exports.OszProcessingResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    chartId: zod_1.z.string().optional(),
    metadata: exports.ChartMetadataSchema.optional(),
    errors: zod_1.z.array(zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        file: zod_1.z.string().optional(),
        line: zod_1.z.number().optional(),
    })).default([]),
    warnings: zod_1.z.array(zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        file: zod_1.z.string().optional(),
    })).default([]),
    importedFiles: zod_1.z.array(zod_1.z.string()).default([]),
    skippedFiles: zod_1.z.array(zod_1.z.string()).default([]),
    processingTime: PositiveNumber,
    memoryUsed: NonNegativeNumber,
}).strict();
/**
 * Raw OSZ data validation (before parsing)
 */
exports.RawOszDataSchema = zod_1.z.object({
    filePath: NonEmptyString,
    fileSize: PositiveNumber,
    zipEntries: zod_1.z.array(zod_1.z.object({
        entryName: NonEmptyString,
        size: NonNegativeNumber,
        compressedSize: NonNegativeNumber,
        crc: zod_1.z.number(),
        isDirectory: zod_1.z.boolean(),
    })),
    extractionPath: zod_1.z.string().optional(),
}).strict();
/**
 * Export all schemas for use throughout the application
 */
exports.OszSchemas = {
    // Core schemas
    Beatmap: exports.BeatmapSchema,
    ChartMetadata: exports.ChartMetadataSchema,
    OszContent: exports.OszContentSchema,
    // Processing schemas
    ImportRequest: exports.OszImportRequestSchema,
    ProcessingResult: exports.OszProcessingResultSchema,
    FileStructure: exports.OszFileStructureSchema,
    RawData: exports.RawOszDataSchema,
    // Component schemas
    General: exports.BeatmapGeneralSchema,
    Metadata: exports.BeatmapMetadataSchema,
    Difficulty: exports.BeatmapDifficultySchema,
    TimingPoint: exports.TimingPointSchema,
    HitObject: exports.HitObjectSchema,
    AudioFormat: exports.AudioFormatSchema,
};
