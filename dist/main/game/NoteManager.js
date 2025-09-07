"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NoteManager {
    constructor() {
        Object.defineProperty(this, "notes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    static getInstance() {
        if (!NoteManager.instance) {
            NoteManager.instance = new NoteManager();
        }
        return NoteManager.instance;
    }
    loadNotes(notes) {
        this.notes = notes.sort((a, b) => a.time - b.time);
    }
    getNotes() {
        return this.notes;
    }
    getActiveNotes(currentTime, window) {
        return this.notes.filter((note) => !note.isHit &&
            note.time >= currentTime - window &&
            note.time <= currentTime + window);
    }
    updateNote(noteToUpdate) {
        const index = this.notes.findIndex((note) => note.time === noteToUpdate.time &&
            note.type === noteToUpdate.type);
        if (index !== -1) {
            this.notes[index] = noteToUpdate;
        }
    }
    reset() {
        this.notes = [];
    }
}
exports.default = NoteManager.getInstance();
