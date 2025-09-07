import { Note } from '../../shared/types';
declare class NoteManager {
    private static instance;
    private notes;
    private constructor();
    static getInstance(): NoteManager;
    loadNotes(notes: Note[]): void;
    getNotes(): Note[];
    getActiveNotes(currentTime: number, window: number): Note[];
    updateNote(noteToUpdate: Note): void;
    reset(): void;
}
declare const _default: NoteManager;
export default _default;
//# sourceMappingURL=NoteManager.d.ts.map