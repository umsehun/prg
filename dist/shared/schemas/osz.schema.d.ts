/**
 * Zod schemas for OSZ file processing and beatmap validation
 * Comprehensive validation for all osu! beatmap formats and edge cases
 */
import { z } from 'zod';
/**
 * Audio format validation
 */
export declare const AudioFormatSchema: z.ZodObject<{
    sampleRate: z.ZodNumber;
    channels: z.ZodNumber;
    bitDepth: z.ZodUnion<readonly [z.ZodLiteral<16>, z.ZodLiteral<24>, z.ZodLiteral<32>]>;
    codec: z.ZodEnum<{
        mp3: "mp3";
        wav: "wav";
        ogg: "ogg";
        m4a: "m4a";
    }>;
    duration: z.ZodNumber;
    bitrate: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * RGB Color validation
 */
export declare const RGBColorSchema: z.ZodObject<{
    r: z.ZodNumber;
    g: z.ZodNumber;
    b: z.ZodNumber;
}, z.core.$strip>;
/**
 * Point2D validation
 */
export declare const Point2DSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strip>;
/**
 * Beatmap General section
 */
export declare const BeatmapGeneralSchema: z.ZodObject<{
    audioFilename: z.ZodString;
    audioLeadIn: z.ZodDefault<z.ZodNumber>;
    previewTime: z.ZodDefault<z.ZodNumber>;
    countdown: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
    sampleSet: z.ZodDefault<z.ZodEnum<{
        Normal: "Normal";
        Soft: "Soft";
        Drum: "Drum";
    }>>;
    stackLeniency: z.ZodDefault<z.ZodNumber>;
    mode: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
    letterboxInBreaks: z.ZodDefault<z.ZodBoolean>;
    widescreenStoryboard: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Beatmap Editor section
 */
export declare const BeatmapEditorSchema: z.ZodOptional<z.ZodObject<{
    bookmarks: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    distanceSpacing: z.ZodDefault<z.ZodNumber>;
    beatDivisor: z.ZodDefault<z.ZodNumber>;
    gridSize: z.ZodDefault<z.ZodNumber>;
    timelineZoom: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>>;
/**
 * Beatmap Metadata section
 */
export declare const BeatmapMetadataSchema: z.ZodObject<{
    title: z.ZodString;
    titleUnicode: z.ZodDefault<z.ZodString>;
    artist: z.ZodString;
    artistUnicode: z.ZodDefault<z.ZodString>;
    creator: z.ZodString;
    version: z.ZodString;
    source: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    beatmapID: z.ZodDefault<z.ZodNumber>;
    beatmapSetID: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
/**
 * Beatmap Difficulty section
 */
export declare const BeatmapDifficultySchema: z.ZodObject<{
    hpDrainRate: z.ZodDefault<z.ZodNumber>;
    circleSize: z.ZodDefault<z.ZodNumber>;
    overallDifficulty: z.ZodDefault<z.ZodNumber>;
    approachRate: z.ZodDefault<z.ZodNumber>;
    sliderMultiplier: z.ZodDefault<z.ZodNumber>;
    sliderTickRate: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
/**
 * Timing Point validation
 */
export declare const TimingPointSchema: z.ZodObject<{
    time: z.ZodNumber;
    beatLength: z.ZodNumber;
    meter: z.ZodDefault<z.ZodNumber>;
    sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
    sampleIndex: z.ZodDefault<z.ZodNumber>;
    volume: z.ZodDefault<z.ZodNumber>;
    uninherited: z.ZodDefault<z.ZodBoolean>;
    effects: z.ZodDefault<z.ZodObject<{
        kiaiTime: z.ZodDefault<z.ZodBoolean>;
        omitFirstBarLine: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strict>;
/**
 * Hit Sound validation
 */
export declare const HitSoundSchema: z.ZodObject<{
    normal: z.ZodDefault<z.ZodBoolean>;
    whistle: z.ZodDefault<z.ZodBoolean>;
    finish: z.ZodDefault<z.ZodBoolean>;
    clap: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Hit Object Type validation
 */
export declare const HitObjectTypeSchema: z.ZodObject<{
    circle: z.ZodDefault<z.ZodBoolean>;
    slider: z.ZodDefault<z.ZodBoolean>;
    newCombo: z.ZodDefault<z.ZodBoolean>;
    spinner: z.ZodDefault<z.ZodBoolean>;
    colourSkip: z.ZodDefault<z.ZodNumber>;
    hold: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Hit Sample Additions validation
 */
export declare const HitSampleAdditionsSchema: z.ZodOptional<z.ZodObject<{
    sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
    additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
    customIndex: z.ZodDefault<z.ZodNumber>;
    volume: z.ZodDefault<z.ZodNumber>;
    filename: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>;
/**
 * Slider Data validation
 */
export declare const SliderDataSchema: z.ZodOptional<z.ZodObject<{
    curveType: z.ZodEnum<{
        B: "B";
        L: "L";
        P: "P";
        C: "C";
    }>;
    curvePoints: z.ZodArray<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strip>>;
    slides: z.ZodNumber;
    length: z.ZodNumber;
    edgeSounds: z.ZodDefault<z.ZodArray<z.ZodObject<{
        normal: z.ZodDefault<z.ZodBoolean>;
        whistle: z.ZodDefault<z.ZodBoolean>;
        finish: z.ZodDefault<z.ZodBoolean>;
        clap: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>>;
    edgeSets: z.ZodDefault<z.ZodArray<z.ZodOptional<z.ZodObject<{
        sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        customIndex: z.ZodDefault<z.ZodNumber>;
        volume: z.ZodDefault<z.ZodNumber>;
        filename: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>;
}, z.core.$strip>>;
/**
 * Hit Object validation
 */
export declare const HitObjectSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    time: z.ZodNumber;
    type: z.ZodObject<{
        circle: z.ZodDefault<z.ZodBoolean>;
        slider: z.ZodDefault<z.ZodBoolean>;
        newCombo: z.ZodDefault<z.ZodBoolean>;
        spinner: z.ZodDefault<z.ZodBoolean>;
        colourSkip: z.ZodDefault<z.ZodNumber>;
        hold: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    hitSound: z.ZodObject<{
        normal: z.ZodDefault<z.ZodBoolean>;
        whistle: z.ZodDefault<z.ZodBoolean>;
        finish: z.ZodDefault<z.ZodBoolean>;
        clap: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    endTime: z.ZodOptional<z.ZodNumber>;
    additions: z.ZodOptional<z.ZodObject<{
        sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        customIndex: z.ZodDefault<z.ZodNumber>;
        volume: z.ZodDefault<z.ZodNumber>;
        filename: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    sliderData: z.ZodOptional<z.ZodObject<{
        curveType: z.ZodEnum<{
            B: "B";
            L: "L";
            P: "P";
            C: "C";
        }>;
        curvePoints: z.ZodArray<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strip>>;
        slides: z.ZodNumber;
        length: z.ZodNumber;
        edgeSounds: z.ZodDefault<z.ZodArray<z.ZodObject<{
            normal: z.ZodDefault<z.ZodBoolean>;
            whistle: z.ZodDefault<z.ZodBoolean>;
            finish: z.ZodDefault<z.ZodBoolean>;
            clap: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>>;
        edgeSets: z.ZodDefault<z.ZodArray<z.ZodOptional<z.ZodObject<{
            sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            customIndex: z.ZodDefault<z.ZodNumber>;
            volume: z.ZodDefault<z.ZodNumber>;
            filename: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>>;
}, z.core.$strict>;
/**
 * Break Period validation
 */
export declare const BreakPeriodSchema: z.ZodObject<{
    startTime: z.ZodNumber;
    endTime: z.ZodNumber;
}, z.core.$strip>;
/**
 * Beatmap Events section
 */
export declare const BeatmapEventsSchema: z.ZodDefault<z.ZodObject<{
    backgroundPath: z.ZodOptional<z.ZodString>;
    videoPath: z.ZodOptional<z.ZodString>;
    breaks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        startTime: z.ZodNumber;
        endTime: z.ZodNumber;
    }, z.core.$strip>>>;
    storyboard: z.ZodOptional<z.ZodObject<{
        sprites: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
        animations: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
    }, z.core.$strip>>;
}, z.core.$strip>>;
/**
 * Beatmap Colours section
 */
export declare const BeatmapColoursSchema: z.ZodDefault<z.ZodObject<{
    combo: z.ZodDefault<z.ZodArray<z.ZodObject<{
        r: z.ZodNumber;
        g: z.ZodNumber;
        b: z.ZodNumber;
    }, z.core.$strip>>>;
    sliderTrackOverride: z.ZodOptional<z.ZodObject<{
        r: z.ZodNumber;
        g: z.ZodNumber;
        b: z.ZodNumber;
    }, z.core.$strip>>;
    sliderBorder: z.ZodOptional<z.ZodObject<{
        r: z.ZodNumber;
        g: z.ZodNumber;
        b: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>>;
/**
 * Complete Beatmap validation
 */
export declare const BeatmapSchema: z.ZodObject<{
    general: z.ZodObject<{
        audioFilename: z.ZodString;
        audioLeadIn: z.ZodDefault<z.ZodNumber>;
        previewTime: z.ZodDefault<z.ZodNumber>;
        countdown: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        sampleSet: z.ZodDefault<z.ZodEnum<{
            Normal: "Normal";
            Soft: "Soft";
            Drum: "Drum";
        }>>;
        stackLeniency: z.ZodDefault<z.ZodNumber>;
        mode: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        letterboxInBreaks: z.ZodDefault<z.ZodBoolean>;
        widescreenStoryboard: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    editor: z.ZodOptional<z.ZodObject<{
        bookmarks: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
        distanceSpacing: z.ZodDefault<z.ZodNumber>;
        beatDivisor: z.ZodDefault<z.ZodNumber>;
        gridSize: z.ZodDefault<z.ZodNumber>;
        timelineZoom: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>>;
    metadata: z.ZodObject<{
        title: z.ZodString;
        titleUnicode: z.ZodDefault<z.ZodString>;
        artist: z.ZodString;
        artistUnicode: z.ZodDefault<z.ZodString>;
        creator: z.ZodString;
        version: z.ZodString;
        source: z.ZodDefault<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        beatmapID: z.ZodDefault<z.ZodNumber>;
        beatmapSetID: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    difficulty: z.ZodObject<{
        hpDrainRate: z.ZodDefault<z.ZodNumber>;
        circleSize: z.ZodDefault<z.ZodNumber>;
        overallDifficulty: z.ZodDefault<z.ZodNumber>;
        approachRate: z.ZodDefault<z.ZodNumber>;
        sliderMultiplier: z.ZodDefault<z.ZodNumber>;
        sliderTickRate: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    events: z.ZodDefault<z.ZodObject<{
        backgroundPath: z.ZodOptional<z.ZodString>;
        videoPath: z.ZodOptional<z.ZodString>;
        breaks: z.ZodDefault<z.ZodArray<z.ZodObject<{
            startTime: z.ZodNumber;
            endTime: z.ZodNumber;
        }, z.core.$strip>>>;
        storyboard: z.ZodOptional<z.ZodObject<{
            sprites: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
            animations: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    timingPoints: z.ZodArray<z.ZodObject<{
        time: z.ZodNumber;
        beatLength: z.ZodNumber;
        meter: z.ZodDefault<z.ZodNumber>;
        sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        sampleIndex: z.ZodDefault<z.ZodNumber>;
        volume: z.ZodDefault<z.ZodNumber>;
        uninherited: z.ZodDefault<z.ZodBoolean>;
        effects: z.ZodDefault<z.ZodObject<{
            kiaiTime: z.ZodDefault<z.ZodBoolean>;
            omitFirstBarLine: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strict>>;
    colours: z.ZodDefault<z.ZodObject<{
        combo: z.ZodDefault<z.ZodArray<z.ZodObject<{
            r: z.ZodNumber;
            g: z.ZodNumber;
            b: z.ZodNumber;
        }, z.core.$strip>>>;
        sliderTrackOverride: z.ZodOptional<z.ZodObject<{
            r: z.ZodNumber;
            g: z.ZodNumber;
            b: z.ZodNumber;
        }, z.core.$strip>>;
        sliderBorder: z.ZodOptional<z.ZodObject<{
            r: z.ZodNumber;
            g: z.ZodNumber;
            b: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    hitObjects: z.ZodArray<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        time: z.ZodNumber;
        type: z.ZodObject<{
            circle: z.ZodDefault<z.ZodBoolean>;
            slider: z.ZodDefault<z.ZodBoolean>;
            newCombo: z.ZodDefault<z.ZodBoolean>;
            spinner: z.ZodDefault<z.ZodBoolean>;
            colourSkip: z.ZodDefault<z.ZodNumber>;
            hold: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
        hitSound: z.ZodObject<{
            normal: z.ZodDefault<z.ZodBoolean>;
            whistle: z.ZodDefault<z.ZodBoolean>;
            finish: z.ZodDefault<z.ZodBoolean>;
            clap: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
        endTime: z.ZodOptional<z.ZodNumber>;
        additions: z.ZodOptional<z.ZodObject<{
            sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            customIndex: z.ZodDefault<z.ZodNumber>;
            volume: z.ZodDefault<z.ZodNumber>;
            filename: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        sliderData: z.ZodOptional<z.ZodObject<{
            curveType: z.ZodEnum<{
                B: "B";
                L: "L";
                P: "P";
                C: "C";
            }>;
            curvePoints: z.ZodArray<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>>;
            slides: z.ZodNumber;
            length: z.ZodNumber;
            edgeSounds: z.ZodDefault<z.ZodArray<z.ZodObject<{
                normal: z.ZodDefault<z.ZodBoolean>;
                whistle: z.ZodDefault<z.ZodBoolean>;
                finish: z.ZodDefault<z.ZodBoolean>;
                clap: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>>>;
            edgeSets: z.ZodDefault<z.ZodArray<z.ZodOptional<z.ZodObject<{
                sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                customIndex: z.ZodDefault<z.ZodNumber>;
                volume: z.ZodDefault<z.ZodNumber>;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>>;
        }, z.core.$strip>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/**
 * Difficulty Metadata validation
 */
export declare const DifficultyMetadataSchema: z.ZodObject<{
    version: z.ZodString;
    starRating: z.ZodDefault<z.ZodNumber>;
    overallDifficulty: z.ZodNumber;
    approachRate: z.ZodNumber;
    circleSize: z.ZodNumber;
    hpDrainRate: z.ZodNumber;
    maxCombo: z.ZodDefault<z.ZodNumber>;
    objectCount: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
/**
 * Chart Metadata validation
 */
export declare const ChartMetadataSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    artist: z.ZodString;
    creator: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    bpm: z.ZodNumber;
    duration: z.ZodNumber;
    gameMode: z.ZodDefault<z.ZodEnum<{
        osu: "osu";
        taiko: "taiko";
        fruits: "fruits";
        mania: "mania";
    }>>;
    difficulties: z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        starRating: z.ZodDefault<z.ZodNumber>;
        overallDifficulty: z.ZodNumber;
        approachRate: z.ZodNumber;
        circleSize: z.ZodNumber;
        hpDrainRate: z.ZodNumber;
        maxCombo: z.ZodDefault<z.ZodNumber>;
        objectCount: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>>;
    backgroundImage: z.ZodOptional<z.ZodString>;
    previewTime: z.ZodOptional<z.ZodNumber>;
    audioFilename: z.ZodString;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, z.core.$strict>;
/**
 * OSZ File structure validation
 */
export declare const OszFileEntrySchema: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    size: z.ZodNumber;
    isDirectory: z.ZodBoolean;
    data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
}, z.core.$strip>;
export declare const OszFileStructureSchema: z.ZodObject<{
    beatmapFiles: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
        isDirectory: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    }, z.core.$strip>>;
    audioFiles: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
        isDirectory: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    }, z.core.$strip>>;
    imageFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
        isDirectory: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    }, z.core.$strip>>>;
    videoFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
        isDirectory: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    }, z.core.$strip>>>;
    storyboardFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
        isDirectory: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    }, z.core.$strip>>>;
    hitsoundFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
        isDirectory: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    }, z.core.$strip>>>;
    skinFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
        isDirectory: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    }, z.core.$strip>>>;
    otherFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
        isDirectory: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * OSZ Content validation (after parsing)
 */
export declare const OszContentSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        artist: z.ZodString;
        creator: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        bpm: z.ZodNumber;
        duration: z.ZodNumber;
        gameMode: z.ZodDefault<z.ZodEnum<{
            osu: "osu";
            taiko: "taiko";
            fruits: "fruits";
            mania: "mania";
        }>>;
        difficulties: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            starRating: z.ZodDefault<z.ZodNumber>;
            overallDifficulty: z.ZodNumber;
            approachRate: z.ZodNumber;
            circleSize: z.ZodNumber;
            hpDrainRate: z.ZodNumber;
            maxCombo: z.ZodDefault<z.ZodNumber>;
            objectCount: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>>;
        backgroundImage: z.ZodOptional<z.ZodString>;
        previewTime: z.ZodOptional<z.ZodNumber>;
        audioFilename: z.ZodString;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, z.core.$strict>;
    difficulties: z.ZodMap<z.ZodString, z.ZodObject<{
        general: z.ZodObject<{
            audioFilename: z.ZodString;
            audioLeadIn: z.ZodDefault<z.ZodNumber>;
            previewTime: z.ZodDefault<z.ZodNumber>;
            countdown: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            sampleSet: z.ZodDefault<z.ZodEnum<{
                Normal: "Normal";
                Soft: "Soft";
                Drum: "Drum";
            }>>;
            stackLeniency: z.ZodDefault<z.ZodNumber>;
            mode: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            letterboxInBreaks: z.ZodDefault<z.ZodBoolean>;
            widescreenStoryboard: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        editor: z.ZodOptional<z.ZodObject<{
            bookmarks: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
            distanceSpacing: z.ZodDefault<z.ZodNumber>;
            beatDivisor: z.ZodDefault<z.ZodNumber>;
            gridSize: z.ZodDefault<z.ZodNumber>;
            timelineZoom: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>>;
        metadata: z.ZodObject<{
            title: z.ZodString;
            titleUnicode: z.ZodDefault<z.ZodString>;
            artist: z.ZodString;
            artistUnicode: z.ZodDefault<z.ZodString>;
            creator: z.ZodString;
            version: z.ZodString;
            source: z.ZodDefault<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            beatmapID: z.ZodDefault<z.ZodNumber>;
            beatmapSetID: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>;
        difficulty: z.ZodObject<{
            hpDrainRate: z.ZodDefault<z.ZodNumber>;
            circleSize: z.ZodDefault<z.ZodNumber>;
            overallDifficulty: z.ZodDefault<z.ZodNumber>;
            approachRate: z.ZodDefault<z.ZodNumber>;
            sliderMultiplier: z.ZodDefault<z.ZodNumber>;
            sliderTickRate: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>;
        events: z.ZodDefault<z.ZodObject<{
            backgroundPath: z.ZodOptional<z.ZodString>;
            videoPath: z.ZodOptional<z.ZodString>;
            breaks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                startTime: z.ZodNumber;
                endTime: z.ZodNumber;
            }, z.core.$strip>>>;
            storyboard: z.ZodOptional<z.ZodObject<{
                sprites: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
                animations: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        timingPoints: z.ZodArray<z.ZodObject<{
            time: z.ZodNumber;
            beatLength: z.ZodNumber;
            meter: z.ZodDefault<z.ZodNumber>;
            sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            sampleIndex: z.ZodDefault<z.ZodNumber>;
            volume: z.ZodDefault<z.ZodNumber>;
            uninherited: z.ZodDefault<z.ZodBoolean>;
            effects: z.ZodDefault<z.ZodObject<{
                kiaiTime: z.ZodDefault<z.ZodBoolean>;
                omitFirstBarLine: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>>;
        }, z.core.$strict>>;
        colours: z.ZodDefault<z.ZodObject<{
            combo: z.ZodDefault<z.ZodArray<z.ZodObject<{
                r: z.ZodNumber;
                g: z.ZodNumber;
                b: z.ZodNumber;
            }, z.core.$strip>>>;
            sliderTrackOverride: z.ZodOptional<z.ZodObject<{
                r: z.ZodNumber;
                g: z.ZodNumber;
                b: z.ZodNumber;
            }, z.core.$strip>>;
            sliderBorder: z.ZodOptional<z.ZodObject<{
                r: z.ZodNumber;
                g: z.ZodNumber;
                b: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        hitObjects: z.ZodArray<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            time: z.ZodNumber;
            type: z.ZodObject<{
                circle: z.ZodDefault<z.ZodBoolean>;
                slider: z.ZodDefault<z.ZodBoolean>;
                newCombo: z.ZodDefault<z.ZodBoolean>;
                spinner: z.ZodDefault<z.ZodBoolean>;
                colourSkip: z.ZodDefault<z.ZodNumber>;
                hold: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>;
            hitSound: z.ZodObject<{
                normal: z.ZodDefault<z.ZodBoolean>;
                whistle: z.ZodDefault<z.ZodBoolean>;
                finish: z.ZodDefault<z.ZodBoolean>;
                clap: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>;
            endTime: z.ZodOptional<z.ZodNumber>;
            additions: z.ZodOptional<z.ZodObject<{
                sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                customIndex: z.ZodDefault<z.ZodNumber>;
                volume: z.ZodDefault<z.ZodNumber>;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            sliderData: z.ZodOptional<z.ZodObject<{
                curveType: z.ZodEnum<{
                    B: "B";
                    L: "L";
                    P: "P";
                    C: "C";
                }>;
                curvePoints: z.ZodArray<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strip>>;
                slides: z.ZodNumber;
                length: z.ZodNumber;
                edgeSounds: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    normal: z.ZodDefault<z.ZodBoolean>;
                    whistle: z.ZodDefault<z.ZodBoolean>;
                    finish: z.ZodDefault<z.ZodBoolean>;
                    clap: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strip>>>;
                edgeSets: z.ZodDefault<z.ZodArray<z.ZodOptional<z.ZodObject<{
                    sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                    additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                    customIndex: z.ZodDefault<z.ZodNumber>;
                    volume: z.ZodDefault<z.ZodNumber>;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>>>;
            }, z.core.$strip>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    audioFile: z.ZodObject<{
        filename: z.ZodString;
        data: z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
        format: z.ZodOptional<z.ZodObject<{
            sampleRate: z.ZodNumber;
            channels: z.ZodNumber;
            bitDepth: z.ZodUnion<readonly [z.ZodLiteral<16>, z.ZodLiteral<24>, z.ZodLiteral<32>]>;
            codec: z.ZodEnum<{
                mp3: "mp3";
                wav: "wav";
                ogg: "ogg";
                m4a: "m4a";
            }>;
            duration: z.ZodNumber;
            bitrate: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    backgroundImage: z.ZodOptional<z.ZodObject<{
        filename: z.ZodString;
        data: z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
    }, z.core.$strip>>;
    hitsounds: z.ZodDefault<z.ZodMap<z.ZodString, z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>>;
    videoFile: z.ZodOptional<z.ZodObject<{
        filename: z.ZodString;
        data: z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
    }, z.core.$strip>>;
}, z.core.$strict>;
/**
 * OSZ Import Request validation
 */
export declare const OszImportRequestSchema: z.ZodObject<{
    filePath: z.ZodString;
    options: z.ZodDefault<z.ZodObject<{
        validateIntegrity: z.ZodDefault<z.ZodBoolean>;
        extractImages: z.ZodDefault<z.ZodBoolean>;
        extractVideo: z.ZodDefault<z.ZodBoolean>;
        extractHitsounds: z.ZodDefault<z.ZodBoolean>;
        overwriteExisting: z.ZodDefault<z.ZodBoolean>;
        generatePreviews: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strict>;
/**
 * OSZ Processing Result validation
 */
export declare const OszProcessingResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    chartId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        artist: z.ZodString;
        creator: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        bpm: z.ZodNumber;
        duration: z.ZodNumber;
        gameMode: z.ZodDefault<z.ZodEnum<{
            osu: "osu";
            taiko: "taiko";
            fruits: "fruits";
            mania: "mania";
        }>>;
        difficulties: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            starRating: z.ZodDefault<z.ZodNumber>;
            overallDifficulty: z.ZodNumber;
            approachRate: z.ZodNumber;
            circleSize: z.ZodNumber;
            hpDrainRate: z.ZodNumber;
            maxCombo: z.ZodDefault<z.ZodNumber>;
            objectCount: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>>;
        backgroundImage: z.ZodOptional<z.ZodString>;
        previewTime: z.ZodOptional<z.ZodNumber>;
        audioFilename: z.ZodString;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, z.core.$strict>>;
    errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        file: z.ZodOptional<z.ZodString>;
        line: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        file: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    importedFiles: z.ZodDefault<z.ZodArray<z.ZodString>>;
    skippedFiles: z.ZodDefault<z.ZodArray<z.ZodString>>;
    processingTime: z.ZodNumber;
    memoryUsed: z.ZodNumber;
}, z.core.$strict>;
/**
 * Raw OSZ data validation (before parsing)
 */
export declare const RawOszDataSchema: z.ZodObject<{
    filePath: z.ZodString;
    fileSize: z.ZodNumber;
    zipEntries: z.ZodArray<z.ZodObject<{
        entryName: z.ZodString;
        size: z.ZodNumber;
        compressedSize: z.ZodNumber;
        crc: z.ZodNumber;
        isDirectory: z.ZodBoolean;
    }, z.core.$strip>>;
    extractionPath: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/**
 * Export all schemas for use throughout the application
 */
export declare const OszSchemas: {
    readonly Beatmap: z.ZodObject<{
        general: z.ZodObject<{
            audioFilename: z.ZodString;
            audioLeadIn: z.ZodDefault<z.ZodNumber>;
            previewTime: z.ZodDefault<z.ZodNumber>;
            countdown: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            sampleSet: z.ZodDefault<z.ZodEnum<{
                Normal: "Normal";
                Soft: "Soft";
                Drum: "Drum";
            }>>;
            stackLeniency: z.ZodDefault<z.ZodNumber>;
            mode: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            letterboxInBreaks: z.ZodDefault<z.ZodBoolean>;
            widescreenStoryboard: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        editor: z.ZodOptional<z.ZodObject<{
            bookmarks: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
            distanceSpacing: z.ZodDefault<z.ZodNumber>;
            beatDivisor: z.ZodDefault<z.ZodNumber>;
            gridSize: z.ZodDefault<z.ZodNumber>;
            timelineZoom: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>>;
        metadata: z.ZodObject<{
            title: z.ZodString;
            titleUnicode: z.ZodDefault<z.ZodString>;
            artist: z.ZodString;
            artistUnicode: z.ZodDefault<z.ZodString>;
            creator: z.ZodString;
            version: z.ZodString;
            source: z.ZodDefault<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            beatmapID: z.ZodDefault<z.ZodNumber>;
            beatmapSetID: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>;
        difficulty: z.ZodObject<{
            hpDrainRate: z.ZodDefault<z.ZodNumber>;
            circleSize: z.ZodDefault<z.ZodNumber>;
            overallDifficulty: z.ZodDefault<z.ZodNumber>;
            approachRate: z.ZodDefault<z.ZodNumber>;
            sliderMultiplier: z.ZodDefault<z.ZodNumber>;
            sliderTickRate: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>;
        events: z.ZodDefault<z.ZodObject<{
            backgroundPath: z.ZodOptional<z.ZodString>;
            videoPath: z.ZodOptional<z.ZodString>;
            breaks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                startTime: z.ZodNumber;
                endTime: z.ZodNumber;
            }, z.core.$strip>>>;
            storyboard: z.ZodOptional<z.ZodObject<{
                sprites: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
                animations: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        timingPoints: z.ZodArray<z.ZodObject<{
            time: z.ZodNumber;
            beatLength: z.ZodNumber;
            meter: z.ZodDefault<z.ZodNumber>;
            sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            sampleIndex: z.ZodDefault<z.ZodNumber>;
            volume: z.ZodDefault<z.ZodNumber>;
            uninherited: z.ZodDefault<z.ZodBoolean>;
            effects: z.ZodDefault<z.ZodObject<{
                kiaiTime: z.ZodDefault<z.ZodBoolean>;
                omitFirstBarLine: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>>;
        }, z.core.$strict>>;
        colours: z.ZodDefault<z.ZodObject<{
            combo: z.ZodDefault<z.ZodArray<z.ZodObject<{
                r: z.ZodNumber;
                g: z.ZodNumber;
                b: z.ZodNumber;
            }, z.core.$strip>>>;
            sliderTrackOverride: z.ZodOptional<z.ZodObject<{
                r: z.ZodNumber;
                g: z.ZodNumber;
                b: z.ZodNumber;
            }, z.core.$strip>>;
            sliderBorder: z.ZodOptional<z.ZodObject<{
                r: z.ZodNumber;
                g: z.ZodNumber;
                b: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        hitObjects: z.ZodArray<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            time: z.ZodNumber;
            type: z.ZodObject<{
                circle: z.ZodDefault<z.ZodBoolean>;
                slider: z.ZodDefault<z.ZodBoolean>;
                newCombo: z.ZodDefault<z.ZodBoolean>;
                spinner: z.ZodDefault<z.ZodBoolean>;
                colourSkip: z.ZodDefault<z.ZodNumber>;
                hold: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>;
            hitSound: z.ZodObject<{
                normal: z.ZodDefault<z.ZodBoolean>;
                whistle: z.ZodDefault<z.ZodBoolean>;
                finish: z.ZodDefault<z.ZodBoolean>;
                clap: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>;
            endTime: z.ZodOptional<z.ZodNumber>;
            additions: z.ZodOptional<z.ZodObject<{
                sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                customIndex: z.ZodDefault<z.ZodNumber>;
                volume: z.ZodDefault<z.ZodNumber>;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            sliderData: z.ZodOptional<z.ZodObject<{
                curveType: z.ZodEnum<{
                    B: "B";
                    L: "L";
                    P: "P";
                    C: "C";
                }>;
                curvePoints: z.ZodArray<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strip>>;
                slides: z.ZodNumber;
                length: z.ZodNumber;
                edgeSounds: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    normal: z.ZodDefault<z.ZodBoolean>;
                    whistle: z.ZodDefault<z.ZodBoolean>;
                    finish: z.ZodDefault<z.ZodBoolean>;
                    clap: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strip>>>;
                edgeSets: z.ZodDefault<z.ZodArray<z.ZodOptional<z.ZodObject<{
                    sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                    additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                    customIndex: z.ZodDefault<z.ZodNumber>;
                    volume: z.ZodDefault<z.ZodNumber>;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>>>;
            }, z.core.$strip>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly ChartMetadata: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        artist: z.ZodString;
        creator: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        bpm: z.ZodNumber;
        duration: z.ZodNumber;
        gameMode: z.ZodDefault<z.ZodEnum<{
            osu: "osu";
            taiko: "taiko";
            fruits: "fruits";
            mania: "mania";
        }>>;
        difficulties: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            starRating: z.ZodDefault<z.ZodNumber>;
            overallDifficulty: z.ZodNumber;
            approachRate: z.ZodNumber;
            circleSize: z.ZodNumber;
            hpDrainRate: z.ZodNumber;
            maxCombo: z.ZodDefault<z.ZodNumber>;
            objectCount: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>>;
        backgroundImage: z.ZodOptional<z.ZodString>;
        previewTime: z.ZodOptional<z.ZodNumber>;
        audioFilename: z.ZodString;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, z.core.$strict>;
    readonly OszContent: z.ZodObject<{
        metadata: z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            artist: z.ZodString;
            creator: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            bpm: z.ZodNumber;
            duration: z.ZodNumber;
            gameMode: z.ZodDefault<z.ZodEnum<{
                osu: "osu";
                taiko: "taiko";
                fruits: "fruits";
                mania: "mania";
            }>>;
            difficulties: z.ZodArray<z.ZodObject<{
                version: z.ZodString;
                starRating: z.ZodDefault<z.ZodNumber>;
                overallDifficulty: z.ZodNumber;
                approachRate: z.ZodNumber;
                circleSize: z.ZodNumber;
                hpDrainRate: z.ZodNumber;
                maxCombo: z.ZodDefault<z.ZodNumber>;
                objectCount: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            backgroundImage: z.ZodOptional<z.ZodString>;
            previewTime: z.ZodOptional<z.ZodNumber>;
            audioFilename: z.ZodString;
            createdAt: z.ZodDefault<z.ZodDate>;
            updatedAt: z.ZodDefault<z.ZodDate>;
        }, z.core.$strict>;
        difficulties: z.ZodMap<z.ZodString, z.ZodObject<{
            general: z.ZodObject<{
                audioFilename: z.ZodString;
                audioLeadIn: z.ZodDefault<z.ZodNumber>;
                previewTime: z.ZodDefault<z.ZodNumber>;
                countdown: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                sampleSet: z.ZodDefault<z.ZodEnum<{
                    Normal: "Normal";
                    Soft: "Soft";
                    Drum: "Drum";
                }>>;
                stackLeniency: z.ZodDefault<z.ZodNumber>;
                mode: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                letterboxInBreaks: z.ZodDefault<z.ZodBoolean>;
                widescreenStoryboard: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>;
            editor: z.ZodOptional<z.ZodObject<{
                bookmarks: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
                distanceSpacing: z.ZodDefault<z.ZodNumber>;
                beatDivisor: z.ZodDefault<z.ZodNumber>;
                gridSize: z.ZodDefault<z.ZodNumber>;
                timelineZoom: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            metadata: z.ZodObject<{
                title: z.ZodString;
                titleUnicode: z.ZodDefault<z.ZodString>;
                artist: z.ZodString;
                artistUnicode: z.ZodDefault<z.ZodString>;
                creator: z.ZodString;
                version: z.ZodString;
                source: z.ZodDefault<z.ZodString>;
                tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
                beatmapID: z.ZodDefault<z.ZodNumber>;
                beatmapSetID: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>;
            difficulty: z.ZodObject<{
                hpDrainRate: z.ZodDefault<z.ZodNumber>;
                circleSize: z.ZodDefault<z.ZodNumber>;
                overallDifficulty: z.ZodDefault<z.ZodNumber>;
                approachRate: z.ZodDefault<z.ZodNumber>;
                sliderMultiplier: z.ZodDefault<z.ZodNumber>;
                sliderTickRate: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>;
            events: z.ZodDefault<z.ZodObject<{
                backgroundPath: z.ZodOptional<z.ZodString>;
                videoPath: z.ZodOptional<z.ZodString>;
                breaks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    startTime: z.ZodNumber;
                    endTime: z.ZodNumber;
                }, z.core.$strip>>>;
                storyboard: z.ZodOptional<z.ZodObject<{
                    sprites: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
                    animations: z.ZodDefault<z.ZodArray<z.ZodUnknown>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            timingPoints: z.ZodArray<z.ZodObject<{
                time: z.ZodNumber;
                beatLength: z.ZodNumber;
                meter: z.ZodDefault<z.ZodNumber>;
                sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                sampleIndex: z.ZodDefault<z.ZodNumber>;
                volume: z.ZodDefault<z.ZodNumber>;
                uninherited: z.ZodDefault<z.ZodBoolean>;
                effects: z.ZodDefault<z.ZodObject<{
                    kiaiTime: z.ZodDefault<z.ZodBoolean>;
                    omitFirstBarLine: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strip>>;
            }, z.core.$strict>>;
            colours: z.ZodDefault<z.ZodObject<{
                combo: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    r: z.ZodNumber;
                    g: z.ZodNumber;
                    b: z.ZodNumber;
                }, z.core.$strip>>>;
                sliderTrackOverride: z.ZodOptional<z.ZodObject<{
                    r: z.ZodNumber;
                    g: z.ZodNumber;
                    b: z.ZodNumber;
                }, z.core.$strip>>;
                sliderBorder: z.ZodOptional<z.ZodObject<{
                    r: z.ZodNumber;
                    g: z.ZodNumber;
                    b: z.ZodNumber;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            hitObjects: z.ZodArray<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                time: z.ZodNumber;
                type: z.ZodObject<{
                    circle: z.ZodDefault<z.ZodBoolean>;
                    slider: z.ZodDefault<z.ZodBoolean>;
                    newCombo: z.ZodDefault<z.ZodBoolean>;
                    spinner: z.ZodDefault<z.ZodBoolean>;
                    colourSkip: z.ZodDefault<z.ZodNumber>;
                    hold: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strip>;
                hitSound: z.ZodObject<{
                    normal: z.ZodDefault<z.ZodBoolean>;
                    whistle: z.ZodDefault<z.ZodBoolean>;
                    finish: z.ZodDefault<z.ZodBoolean>;
                    clap: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strip>;
                endTime: z.ZodOptional<z.ZodNumber>;
                additions: z.ZodOptional<z.ZodObject<{
                    sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                    additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                    customIndex: z.ZodDefault<z.ZodNumber>;
                    volume: z.ZodDefault<z.ZodNumber>;
                    filename: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                sliderData: z.ZodOptional<z.ZodObject<{
                    curveType: z.ZodEnum<{
                        B: "B";
                        L: "L";
                        P: "P";
                        C: "C";
                    }>;
                    curvePoints: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strip>>;
                    slides: z.ZodNumber;
                    length: z.ZodNumber;
                    edgeSounds: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        normal: z.ZodDefault<z.ZodBoolean>;
                        whistle: z.ZodDefault<z.ZodBoolean>;
                        finish: z.ZodDefault<z.ZodBoolean>;
                        clap: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strip>>>;
                    edgeSets: z.ZodDefault<z.ZodArray<z.ZodOptional<z.ZodObject<{
                        sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                        additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                        customIndex: z.ZodDefault<z.ZodNumber>;
                        volume: z.ZodDefault<z.ZodNumber>;
                        filename: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>>>>;
                }, z.core.$strip>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        audioFile: z.ZodObject<{
            filename: z.ZodString;
            data: z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
            format: z.ZodOptional<z.ZodObject<{
                sampleRate: z.ZodNumber;
                channels: z.ZodNumber;
                bitDepth: z.ZodUnion<readonly [z.ZodLiteral<16>, z.ZodLiteral<24>, z.ZodLiteral<32>]>;
                codec: z.ZodEnum<{
                    mp3: "mp3";
                    wav: "wav";
                    ogg: "ogg";
                    m4a: "m4a";
                }>;
                duration: z.ZodNumber;
                bitrate: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        backgroundImage: z.ZodOptional<z.ZodObject<{
            filename: z.ZodString;
            data: z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
        }, z.core.$strip>>;
        hitsounds: z.ZodDefault<z.ZodMap<z.ZodString, z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>>;
        videoFile: z.ZodOptional<z.ZodObject<{
            filename: z.ZodString;
            data: z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    readonly ImportRequest: z.ZodObject<{
        filePath: z.ZodString;
        options: z.ZodDefault<z.ZodObject<{
            validateIntegrity: z.ZodDefault<z.ZodBoolean>;
            extractImages: z.ZodDefault<z.ZodBoolean>;
            extractVideo: z.ZodDefault<z.ZodBoolean>;
            extractHitsounds: z.ZodDefault<z.ZodBoolean>;
            overwriteExisting: z.ZodDefault<z.ZodBoolean>;
            generatePreviews: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    readonly ProcessingResult: z.ZodObject<{
        success: z.ZodBoolean;
        chartId: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            artist: z.ZodString;
            creator: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            bpm: z.ZodNumber;
            duration: z.ZodNumber;
            gameMode: z.ZodDefault<z.ZodEnum<{
                osu: "osu";
                taiko: "taiko";
                fruits: "fruits";
                mania: "mania";
            }>>;
            difficulties: z.ZodArray<z.ZodObject<{
                version: z.ZodString;
                starRating: z.ZodDefault<z.ZodNumber>;
                overallDifficulty: z.ZodNumber;
                approachRate: z.ZodNumber;
                circleSize: z.ZodNumber;
                hpDrainRate: z.ZodNumber;
                maxCombo: z.ZodDefault<z.ZodNumber>;
                objectCount: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            backgroundImage: z.ZodOptional<z.ZodString>;
            previewTime: z.ZodOptional<z.ZodNumber>;
            audioFilename: z.ZodString;
            createdAt: z.ZodDefault<z.ZodDate>;
            updatedAt: z.ZodDefault<z.ZodDate>;
        }, z.core.$strict>>;
        errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            file: z.ZodOptional<z.ZodString>;
            line: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            file: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        importedFiles: z.ZodDefault<z.ZodArray<z.ZodString>>;
        skippedFiles: z.ZodDefault<z.ZodArray<z.ZodString>>;
        processingTime: z.ZodNumber;
        memoryUsed: z.ZodNumber;
    }, z.core.$strict>;
    readonly FileStructure: z.ZodObject<{
        beatmapFiles: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            isDirectory: z.ZodBoolean;
            data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        }, z.core.$strip>>;
        audioFiles: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            isDirectory: z.ZodBoolean;
            data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        }, z.core.$strip>>;
        imageFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            isDirectory: z.ZodBoolean;
            data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        }, z.core.$strip>>>;
        videoFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            isDirectory: z.ZodBoolean;
            data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        }, z.core.$strip>>>;
        storyboardFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            isDirectory: z.ZodBoolean;
            data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        }, z.core.$strip>>>;
        hitsoundFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            isDirectory: z.ZodBoolean;
            data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        }, z.core.$strip>>>;
        skinFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            isDirectory: z.ZodBoolean;
            data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        }, z.core.$strip>>>;
        otherFiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            isDirectory: z.ZodBoolean;
            data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    readonly RawData: z.ZodObject<{
        filePath: z.ZodString;
        fileSize: z.ZodNumber;
        zipEntries: z.ZodArray<z.ZodObject<{
            entryName: z.ZodString;
            size: z.ZodNumber;
            compressedSize: z.ZodNumber;
            crc: z.ZodNumber;
            isDirectory: z.ZodBoolean;
        }, z.core.$strip>>;
        extractionPath: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly General: z.ZodObject<{
        audioFilename: z.ZodString;
        audioLeadIn: z.ZodDefault<z.ZodNumber>;
        previewTime: z.ZodDefault<z.ZodNumber>;
        countdown: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        sampleSet: z.ZodDefault<z.ZodEnum<{
            Normal: "Normal";
            Soft: "Soft";
            Drum: "Drum";
        }>>;
        stackLeniency: z.ZodDefault<z.ZodNumber>;
        mode: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        letterboxInBreaks: z.ZodDefault<z.ZodBoolean>;
        widescreenStoryboard: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Metadata: z.ZodObject<{
        title: z.ZodString;
        titleUnicode: z.ZodDefault<z.ZodString>;
        artist: z.ZodString;
        artistUnicode: z.ZodDefault<z.ZodString>;
        creator: z.ZodString;
        version: z.ZodString;
        source: z.ZodDefault<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        beatmapID: z.ZodDefault<z.ZodNumber>;
        beatmapSetID: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    readonly Difficulty: z.ZodObject<{
        hpDrainRate: z.ZodDefault<z.ZodNumber>;
        circleSize: z.ZodDefault<z.ZodNumber>;
        overallDifficulty: z.ZodDefault<z.ZodNumber>;
        approachRate: z.ZodDefault<z.ZodNumber>;
        sliderMultiplier: z.ZodDefault<z.ZodNumber>;
        sliderTickRate: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    readonly TimingPoint: z.ZodObject<{
        time: z.ZodNumber;
        beatLength: z.ZodNumber;
        meter: z.ZodDefault<z.ZodNumber>;
        sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
        sampleIndex: z.ZodDefault<z.ZodNumber>;
        volume: z.ZodDefault<z.ZodNumber>;
        uninherited: z.ZodDefault<z.ZodBoolean>;
        effects: z.ZodDefault<z.ZodObject<{
            kiaiTime: z.ZodDefault<z.ZodBoolean>;
            omitFirstBarLine: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    readonly HitObject: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        time: z.ZodNumber;
        type: z.ZodObject<{
            circle: z.ZodDefault<z.ZodBoolean>;
            slider: z.ZodDefault<z.ZodBoolean>;
            newCombo: z.ZodDefault<z.ZodBoolean>;
            spinner: z.ZodDefault<z.ZodBoolean>;
            colourSkip: z.ZodDefault<z.ZodNumber>;
            hold: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
        hitSound: z.ZodObject<{
            normal: z.ZodDefault<z.ZodBoolean>;
            whistle: z.ZodDefault<z.ZodBoolean>;
            finish: z.ZodDefault<z.ZodBoolean>;
            clap: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
        endTime: z.ZodOptional<z.ZodNumber>;
        additions: z.ZodOptional<z.ZodObject<{
            sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
            customIndex: z.ZodDefault<z.ZodNumber>;
            volume: z.ZodDefault<z.ZodNumber>;
            filename: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        sliderData: z.ZodOptional<z.ZodObject<{
            curveType: z.ZodEnum<{
                B: "B";
                L: "L";
                P: "P";
                C: "C";
            }>;
            curvePoints: z.ZodArray<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strip>>;
            slides: z.ZodNumber;
            length: z.ZodNumber;
            edgeSounds: z.ZodDefault<z.ZodArray<z.ZodObject<{
                normal: z.ZodDefault<z.ZodBoolean>;
                whistle: z.ZodDefault<z.ZodBoolean>;
                finish: z.ZodDefault<z.ZodBoolean>;
                clap: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>>>;
            edgeSets: z.ZodDefault<z.ZodArray<z.ZodOptional<z.ZodObject<{
                sampleSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                additionSet: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>>;
                customIndex: z.ZodDefault<z.ZodNumber>;
                volume: z.ZodDefault<z.ZodNumber>;
                filename: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    readonly AudioFormat: z.ZodObject<{
        sampleRate: z.ZodNumber;
        channels: z.ZodNumber;
        bitDepth: z.ZodUnion<readonly [z.ZodLiteral<16>, z.ZodLiteral<24>, z.ZodLiteral<32>]>;
        codec: z.ZodEnum<{
            mp3: "mp3";
            wav: "wav";
            ogg: "ogg";
            m4a: "m4a";
        }>;
        duration: z.ZodNumber;
        bitrate: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
};
export type ValidatedBeatmap = z.infer<typeof BeatmapSchema>;
export type ValidatedChartMetadata = z.infer<typeof ChartMetadataSchema>;
export type ValidatedOszContent = z.infer<typeof OszContentSchema>;
export type ValidatedImportRequest = z.infer<typeof OszImportRequestSchema>;
export type ValidatedProcessingResult = z.infer<typeof OszProcessingResultSchema>;
//# sourceMappingURL=osz.schema.d.ts.map