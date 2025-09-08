/**
 * Schema validation system index
 * Exports all Zod schemas for data validation throughout the PRG project
 */
export { OszSchemas } from './osz.schema';
export type { ValidatedBeatmap, ValidatedChartMetadata, ValidatedOszContent, ValidatedImportRequest, ValidatedProcessingResult, } from './osz.schema';
export { IpcSchemas } from './ipc.schema';
export type { ValidatedGameStartRequest, ValidatedGameStartResponse, ValidatedOszImportRequest, ValidatedOszImportResponse, ValidatedKnifeThrowRequest, ValidatedKnifeResultEvent, ValidatedGameModifiers, } from './ipc.schema';
export { SettingsSchemas } from './settings.schema';
export type { ValidatedUserSettings, ValidatedAudioSettings, ValidatedVisualSettings, ValidatedInputSettings, ValidatedGameplaySettings, ValidatedSettingsImport, ValidatedSettingsExport, ValidatedSettingsPatch, ValidatedSettingsValidationResult, } from './settings.schema';
/**
 * Combined schema collections for easy access
 */
export declare const AllSchemas: {
    readonly Osz: () => Promise<{
        readonly Beatmap: import("zod").ZodObject<{
            general: import("zod").ZodObject<{
                audioFilename: import("zod").ZodString;
                audioLeadIn: import("zod").ZodDefault<import("zod").ZodNumber>;
                previewTime: import("zod").ZodDefault<import("zod").ZodNumber>;
                countdown: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                sampleSet: import("zod").ZodDefault<import("zod").ZodEnum<{
                    Normal: "Normal";
                    Soft: "Soft";
                    Drum: "Drum";
                }>>;
                stackLeniency: import("zod").ZodDefault<import("zod").ZodNumber>;
                mode: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                letterboxInBreaks: import("zod").ZodDefault<import("zod").ZodBoolean>;
                widescreenStoryboard: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            editor: import("zod").ZodOptional<import("zod").ZodObject<{
                bookmarks: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodNumber>>;
                distanceSpacing: import("zod").ZodDefault<import("zod").ZodNumber>;
                beatDivisor: import("zod").ZodDefault<import("zod").ZodNumber>;
                gridSize: import("zod").ZodDefault<import("zod").ZodNumber>;
                timelineZoom: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("zod/v4/core/schemas.cjs").$strict>>;
            metadata: import("zod").ZodObject<{
                title: import("zod").ZodString;
                titleUnicode: import("zod").ZodDefault<import("zod").ZodString>;
                artist: import("zod").ZodString;
                artistUnicode: import("zod").ZodDefault<import("zod").ZodString>;
                creator: import("zod").ZodString;
                version: import("zod").ZodString;
                source: import("zod").ZodDefault<import("zod").ZodString>;
                tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
                beatmapID: import("zod").ZodDefault<import("zod").ZodNumber>;
                beatmapSetID: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            difficulty: import("zod").ZodObject<{
                hpDrainRate: import("zod").ZodDefault<import("zod").ZodNumber>;
                circleSize: import("zod").ZodDefault<import("zod").ZodNumber>;
                overallDifficulty: import("zod").ZodDefault<import("zod").ZodNumber>;
                approachRate: import("zod").ZodDefault<import("zod").ZodNumber>;
                sliderMultiplier: import("zod").ZodDefault<import("zod").ZodNumber>;
                sliderTickRate: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            events: import("zod").ZodDefault<import("zod").ZodObject<{
                backgroundPath: import("zod").ZodOptional<import("zod").ZodString>;
                videoPath: import("zod").ZodOptional<import("zod").ZodString>;
                breaks: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                    startTime: import("zod").ZodNumber;
                    endTime: import("zod").ZodNumber;
                }, import("zod/v4/core/schemas.cjs").$strip>>>;
                storyboard: import("zod").ZodOptional<import("zod").ZodObject<{
                    sprites: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodUnknown>>;
                    animations: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodUnknown>>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timingPoints: import("zod").ZodArray<import("zod").ZodObject<{
                time: import("zod").ZodNumber;
                beatLength: import("zod").ZodNumber;
                meter: import("zod").ZodDefault<import("zod").ZodNumber>;
                sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                sampleIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
                volume: import("zod").ZodDefault<import("zod").ZodNumber>;
                uninherited: import("zod").ZodDefault<import("zod").ZodBoolean>;
                effects: import("zod").ZodDefault<import("zod").ZodObject<{
                    kiaiTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    omitFirstBarLine: import("zod").ZodDefault<import("zod").ZodBoolean>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
            }, import("zod/v4/core/schemas.cjs").$strict>>;
            colours: import("zod").ZodDefault<import("zod").ZodObject<{
                combo: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                    r: import("zod").ZodNumber;
                    g: import("zod").ZodNumber;
                    b: import("zod").ZodNumber;
                }, import("zod/v4/core/schemas.cjs").$strip>>>;
                sliderTrackOverride: import("zod").ZodOptional<import("zod").ZodObject<{
                    r: import("zod").ZodNumber;
                    g: import("zod").ZodNumber;
                    b: import("zod").ZodNumber;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
                sliderBorder: import("zod").ZodOptional<import("zod").ZodObject<{
                    r: import("zod").ZodNumber;
                    g: import("zod").ZodNumber;
                    b: import("zod").ZodNumber;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            hitObjects: import("zod").ZodArray<import("zod").ZodObject<{
                x: import("zod").ZodNumber;
                y: import("zod").ZodNumber;
                time: import("zod").ZodNumber;
                type: import("zod").ZodObject<{
                    circle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    slider: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    newCombo: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    spinner: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    colourSkip: import("zod").ZodDefault<import("zod").ZodNumber>;
                    hold: import("zod").ZodDefault<import("zod").ZodBoolean>;
                }, import("zod/v4/core/schemas.cjs").$strip>;
                hitSound: import("zod").ZodObject<{
                    normal: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    whistle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    finish: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    clap: import("zod").ZodDefault<import("zod").ZodBoolean>;
                }, import("zod/v4/core/schemas.cjs").$strip>;
                endTime: import("zod").ZodOptional<import("zod").ZodNumber>;
                additions: import("zod").ZodOptional<import("zod").ZodObject<{
                    sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                    additionSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                    customIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
                    volume: import("zod").ZodDefault<import("zod").ZodNumber>;
                    filename: import("zod").ZodOptional<import("zod").ZodString>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
                sliderData: import("zod").ZodOptional<import("zod").ZodObject<{
                    curveType: import("zod").ZodEnum<{
                        B: "B";
                        L: "L";
                        P: "P";
                        C: "C";
                    }>;
                    curvePoints: import("zod").ZodArray<import("zod").ZodObject<{
                        x: import("zod").ZodNumber;
                        y: import("zod").ZodNumber;
                    }, import("zod/v4/core/schemas.cjs").$strip>>;
                    slides: import("zod").ZodNumber;
                    length: import("zod").ZodNumber;
                    edgeSounds: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                        normal: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        whistle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        finish: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        clap: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    }, import("zod/v4/core/schemas.cjs").$strip>>>;
                    edgeSets: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodOptional<import("zod").ZodObject<{
                        sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                        additionSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                        customIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
                        volume: import("zod").ZodDefault<import("zod").ZodNumber>;
                        filename: import("zod").ZodOptional<import("zod").ZodString>;
                    }, import("zod/v4/core/schemas.cjs").$strip>>>>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
            }, import("zod/v4/core/schemas.cjs").$strict>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ChartMetadata: import("zod").ZodObject<{
            id: import("zod").ZodString;
            title: import("zod").ZodString;
            artist: import("zod").ZodString;
            creator: import("zod").ZodString;
            source: import("zod").ZodOptional<import("zod").ZodString>;
            tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
            bpm: import("zod").ZodNumber;
            duration: import("zod").ZodNumber;
            gameMode: import("zod").ZodDefault<import("zod").ZodEnum<{
                osu: "osu";
                taiko: "taiko";
                fruits: "fruits";
                mania: "mania";
            }>>;
            difficulties: import("zod").ZodArray<import("zod").ZodObject<{
                version: import("zod").ZodString;
                starRating: import("zod").ZodDefault<import("zod").ZodNumber>;
                overallDifficulty: import("zod").ZodNumber;
                approachRate: import("zod").ZodNumber;
                circleSize: import("zod").ZodNumber;
                hpDrainRate: import("zod").ZodNumber;
                maxCombo: import("zod").ZodDefault<import("zod").ZodNumber>;
                objectCount: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("zod/v4/core/schemas.cjs").$strict>>;
            backgroundImage: import("zod").ZodOptional<import("zod").ZodString>;
            previewTime: import("zod").ZodOptional<import("zod").ZodNumber>;
            audioFilename: import("zod").ZodString;
            createdAt: import("zod").ZodDefault<import("zod").ZodDate>;
            updatedAt: import("zod").ZodDefault<import("zod").ZodDate>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly OszContent: import("zod").ZodObject<{
            metadata: import("zod").ZodObject<{
                id: import("zod").ZodString;
                title: import("zod").ZodString;
                artist: import("zod").ZodString;
                creator: import("zod").ZodString;
                source: import("zod").ZodOptional<import("zod").ZodString>;
                tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
                bpm: import("zod").ZodNumber;
                duration: import("zod").ZodNumber;
                gameMode: import("zod").ZodDefault<import("zod").ZodEnum<{
                    osu: "osu";
                    taiko: "taiko";
                    fruits: "fruits";
                    mania: "mania";
                }>>;
                difficulties: import("zod").ZodArray<import("zod").ZodObject<{
                    version: import("zod").ZodString;
                    starRating: import("zod").ZodDefault<import("zod").ZodNumber>;
                    overallDifficulty: import("zod").ZodNumber;
                    approachRate: import("zod").ZodNumber;
                    circleSize: import("zod").ZodNumber;
                    hpDrainRate: import("zod").ZodNumber;
                    maxCombo: import("zod").ZodDefault<import("zod").ZodNumber>;
                    objectCount: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strict>>;
                backgroundImage: import("zod").ZodOptional<import("zod").ZodString>;
                previewTime: import("zod").ZodOptional<import("zod").ZodNumber>;
                audioFilename: import("zod").ZodString;
                createdAt: import("zod").ZodDefault<import("zod").ZodDate>;
                updatedAt: import("zod").ZodDefault<import("zod").ZodDate>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            difficulties: import("zod").ZodMap<import("zod").ZodString, import("zod").ZodObject<{
                general: import("zod").ZodObject<{
                    audioFilename: import("zod").ZodString;
                    audioLeadIn: import("zod").ZodDefault<import("zod").ZodNumber>;
                    previewTime: import("zod").ZodDefault<import("zod").ZodNumber>;
                    countdown: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                    sampleSet: import("zod").ZodDefault<import("zod").ZodEnum<{
                        Normal: "Normal";
                        Soft: "Soft";
                        Drum: "Drum";
                    }>>;
                    stackLeniency: import("zod").ZodDefault<import("zod").ZodNumber>;
                    mode: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                    letterboxInBreaks: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    widescreenStoryboard: import("zod").ZodDefault<import("zod").ZodBoolean>;
                }, import("zod/v4/core/schemas.cjs").$strict>;
                editor: import("zod").ZodOptional<import("zod").ZodObject<{
                    bookmarks: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodNumber>>;
                    distanceSpacing: import("zod").ZodDefault<import("zod").ZodNumber>;
                    beatDivisor: import("zod").ZodDefault<import("zod").ZodNumber>;
                    gridSize: import("zod").ZodDefault<import("zod").ZodNumber>;
                    timelineZoom: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strict>>;
                metadata: import("zod").ZodObject<{
                    title: import("zod").ZodString;
                    titleUnicode: import("zod").ZodDefault<import("zod").ZodString>;
                    artist: import("zod").ZodString;
                    artistUnicode: import("zod").ZodDefault<import("zod").ZodString>;
                    creator: import("zod").ZodString;
                    version: import("zod").ZodString;
                    source: import("zod").ZodDefault<import("zod").ZodString>;
                    tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
                    beatmapID: import("zod").ZodDefault<import("zod").ZodNumber>;
                    beatmapSetID: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strict>;
                difficulty: import("zod").ZodObject<{
                    hpDrainRate: import("zod").ZodDefault<import("zod").ZodNumber>;
                    circleSize: import("zod").ZodDefault<import("zod").ZodNumber>;
                    overallDifficulty: import("zod").ZodDefault<import("zod").ZodNumber>;
                    approachRate: import("zod").ZodDefault<import("zod").ZodNumber>;
                    sliderMultiplier: import("zod").ZodDefault<import("zod").ZodNumber>;
                    sliderTickRate: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strict>;
                events: import("zod").ZodDefault<import("zod").ZodObject<{
                    backgroundPath: import("zod").ZodOptional<import("zod").ZodString>;
                    videoPath: import("zod").ZodOptional<import("zod").ZodString>;
                    breaks: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                        startTime: import("zod").ZodNumber;
                        endTime: import("zod").ZodNumber;
                    }, import("zod/v4/core/schemas.cjs").$strip>>>;
                    storyboard: import("zod").ZodOptional<import("zod").ZodObject<{
                        sprites: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodUnknown>>;
                        animations: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodUnknown>>;
                    }, import("zod/v4/core/schemas.cjs").$strip>>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
                timingPoints: import("zod").ZodArray<import("zod").ZodObject<{
                    time: import("zod").ZodNumber;
                    beatLength: import("zod").ZodNumber;
                    meter: import("zod").ZodDefault<import("zod").ZodNumber>;
                    sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                    sampleIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
                    volume: import("zod").ZodDefault<import("zod").ZodNumber>;
                    uninherited: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    effects: import("zod").ZodDefault<import("zod").ZodObject<{
                        kiaiTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        omitFirstBarLine: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    }, import("zod/v4/core/schemas.cjs").$strip>>;
                }, import("zod/v4/core/schemas.cjs").$strict>>;
                colours: import("zod").ZodDefault<import("zod").ZodObject<{
                    combo: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                        r: import("zod").ZodNumber;
                        g: import("zod").ZodNumber;
                        b: import("zod").ZodNumber;
                    }, import("zod/v4/core/schemas.cjs").$strip>>>;
                    sliderTrackOverride: import("zod").ZodOptional<import("zod").ZodObject<{
                        r: import("zod").ZodNumber;
                        g: import("zod").ZodNumber;
                        b: import("zod").ZodNumber;
                    }, import("zod/v4/core/schemas.cjs").$strip>>;
                    sliderBorder: import("zod").ZodOptional<import("zod").ZodObject<{
                        r: import("zod").ZodNumber;
                        g: import("zod").ZodNumber;
                        b: import("zod").ZodNumber;
                    }, import("zod/v4/core/schemas.cjs").$strip>>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
                hitObjects: import("zod").ZodArray<import("zod").ZodObject<{
                    x: import("zod").ZodNumber;
                    y: import("zod").ZodNumber;
                    time: import("zod").ZodNumber;
                    type: import("zod").ZodObject<{
                        circle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        slider: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        newCombo: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        spinner: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        colourSkip: import("zod").ZodDefault<import("zod").ZodNumber>;
                        hold: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    }, import("zod/v4/core/schemas.cjs").$strip>;
                    hitSound: import("zod").ZodObject<{
                        normal: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        whistle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        finish: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        clap: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    }, import("zod/v4/core/schemas.cjs").$strip>;
                    endTime: import("zod").ZodOptional<import("zod").ZodNumber>;
                    additions: import("zod").ZodOptional<import("zod").ZodObject<{
                        sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                        additionSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                        customIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
                        volume: import("zod").ZodDefault<import("zod").ZodNumber>;
                        filename: import("zod").ZodOptional<import("zod").ZodString>;
                    }, import("zod/v4/core/schemas.cjs").$strip>>;
                    sliderData: import("zod").ZodOptional<import("zod").ZodObject<{
                        curveType: import("zod").ZodEnum<{
                            B: "B";
                            L: "L";
                            P: "P";
                            C: "C";
                        }>;
                        curvePoints: import("zod").ZodArray<import("zod").ZodObject<{
                            x: import("zod").ZodNumber;
                            y: import("zod").ZodNumber;
                        }, import("zod/v4/core/schemas.cjs").$strip>>;
                        slides: import("zod").ZodNumber;
                        length: import("zod").ZodNumber;
                        edgeSounds: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                            normal: import("zod").ZodDefault<import("zod").ZodBoolean>;
                            whistle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                            finish: import("zod").ZodDefault<import("zod").ZodBoolean>;
                            clap: import("zod").ZodDefault<import("zod").ZodBoolean>;
                        }, import("zod/v4/core/schemas.cjs").$strip>>>;
                        edgeSets: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodOptional<import("zod").ZodObject<{
                            sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                            additionSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                            customIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
                            volume: import("zod").ZodDefault<import("zod").ZodNumber>;
                            filename: import("zod").ZodOptional<import("zod").ZodString>;
                        }, import("zod/v4/core/schemas.cjs").$strip>>>>;
                    }, import("zod/v4/core/schemas.cjs").$strip>>;
                }, import("zod/v4/core/schemas.cjs").$strict>>;
            }, import("zod/v4/core/schemas.cjs").$strict>>;
            audioFile: import("zod").ZodObject<{
                filename: import("zod").ZodString;
                data: import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
                format: import("zod").ZodOptional<import("zod").ZodObject<{
                    sampleRate: import("zod").ZodNumber;
                    channels: import("zod").ZodNumber;
                    bitDepth: import("zod").ZodUnion<readonly [import("zod").ZodLiteral<16>, import("zod").ZodLiteral<24>, import("zod").ZodLiteral<32>]>;
                    codec: import("zod").ZodEnum<{
                        mp3: "mp3";
                        wav: "wav";
                        ogg: "ogg";
                        m4a: "m4a";
                    }>;
                    duration: import("zod").ZodNumber;
                    bitrate: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
            }, import("zod/v4/core/schemas.cjs").$strip>;
            backgroundImage: import("zod").ZodOptional<import("zod").ZodObject<{
                filename: import("zod").ZodString;
                data: import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            hitsounds: import("zod").ZodDefault<import("zod").ZodMap<import("zod").ZodString, import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>>;
            videoFile: import("zod").ZodOptional<import("zod").ZodObject<{
                filename: import("zod").ZodString;
                data: import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ImportRequest: import("zod").ZodObject<{
            filePath: import("zod").ZodString;
            options: import("zod").ZodDefault<import("zod").ZodObject<{
                validateIntegrity: import("zod").ZodDefault<import("zod").ZodBoolean>;
                extractImages: import("zod").ZodDefault<import("zod").ZodBoolean>;
                extractVideo: import("zod").ZodDefault<import("zod").ZodBoolean>;
                extractHitsounds: import("zod").ZodDefault<import("zod").ZodBoolean>;
                overwriteExisting: import("zod").ZodDefault<import("zod").ZodBoolean>;
                generatePreviews: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ProcessingResult: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            chartId: import("zod").ZodOptional<import("zod").ZodString>;
            metadata: import("zod").ZodOptional<import("zod").ZodObject<{
                id: import("zod").ZodString;
                title: import("zod").ZodString;
                artist: import("zod").ZodString;
                creator: import("zod").ZodString;
                source: import("zod").ZodOptional<import("zod").ZodString>;
                tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
                bpm: import("zod").ZodNumber;
                duration: import("zod").ZodNumber;
                gameMode: import("zod").ZodDefault<import("zod").ZodEnum<{
                    osu: "osu";
                    taiko: "taiko";
                    fruits: "fruits";
                    mania: "mania";
                }>>;
                difficulties: import("zod").ZodArray<import("zod").ZodObject<{
                    version: import("zod").ZodString;
                    starRating: import("zod").ZodDefault<import("zod").ZodNumber>;
                    overallDifficulty: import("zod").ZodNumber;
                    approachRate: import("zod").ZodNumber;
                    circleSize: import("zod").ZodNumber;
                    hpDrainRate: import("zod").ZodNumber;
                    maxCombo: import("zod").ZodDefault<import("zod").ZodNumber>;
                    objectCount: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strict>>;
                backgroundImage: import("zod").ZodOptional<import("zod").ZodString>;
                previewTime: import("zod").ZodOptional<import("zod").ZodNumber>;
                audioFilename: import("zod").ZodString;
                createdAt: import("zod").ZodDefault<import("zod").ZodDate>;
                updatedAt: import("zod").ZodDefault<import("zod").ZodDate>;
            }, import("zod/v4/core/schemas.cjs").$strict>>;
            errors: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                file: import("zod").ZodOptional<import("zod").ZodString>;
                line: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            warnings: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                file: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            importedFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
            skippedFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
            processingTime: import("zod").ZodNumber;
            memoryUsed: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly FileStructure: import("zod").ZodObject<{
            beatmapFiles: import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                path: import("zod").ZodString;
                size: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
                data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            audioFiles: import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                path: import("zod").ZodString;
                size: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
                data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            imageFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                path: import("zod").ZodString;
                size: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
                data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            videoFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                path: import("zod").ZodString;
                size: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
                data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            storyboardFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                path: import("zod").ZodString;
                size: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
                data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            hitsoundFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                path: import("zod").ZodString;
                size: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
                data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            skinFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                path: import("zod").ZodString;
                size: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
                data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            otherFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                path: import("zod").ZodString;
                size: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
                data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
        }, import("zod/v4/core/schemas.cjs").$strip>;
        readonly RawData: import("zod").ZodObject<{
            filePath: import("zod").ZodString;
            fileSize: import("zod").ZodNumber;
            zipEntries: import("zod").ZodArray<import("zod").ZodObject<{
                entryName: import("zod").ZodString;
                size: import("zod").ZodNumber;
                compressedSize: import("zod").ZodNumber;
                crc: import("zod").ZodNumber;
                isDirectory: import("zod").ZodBoolean;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            extractionPath: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly General: import("zod").ZodObject<{
            audioFilename: import("zod").ZodString;
            audioLeadIn: import("zod").ZodDefault<import("zod").ZodNumber>;
            previewTime: import("zod").ZodDefault<import("zod").ZodNumber>;
            countdown: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
            sampleSet: import("zod").ZodDefault<import("zod").ZodEnum<{
                Normal: "Normal";
                Soft: "Soft";
                Drum: "Drum";
            }>>;
            stackLeniency: import("zod").ZodDefault<import("zod").ZodNumber>;
            mode: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
            letterboxInBreaks: import("zod").ZodDefault<import("zod").ZodBoolean>;
            widescreenStoryboard: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Metadata: import("zod").ZodObject<{
            title: import("zod").ZodString;
            titleUnicode: import("zod").ZodDefault<import("zod").ZodString>;
            artist: import("zod").ZodString;
            artistUnicode: import("zod").ZodDefault<import("zod").ZodString>;
            creator: import("zod").ZodString;
            version: import("zod").ZodString;
            source: import("zod").ZodDefault<import("zod").ZodString>;
            tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
            beatmapID: import("zod").ZodDefault<import("zod").ZodNumber>;
            beatmapSetID: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Difficulty: import("zod").ZodObject<{
            hpDrainRate: import("zod").ZodDefault<import("zod").ZodNumber>;
            circleSize: import("zod").ZodDefault<import("zod").ZodNumber>;
            overallDifficulty: import("zod").ZodDefault<import("zod").ZodNumber>;
            approachRate: import("zod").ZodDefault<import("zod").ZodNumber>;
            sliderMultiplier: import("zod").ZodDefault<import("zod").ZodNumber>;
            sliderTickRate: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly TimingPoint: import("zod").ZodObject<{
            time: import("zod").ZodNumber;
            beatLength: import("zod").ZodNumber;
            meter: import("zod").ZodDefault<import("zod").ZodNumber>;
            sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
            sampleIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
            volume: import("zod").ZodDefault<import("zod").ZodNumber>;
            uninherited: import("zod").ZodDefault<import("zod").ZodBoolean>;
            effects: import("zod").ZodDefault<import("zod").ZodObject<{
                kiaiTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
                omitFirstBarLine: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly HitObject: import("zod").ZodObject<{
            x: import("zod").ZodNumber;
            y: import("zod").ZodNumber;
            time: import("zod").ZodNumber;
            type: import("zod").ZodObject<{
                circle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                slider: import("zod").ZodDefault<import("zod").ZodBoolean>;
                newCombo: import("zod").ZodDefault<import("zod").ZodBoolean>;
                spinner: import("zod").ZodDefault<import("zod").ZodBoolean>;
                colourSkip: import("zod").ZodDefault<import("zod").ZodNumber>;
                hold: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strip>;
            hitSound: import("zod").ZodObject<{
                normal: import("zod").ZodDefault<import("zod").ZodBoolean>;
                whistle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                finish: import("zod").ZodDefault<import("zod").ZodBoolean>;
                clap: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strip>;
            endTime: import("zod").ZodOptional<import("zod").ZodNumber>;
            additions: import("zod").ZodOptional<import("zod").ZodObject<{
                sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                additionSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                customIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
                volume: import("zod").ZodDefault<import("zod").ZodNumber>;
                filename: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            sliderData: import("zod").ZodOptional<import("zod").ZodObject<{
                curveType: import("zod").ZodEnum<{
                    B: "B";
                    L: "L";
                    P: "P";
                    C: "C";
                }>;
                curvePoints: import("zod").ZodArray<import("zod").ZodObject<{
                    x: import("zod").ZodNumber;
                    y: import("zod").ZodNumber;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
                slides: import("zod").ZodNumber;
                length: import("zod").ZodNumber;
                edgeSounds: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                    normal: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    whistle: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    finish: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    clap: import("zod").ZodDefault<import("zod").ZodBoolean>;
                }, import("zod/v4/core/schemas.cjs").$strip>>>;
                edgeSets: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodOptional<import("zod").ZodObject<{
                    sampleSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                    additionSet: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<0>, import("zod").ZodLiteral<1>, import("zod").ZodLiteral<2>, import("zod").ZodLiteral<3>]>>;
                    customIndex: import("zod").ZodDefault<import("zod").ZodNumber>;
                    volume: import("zod").ZodDefault<import("zod").ZodNumber>;
                    filename: import("zod").ZodOptional<import("zod").ZodString>;
                }, import("zod/v4/core/schemas.cjs").$strip>>>>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly AudioFormat: import("zod").ZodObject<{
            sampleRate: import("zod").ZodNumber;
            channels: import("zod").ZodNumber;
            bitDepth: import("zod").ZodUnion<readonly [import("zod").ZodLiteral<16>, import("zod").ZodLiteral<24>, import("zod").ZodLiteral<32>]>;
            codec: import("zod").ZodEnum<{
                mp3: "mp3";
                wav: "wav";
                ogg: "ogg";
                m4a: "m4a";
            }>;
            duration: import("zod").ZodNumber;
            bitrate: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod/v4/core/schemas.cjs").$strip>;
    }>;
    readonly Ipc: () => Promise<{
        readonly GameStartRequest: import("zod").ZodObject<{
            chartId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
            difficulty: import("zod").ZodString;
            modifiers: import("zod").ZodOptional<import("zod").ZodObject<{
                noFail: import("zod").ZodDefault<import("zod").ZodBoolean>;
                easy: import("zod").ZodDefault<import("zod").ZodBoolean>;
                hardRock: import("zod").ZodDefault<import("zod").ZodBoolean>;
                doubleTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
                halfTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
                hidden: import("zod").ZodDefault<import("zod").ZodBoolean>;
                flashlight: import("zod").ZodDefault<import("zod").ZodBoolean>;
                autoplay: import("zod").ZodDefault<import("zod").ZodBoolean>;
                relax: import("zod").ZodDefault<import("zod").ZodBoolean>;
                speedMultiplier: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("zod/v4/core/schemas.cjs").$strict>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly GameStartResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            sessionId: import("zod").ZodOptional<import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "SessionId">>;
            chartData: import("zod").ZodOptional<import("zod").ZodUnknown>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly GameStopResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            finalScore: import("zod").ZodOptional<import("zod").ZodObject<{
                sessionId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "SessionId">;
                chartId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
                difficulty: import("zod").ZodString;
                totalScore: import("zod").ZodNumber;
                accuracy: import("zod").ZodNumber;
                maxCombo: import("zod").ZodNumber;
                judgmentCounts: import("zod").ZodRecord<import("zod").ZodEnum<{
                    KOOL: "KOOL";
                    COOL: "COOL";
                    GOOD: "GOOD";
                    MISS: "MISS";
                }>, import("zod").ZodNumber>;
                grade: import("zod").ZodEnum<{
                    B: "B";
                    C: "C";
                    SS: "SS";
                    S: "S";
                    A: "A";
                    D: "D";
                    F: "F";
                }>;
                modifiers: import("zod").ZodObject<{
                    noFail: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    easy: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    hardRock: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    doubleTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    halfTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    hidden: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    flashlight: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    autoplay: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    relax: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    speedMultiplier: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strict>;
                playTime: import("zod").ZodNumber;
                completedAt: import("zod").ZodDate;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly GamePauseResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            isPaused: import("zod").ZodBoolean;
            pauseTime: import("zod").ZodNumber;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly GameResumeResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            isPaused: import("zod").ZodBoolean;
            resumeTime: import("zod").ZodNumber;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly KnifeThrowRequest: import("zod").ZodObject<{
            sessionId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "SessionId">;
            throwTime: import("zod").ZodNumber;
            inputLatency: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly KnifeThrowResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            knifeId: import("zod").ZodOptional<import("zod").ZodString>;
            serverTime: import("zod").ZodOptional<import("zod").ZodNumber>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly OszImportRequest: import("zod").ZodObject<{
            filePath: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly OszImportResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            chartId: import("zod").ZodOptional<import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">>;
            metadata: import("zod").ZodOptional<import("zod").ZodObject<{
                id: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
                title: import("zod").ZodString;
                artist: import("zod").ZodString;
                creator: import("zod").ZodString;
                source: import("zod").ZodOptional<import("zod").ZodString>;
                tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
                bpm: import("zod").ZodNumber;
                duration: import("zod").ZodNumber;
                gameMode: import("zod").ZodDefault<import("zod").ZodEnum<{
                    osu: "osu";
                    taiko: "taiko";
                    fruits: "fruits";
                    mania: "mania";
                }>>;
                difficulties: import("zod").ZodArray<import("zod").ZodObject<{
                    version: import("zod").ZodString;
                    starRating: import("zod").ZodDefault<import("zod").ZodNumber>;
                    overallDifficulty: import("zod").ZodNumber;
                    approachRate: import("zod").ZodNumber;
                    circleSize: import("zod").ZodNumber;
                    hpDrainRate: import("zod").ZodNumber;
                    maxCombo: import("zod").ZodDefault<import("zod").ZodNumber>;
                    objectCount: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
                backgroundImage: import("zod").ZodOptional<import("zod").ZodString>;
                previewTime: import("zod").ZodOptional<import("zod").ZodNumber>;
                audioFilename: import("zod").ZodString;
                createdAt: import("zod").ZodDefault<import("zod").ZodDate>;
                updatedAt: import("zod").ZodDefault<import("zod").ZodDate>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            importedFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly OszLibraryResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            charts: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                id: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
                title: import("zod").ZodString;
                artist: import("zod").ZodString;
                creator: import("zod").ZodString;
                source: import("zod").ZodOptional<import("zod").ZodString>;
                tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
                bpm: import("zod").ZodNumber;
                duration: import("zod").ZodNumber;
                gameMode: import("zod").ZodDefault<import("zod").ZodEnum<{
                    osu: "osu";
                    taiko: "taiko";
                    fruits: "fruits";
                    mania: "mania";
                }>>;
                difficulties: import("zod").ZodArray<import("zod").ZodObject<{
                    version: import("zod").ZodString;
                    starRating: import("zod").ZodDefault<import("zod").ZodNumber>;
                    overallDifficulty: import("zod").ZodNumber;
                    approachRate: import("zod").ZodNumber;
                    circleSize: import("zod").ZodNumber;
                    hpDrainRate: import("zod").ZodNumber;
                    maxCombo: import("zod").ZodDefault<import("zod").ZodNumber>;
                    objectCount: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
                backgroundImage: import("zod").ZodOptional<import("zod").ZodString>;
                previewTime: import("zod").ZodOptional<import("zod").ZodNumber>;
                audioFilename: import("zod").ZodString;
                createdAt: import("zod").ZodDefault<import("zod").ZodDate>;
                updatedAt: import("zod").ZodDefault<import("zod").ZodDate>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            totalCount: import("zod").ZodNumber;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly OszRemoveRequest: import("zod").ZodObject<{
            chartId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly OszRemoveResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            removedFiles: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly AudioDataRequest: import("zod").ZodObject<{
            chartId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly AudioDataResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            audioData: import("zod").ZodOptional<import("zod").ZodCustom<ArrayBuffer, ArrayBuffer>>;
            format: import("zod").ZodOptional<import("zod").ZodObject<{
                sampleRate: import("zod").ZodNumber;
                channels: import("zod").ZodNumber;
                bitDepth: import("zod").ZodUnion<readonly [import("zod").ZodLiteral<16>, import("zod").ZodLiteral<24>, import("zod").ZodLiteral<32>]>;
                codec: import("zod").ZodEnum<{
                    mp3: "mp3";
                    wav: "wav";
                    ogg: "ogg";
                    m4a: "m4a";
                }>;
                duration: import("zod").ZodNumber;
                bitrate: import("zod").ZodOptional<import("zod").ZodNumber>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ChartDataRequest: import("zod").ZodObject<{
            chartId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
            difficulty: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ChartDataResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            chartData: import("zod").ZodOptional<import("zod").ZodUnknown>;
            difficulty: import("zod").ZodOptional<import("zod").ZodObject<{
                version: import("zod").ZodString;
                overallDifficulty: import("zod").ZodNumber;
                approachRate: import("zod").ZodNumber;
                circleSize: import("zod").ZodNumber;
                hpDrainRate: import("zod").ZodNumber;
                sliderMultiplier: import("zod").ZodNumber;
                sliderTickRate: import("zod").ZodNumber;
                stackLeniency: import("zod").ZodNumber;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsGetAllResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            settings: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsGetRequest: import("zod").ZodObject<{
            key: import("zod").ZodString;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsGetResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            value: import("zod").ZodOptional<import("zod").ZodUnknown>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsSetRequest: import("zod").ZodObject<{
            key: import("zod").ZodString;
            value: import("zod").ZodUnknown;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsSetResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            oldValue: import("zod").ZodOptional<import("zod").ZodUnknown>;
            newValue: import("zod").ZodOptional<import("zod").ZodUnknown>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsResetResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            defaultSettings: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsExportResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            exportPath: import("zod").ZodOptional<import("zod").ZodString>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsImportResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            importedSettings: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly FileDialogOptions: import("zod").ZodObject<{
            title: import("zod").ZodOptional<import("zod").ZodString>;
            defaultPath: import("zod").ZodOptional<import("zod").ZodString>;
            filters: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                extensions: import("zod").ZodArray<import("zod").ZodString>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            properties: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodEnum<{
                openFile: "openFile";
                openDirectory: "openDirectory";
                multiSelections: "multiSelections";
            }>>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SaveDialogOptions: import("zod").ZodObject<{
            title: import("zod").ZodOptional<import("zod").ZodString>;
            defaultPath: import("zod").ZodOptional<import("zod").ZodString>;
            filters: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                extensions: import("zod").ZodArray<import("zod").ZodString>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly FileDialogResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            filePaths: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
            canceled: import("zod").ZodBoolean;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly OpenPathRequest: import("zod").ZodObject<{
            path: import("zod").ZodString;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly OpenPathResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            opened: import("zod").ZodBoolean;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ShowInFolderRequest: import("zod").ZodObject<{
            path: import("zod").ZodString;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ShowInFolderResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            shown: import("zod").ZodBoolean;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ReadFileRequest: import("zod").ZodObject<{
            path: import("zod").ZodString;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ReadFileResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            data: import("zod").ZodOptional<import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
            encoding: import("zod").ZodOptional<import("zod").ZodString>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly WriteFileRequest: import("zod").ZodObject<{
            path: import("zod").ZodString;
            data: import("zod").ZodUnion<readonly [import("zod").ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>, import("zod").ZodString]>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly WriteFileResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            bytesWritten: import("zod").ZodOptional<import("zod").ZodNumber>;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly DeleteFileRequest: import("zod").ZodObject<{
            path: import("zod").ZodString;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly DeleteFileResponse: import("zod").ZodObject<{
            success: import("zod").ZodBoolean;
            deleted: import("zod").ZodBoolean;
            error: import("zod").ZodOptional<import("zod").ZodObject<{
                code: import("zod").ZodString;
                message: import("zod").ZodString;
                category: import("zod").ZodEnum<{
                    GAME: "GAME";
                    AUDIO: "AUDIO";
                    PHYSICS: "PHYSICS";
                    IPC: "IPC";
                    OSZ: "OSZ";
                    SYSTEM: "SYSTEM";
                }>;
                severity: import("zod").ZodEnum<{
                    LOW: "LOW";
                    MEDIUM: "MEDIUM";
                    HIGH: "HIGH";
                    CRITICAL: "CRITICAL";
                }>;
                recoverable: import("zod").ZodBoolean;
                details: import("zod").ZodOptional<import("zod").ZodUnknown>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
            timestamp: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly KnifeResultEvent: import("zod").ZodObject<{
            knifeId: import("zod").ZodString;
            result: import("zod").ZodEnum<{
                miss: "miss";
                hit: "hit";
                collision: "collision";
            }>;
            timingError: import("zod").ZodNumber;
            accuracy: import("zod").ZodNumber;
            score: import("zod").ZodNumber;
            combo: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ScoreUpdateEvent: import("zod").ZodObject<{
            sessionId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "SessionId">;
            totalScore: import("zod").ZodNumber;
            accuracy: import("zod").ZodNumber;
            combo: import("zod").ZodNumber;
            maxCombo: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ImportProgressEvent: import("zod").ZodObject<{
            progress: import("zod").ZodNumber;
            currentFile: import("zod").ZodString;
            totalFiles: import("zod").ZodNumber;
            processedFiles: import("zod").ZodNumber;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly LibraryChangeEvent: import("zod").ZodObject<{
            action: import("zod").ZodEnum<{
                added: "added";
                removed: "removed";
                updated: "updated";
            }>;
            chartId: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
            metadata: import("zod").ZodOptional<import("zod").ZodObject<{
                id: import("zod/v4/core/core.cjs").$ZodBranded<import("zod").ZodString, "ChartId">;
                title: import("zod").ZodString;
                artist: import("zod").ZodString;
                creator: import("zod").ZodString;
                source: import("zod").ZodOptional<import("zod").ZodString>;
                tags: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
                bpm: import("zod").ZodNumber;
                duration: import("zod").ZodNumber;
                gameMode: import("zod").ZodDefault<import("zod").ZodEnum<{
                    osu: "osu";
                    taiko: "taiko";
                    fruits: "fruits";
                    mania: "mania";
                }>>;
                difficulties: import("zod").ZodArray<import("zod").ZodObject<{
                    version: import("zod").ZodString;
                    starRating: import("zod").ZodDefault<import("zod").ZodNumber>;
                    overallDifficulty: import("zod").ZodNumber;
                    approachRate: import("zod").ZodNumber;
                    circleSize: import("zod").ZodNumber;
                    hpDrainRate: import("zod").ZodNumber;
                    maxCombo: import("zod").ZodDefault<import("zod").ZodNumber>;
                    objectCount: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
                backgroundImage: import("zod").ZodOptional<import("zod").ZodString>;
                previewTime: import("zod").ZodOptional<import("zod").ZodNumber>;
                audioFilename: import("zod").ZodString;
                createdAt: import("zod").ZodDefault<import("zod").ZodDate>;
                updatedAt: import("zod").ZodDefault<import("zod").ZodDate>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsChangeEvent: import("zod").ZodObject<{
            key: import("zod").ZodString;
            oldValue: import("zod").ZodUnknown;
            newValue: import("zod").ZodUnknown;
            source: import("zod").ZodEnum<{
                user: "user";
                import: "import";
                reset: "reset";
            }>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly SettingsResetEvent: import("zod").ZodObject<{
            resetSettings: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>;
            previousSettings: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly GameModifiers: import("zod").ZodObject<{
            noFail: import("zod").ZodDefault<import("zod").ZodBoolean>;
            easy: import("zod").ZodDefault<import("zod").ZodBoolean>;
            hardRock: import("zod").ZodDefault<import("zod").ZodBoolean>;
            doubleTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
            halfTime: import("zod").ZodDefault<import("zod").ZodBoolean>;
            hidden: import("zod").ZodDefault<import("zod").ZodBoolean>;
            flashlight: import("zod").ZodDefault<import("zod").ZodBoolean>;
            autoplay: import("zod").ZodDefault<import("zod").ZodBoolean>;
            relax: import("zod").ZodDefault<import("zod").ZodBoolean>;
            speedMultiplier: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
    }>;
    readonly Settings: () => Promise<{
        readonly UserSettings: import("zod").ZodObject<{
            profile: import("zod").ZodObject<{
                username: import("zod").ZodDefault<import("zod").ZodString>;
                avatar: import("zod").ZodOptional<import("zod").ZodString>;
                country: import("zod").ZodDefault<import("zod").ZodString>;
                timezone: import("zod").ZodDefault<import("zod").ZodString>;
                language: import("zod").ZodDefault<import("zod").ZodString>;
                preferredGameMode: import("zod").ZodDefault<import("zod").ZodEnum<{
                    osu: "osu";
                    taiko: "taiko";
                    fruits: "fruits";
                    mania: "mania";
                }>>;
                showOnlineStatus: import("zod").ZodDefault<import("zod").ZodBoolean>;
                allowFriendRequests: import("zod").ZodDefault<import("zod").ZodBoolean>;
                allowPrivateMessages: import("zod").ZodDefault<import("zod").ZodBoolean>;
                filterOffensiveWords: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            audio: import("zod").ZodObject<{
                masterVolume: import("zod").ZodDefault<import("zod").ZodNumber>;
                musicVolume: import("zod").ZodDefault<import("zod").ZodNumber>;
                effectVolume: import("zod").ZodDefault<import("zod").ZodNumber>;
                audioOffset: import("zod").ZodDefault<import("zod").ZodNumber>;
                audioDevice: import("zod").ZodDefault<import("zod").ZodObject<{
                    inputDeviceId: import("zod").ZodOptional<import("zod").ZodString>;
                    outputDeviceId: import("zod").ZodOptional<import("zod").ZodString>;
                    sampleRate: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<44100>, import("zod").ZodLiteral<48000>, import("zod").ZodLiteral<88200>, import("zod").ZodLiteral<96000>]>>;
                    bufferSize: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<128>, import("zod").ZodLiteral<256>, import("zod").ZodLiteral<512>, import("zod").ZodLiteral<1024>, import("zod").ZodLiteral<2048>, import("zod").ZodLiteral<4096>]>>;
                    exclusiveMode: import("zod").ZodDefault<import("zod").ZodBoolean>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            visual: import("zod").ZodObject<{
                backgroundDim: import("zod").ZodDefault<import("zod").ZodNumber>;
                showApproachCircles: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showHitLighting: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showComboFire: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showComboBreak: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showScoreOverlay: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showHealthBar: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showProgressBar: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showKeyOverlay: import("zod").ZodDefault<import("zod").ZodBoolean>;
                alwaysShowKeyOverlay: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showInterface: import("zod").ZodDefault<import("zod").ZodBoolean>;
                cursorSize: import("zod").ZodDefault<import("zod").ZodNumber>;
                cursorTrail: import("zod").ZodDefault<import("zod").ZodBoolean>;
                cursorRipples: import("zod").ZodDefault<import("zod").ZodBoolean>;
                hitErrorBar: import("zod").ZodDefault<import("zod").ZodBoolean>;
                progressBarType: import("zod").ZodDefault<import("zod").ZodEnum<{
                    none: "none";
                    pie: "pie";
                    topRight: "topRight";
                    bottomRight: "bottomRight";
                }>>;
                scoreDisplayType: import("zod").ZodDefault<import("zod").ZodEnum<{
                    score: "score";
                    accuracy: "accuracy";
                    none: "none";
                    both: "both";
                }>>;
                comboBurst: import("zod").ZodDefault<import("zod").ZodBoolean>;
                hitLighting: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            input: import("zod").ZodObject<{
                keyBindings: import("zod").ZodDefault<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
                mouseDisableWheel: import("zod").ZodDefault<import("zod").ZodBoolean>;
                mouseDisableButtons: import("zod").ZodDefault<import("zod").ZodBoolean>;
                rawInput: import("zod").ZodDefault<import("zod").ZodBoolean>;
                mouseSensitivity: import("zod").ZodDefault<import("zod").ZodNumber>;
                tabletSupport: import("zod").ZodDefault<import("zod").ZodBoolean>;
                wiimoteSupport: import("zod").ZodDefault<import("zod").ZodBoolean>;
                confineMouseCursor: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            gameplay: import("zod").ZodObject<{
                backgroundVideo: import("zod").ZodDefault<import("zod").ZodBoolean>;
                storyboard: import("zod").ZodDefault<import("zod").ZodBoolean>;
                comboBursts: import("zod").ZodDefault<import("zod").ZodBoolean>;
                hitSounds: import("zod").ZodDefault<import("zod").ZodBoolean>;
                ignoreBeatmapHitSounds: import("zod").ZodDefault<import("zod").ZodBoolean>;
                ignoreBeatmapSkin: import("zod").ZodDefault<import("zod").ZodBoolean>;
                disableWheelInGameplay: import("zod").ZodDefault<import("zod").ZodBoolean>;
                disableClicksInGameplay: import("zod").ZodDefault<import("zod").ZodBoolean>;
                bossModeOnBreaks: import("zod").ZodDefault<import("zod").ZodBoolean>;
                automaticCursorSize: import("zod").ZodDefault<import("zod").ZodBoolean>;
                saveFailedReplays: import("zod").ZodDefault<import("zod").ZodBoolean>;
                floatingComments: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showInterfaceDuringRelax: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            skin: import("zod").ZodObject<{
                currentSkin: import("zod").ZodDefault<import("zod").ZodString>;
                ignoreAllBeatmapSkins: import("zod").ZodDefault<import("zod").ZodBoolean>;
                skinSampleVolume: import("zod").ZodDefault<import("zod").ZodNumber>;
                useDefaultSkinCursor: import("zod").ZodDefault<import("zod").ZodBoolean>;
                cursorExpand: import("zod").ZodDefault<import("zod").ZodBoolean>;
                cursorCenterOnSelection: import("zod").ZodDefault<import("zod").ZodBoolean>;
                alwaysUseDefaultCursor: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            performance: import("zod").ZodObject<{
                frameLimit: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<"unlimited">, import("zod").ZodLiteral<"vsync">, import("zod").ZodNumber]>>;
                compatibilityMode: import("zod").ZodDefault<import("zod").ZodBoolean>;
                reduceDroppedFrames: import("zod").ZodDefault<import("zod").ZodBoolean>;
                detectPerformanceIssues: import("zod").ZodDefault<import("zod").ZodBoolean>;
                lowLatencyAudio: import("zod").ZodDefault<import("zod").ZodBoolean>;
                threadedOptimization: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showFPSCounter: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableGarbageCollection: import("zod").ZodDefault<import("zod").ZodBoolean>;
                memoryOptimization: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            network: import("zod").ZodObject<{
                automaticDownloads: import("zod").ZodDefault<import("zod").ZodBoolean>;
                noVideoDownloads: import("zod").ZodDefault<import("zod").ZodBoolean>;
                preferMirrorServer: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableMultiplayer: import("zod").ZodDefault<import("zod").ZodBoolean>;
                spectatorMode: import("zod").ZodDefault<import("zod").ZodBoolean>;
                autoJoinIRC: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableNotifications: import("zod").ZodDefault<import("zod").ZodBoolean>;
                proxySettings: import("zod").ZodDefault<import("zod").ZodObject<{
                    enabled: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    host: import("zod").ZodDefault<import("zod").ZodString>;
                    port: import("zod").ZodDefault<import("zod").ZodNumber>;
                    username: import("zod").ZodDefault<import("zod").ZodString>;
                    password: import("zod").ZodDefault<import("zod").ZodString>;
                }, import("zod/v4/core/schemas.cjs").$strip>>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            directories: import("zod").ZodObject<{
                chartLibrary: import("zod").ZodDefault<import("zod").ZodString>;
                cache: import("zod").ZodDefault<import("zod").ZodString>;
                logs: import("zod").ZodDefault<import("zod").ZodString>;
                recordings: import("zod").ZodDefault<import("zod").ZodString>;
                replays: import("zod").ZodDefault<import("zod").ZodString>;
                screenshots: import("zod").ZodDefault<import("zod").ZodString>;
                skins: import("zod").ZodDefault<import("zod").ZodString>;
                themes: import("zod").ZodDefault<import("zod").ZodString>;
                temporary: import("zod").ZodDefault<import("zod").ZodString>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            debug: import("zod").ZodObject<{
                enableDebugMode: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showDebugInfo: import("zod").ZodDefault<import("zod").ZodBoolean>;
                logLevel: import("zod").ZodDefault<import("zod").ZodEnum<{
                    error: "error";
                    debug: "debug";
                    info: "info";
                    warn: "warn";
                }>>;
                enablePerformanceLogging: import("zod").ZodDefault<import("zod").ZodBoolean>;
                verboseLogging: import("zod").ZodDefault<import("zod").ZodBoolean>;
                saveDebugLogs: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableHotReload: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showPhysicsDebug: import("zod").ZodDefault<import("zod").ZodBoolean>;
                showAudioDebug: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableExperimentalFeatures: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            accessibility: import("zod").ZodObject<{
                enableHighContrast: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableColorBlindSupport: import("zod").ZodDefault<import("zod").ZodBoolean>;
                colorBlindType: import("zod").ZodDefault<import("zod").ZodEnum<{
                    none: "none";
                    protanopia: "protanopia";
                    deuteranopia: "deuteranopia";
                    tritanopia: "tritanopia";
                }>>;
                enableScreenReader: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableKeyboardNavigation: import("zod").ZodDefault<import("zod").ZodBoolean>;
                reducedMotion: import("zod").ZodDefault<import("zod").ZodBoolean>;
                largerCursor: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableSoundCues: import("zod").ZodDefault<import("zod").ZodBoolean>;
                enableHapticFeedback: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strict>;
            version: import("zod").ZodDefault<import("zod").ZodString>;
            lastModified: import("zod").ZodDefault<import("zod").ZodDate>;
            migrationVersion: import("zod").ZodDefault<import("zod").ZodNumber>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Profile: import("zod").ZodObject<{
            username: import("zod").ZodDefault<import("zod").ZodString>;
            avatar: import("zod").ZodOptional<import("zod").ZodString>;
            country: import("zod").ZodDefault<import("zod").ZodString>;
            timezone: import("zod").ZodDefault<import("zod").ZodString>;
            language: import("zod").ZodDefault<import("zod").ZodString>;
            preferredGameMode: import("zod").ZodDefault<import("zod").ZodEnum<{
                osu: "osu";
                taiko: "taiko";
                fruits: "fruits";
                mania: "mania";
            }>>;
            showOnlineStatus: import("zod").ZodDefault<import("zod").ZodBoolean>;
            allowFriendRequests: import("zod").ZodDefault<import("zod").ZodBoolean>;
            allowPrivateMessages: import("zod").ZodDefault<import("zod").ZodBoolean>;
            filterOffensiveWords: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Audio: import("zod").ZodObject<{
            masterVolume: import("zod").ZodDefault<import("zod").ZodNumber>;
            musicVolume: import("zod").ZodDefault<import("zod").ZodNumber>;
            effectVolume: import("zod").ZodDefault<import("zod").ZodNumber>;
            audioOffset: import("zod").ZodDefault<import("zod").ZodNumber>;
            audioDevice: import("zod").ZodDefault<import("zod").ZodObject<{
                inputDeviceId: import("zod").ZodOptional<import("zod").ZodString>;
                outputDeviceId: import("zod").ZodOptional<import("zod").ZodString>;
                sampleRate: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<44100>, import("zod").ZodLiteral<48000>, import("zod").ZodLiteral<88200>, import("zod").ZodLiteral<96000>]>>;
                bufferSize: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<128>, import("zod").ZodLiteral<256>, import("zod").ZodLiteral<512>, import("zod").ZodLiteral<1024>, import("zod").ZodLiteral<2048>, import("zod").ZodLiteral<4096>]>>;
                exclusiveMode: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Visual: import("zod").ZodObject<{
            backgroundDim: import("zod").ZodDefault<import("zod").ZodNumber>;
            showApproachCircles: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showHitLighting: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showComboFire: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showComboBreak: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showScoreOverlay: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showHealthBar: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showProgressBar: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showKeyOverlay: import("zod").ZodDefault<import("zod").ZodBoolean>;
            alwaysShowKeyOverlay: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showInterface: import("zod").ZodDefault<import("zod").ZodBoolean>;
            cursorSize: import("zod").ZodDefault<import("zod").ZodNumber>;
            cursorTrail: import("zod").ZodDefault<import("zod").ZodBoolean>;
            cursorRipples: import("zod").ZodDefault<import("zod").ZodBoolean>;
            hitErrorBar: import("zod").ZodDefault<import("zod").ZodBoolean>;
            progressBarType: import("zod").ZodDefault<import("zod").ZodEnum<{
                none: "none";
                pie: "pie";
                topRight: "topRight";
                bottomRight: "bottomRight";
            }>>;
            scoreDisplayType: import("zod").ZodDefault<import("zod").ZodEnum<{
                score: "score";
                accuracy: "accuracy";
                none: "none";
                both: "both";
            }>>;
            comboBurst: import("zod").ZodDefault<import("zod").ZodBoolean>;
            hitLighting: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Input: import("zod").ZodObject<{
            keyBindings: import("zod").ZodDefault<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
            mouseDisableWheel: import("zod").ZodDefault<import("zod").ZodBoolean>;
            mouseDisableButtons: import("zod").ZodDefault<import("zod").ZodBoolean>;
            rawInput: import("zod").ZodDefault<import("zod").ZodBoolean>;
            mouseSensitivity: import("zod").ZodDefault<import("zod").ZodNumber>;
            tabletSupport: import("zod").ZodDefault<import("zod").ZodBoolean>;
            wiimoteSupport: import("zod").ZodDefault<import("zod").ZodBoolean>;
            confineMouseCursor: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Gameplay: import("zod").ZodObject<{
            backgroundVideo: import("zod").ZodDefault<import("zod").ZodBoolean>;
            storyboard: import("zod").ZodDefault<import("zod").ZodBoolean>;
            comboBursts: import("zod").ZodDefault<import("zod").ZodBoolean>;
            hitSounds: import("zod").ZodDefault<import("zod").ZodBoolean>;
            ignoreBeatmapHitSounds: import("zod").ZodDefault<import("zod").ZodBoolean>;
            ignoreBeatmapSkin: import("zod").ZodDefault<import("zod").ZodBoolean>;
            disableWheelInGameplay: import("zod").ZodDefault<import("zod").ZodBoolean>;
            disableClicksInGameplay: import("zod").ZodDefault<import("zod").ZodBoolean>;
            bossModeOnBreaks: import("zod").ZodDefault<import("zod").ZodBoolean>;
            automaticCursorSize: import("zod").ZodDefault<import("zod").ZodBoolean>;
            saveFailedReplays: import("zod").ZodDefault<import("zod").ZodBoolean>;
            floatingComments: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showInterfaceDuringRelax: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Skin: import("zod").ZodObject<{
            currentSkin: import("zod").ZodDefault<import("zod").ZodString>;
            ignoreAllBeatmapSkins: import("zod").ZodDefault<import("zod").ZodBoolean>;
            skinSampleVolume: import("zod").ZodDefault<import("zod").ZodNumber>;
            useDefaultSkinCursor: import("zod").ZodDefault<import("zod").ZodBoolean>;
            cursorExpand: import("zod").ZodDefault<import("zod").ZodBoolean>;
            cursorCenterOnSelection: import("zod").ZodDefault<import("zod").ZodBoolean>;
            alwaysUseDefaultCursor: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Performance: import("zod").ZodObject<{
            frameLimit: import("zod").ZodDefault<import("zod").ZodUnion<readonly [import("zod").ZodLiteral<"unlimited">, import("zod").ZodLiteral<"vsync">, import("zod").ZodNumber]>>;
            compatibilityMode: import("zod").ZodDefault<import("zod").ZodBoolean>;
            reduceDroppedFrames: import("zod").ZodDefault<import("zod").ZodBoolean>;
            detectPerformanceIssues: import("zod").ZodDefault<import("zod").ZodBoolean>;
            lowLatencyAudio: import("zod").ZodDefault<import("zod").ZodBoolean>;
            threadedOptimization: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showFPSCounter: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableGarbageCollection: import("zod").ZodDefault<import("zod").ZodBoolean>;
            memoryOptimization: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Network: import("zod").ZodObject<{
            automaticDownloads: import("zod").ZodDefault<import("zod").ZodBoolean>;
            noVideoDownloads: import("zod").ZodDefault<import("zod").ZodBoolean>;
            preferMirrorServer: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableMultiplayer: import("zod").ZodDefault<import("zod").ZodBoolean>;
            spectatorMode: import("zod").ZodDefault<import("zod").ZodBoolean>;
            autoJoinIRC: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableNotifications: import("zod").ZodDefault<import("zod").ZodBoolean>;
            proxySettings: import("zod").ZodDefault<import("zod").ZodObject<{
                enabled: import("zod").ZodDefault<import("zod").ZodBoolean>;
                host: import("zod").ZodDefault<import("zod").ZodString>;
                port: import("zod").ZodDefault<import("zod").ZodNumber>;
                username: import("zod").ZodDefault<import("zod").ZodString>;
                password: import("zod").ZodDefault<import("zod").ZodString>;
            }, import("zod/v4/core/schemas.cjs").$strip>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Directories: import("zod").ZodObject<{
            chartLibrary: import("zod").ZodDefault<import("zod").ZodString>;
            cache: import("zod").ZodDefault<import("zod").ZodString>;
            logs: import("zod").ZodDefault<import("zod").ZodString>;
            recordings: import("zod").ZodDefault<import("zod").ZodString>;
            replays: import("zod").ZodDefault<import("zod").ZodString>;
            screenshots: import("zod").ZodDefault<import("zod").ZodString>;
            skins: import("zod").ZodDefault<import("zod").ZodString>;
            themes: import("zod").ZodDefault<import("zod").ZodString>;
            temporary: import("zod").ZodDefault<import("zod").ZodString>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Debug: import("zod").ZodObject<{
            enableDebugMode: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showDebugInfo: import("zod").ZodDefault<import("zod").ZodBoolean>;
            logLevel: import("zod").ZodDefault<import("zod").ZodEnum<{
                error: "error";
                debug: "debug";
                info: "info";
                warn: "warn";
            }>>;
            enablePerformanceLogging: import("zod").ZodDefault<import("zod").ZodBoolean>;
            verboseLogging: import("zod").ZodDefault<import("zod").ZodBoolean>;
            saveDebugLogs: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableHotReload: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showPhysicsDebug: import("zod").ZodDefault<import("zod").ZodBoolean>;
            showAudioDebug: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableExperimentalFeatures: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Accessibility: import("zod").ZodObject<{
            enableHighContrast: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableColorBlindSupport: import("zod").ZodDefault<import("zod").ZodBoolean>;
            colorBlindType: import("zod").ZodDefault<import("zod").ZodEnum<{
                none: "none";
                protanopia: "protanopia";
                deuteranopia: "deuteranopia";
                tritanopia: "tritanopia";
            }>>;
            enableScreenReader: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableKeyboardNavigation: import("zod").ZodDefault<import("zod").ZodBoolean>;
            reducedMotion: import("zod").ZodDefault<import("zod").ZodBoolean>;
            largerCursor: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableSoundCues: import("zod").ZodDefault<import("zod").ZodBoolean>;
            enableHapticFeedback: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Import: import("zod").ZodObject<{
            filePath: import("zod").ZodString;
            mergeStrategy: import("zod").ZodDefault<import("zod").ZodEnum<{
                replace: "replace";
                merge: "merge";
                selective: "selective";
            }>>;
            backupCurrent: import("zod").ZodDefault<import("zod").ZodBoolean>;
            validateBeforeImport: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Export: import("zod").ZodObject<{
            filePath: import("zod").ZodOptional<import("zod").ZodString>;
            includeProfile: import("zod").ZodDefault<import("zod").ZodBoolean>;
            includeSettings: import("zod").ZodDefault<import("zod").ZodBoolean>;
            includeKeybindings: import("zod").ZodDefault<import("zod").ZodBoolean>;
            includeDirectories: import("zod").ZodDefault<import("zod").ZodBoolean>;
            format: import("zod").ZodDefault<import("zod").ZodEnum<{
                json: "json";
                yaml: "yaml";
                ini: "ini";
            }>>;
            encrypt: import("zod").ZodDefault<import("zod").ZodBoolean>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly Patch: import("zod").ZodObject<{
            path: import("zod").ZodString;
            value: import("zod").ZodUnknown;
            operation: import("zod").ZodDefault<import("zod").ZodEnum<{
                set: "set";
                merge: "merge";
                delete: "delete";
            }>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
        readonly ValidationResult: import("zod").ZodObject<{
            isValid: import("zod").ZodBoolean;
            errors: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                path: import("zod").ZodString;
                message: import("zod").ZodString;
                code: import("zod").ZodString;
                severity: import("zod").ZodEnum<{
                    error: "error";
                    info: "info";
                    warning: "warning";
                }>;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            migrations: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
                from: import("zod").ZodString;
                to: import("zod").ZodString;
                description: import("zod").ZodString;
                applied: import("zod").ZodBoolean;
            }, import("zod/v4/core/schemas.cjs").$strip>>>;
            warnings: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString>>;
        }, import("zod/v4/core/schemas.cjs").$strict>;
    }>;
};
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
export declare function validateWithSchema<T>(schema: import('zod').ZodSchema<T>, data: unknown): ValidationResult<T>;
//# sourceMappingURL=index.d.ts.map