// src/main/game/NoteManager.ts
import { Note } from '../../shared/types';

class NoteManager {
  private static instance: NoteManager;
  private notes: Note[] = [];

  private constructor() {}

  public static getInstance(): NoteManager {
    if (!NoteManager.instance) {
      NoteManager.instance = new NoteManager();
    }
    return NoteManager.instance;
  }

  public loadNotes(notes: Note[]) {
    this.notes = notes.sort((a, b) => a.time - b.time);
  }

  public getNotes(): Note[] {
    return this.notes;
  }

  public getActiveNotes(currentTime: number, window: number): Note[] {
    return this.notes.filter(
      (note) =>
        !note.isHit &&
        note.time >= currentTime - window &&
        note.time <= currentTime + window
    );
  }

  public updateNote(noteToUpdate: Note) {
    const index = this.notes.findIndex((note) => 
      note.time === noteToUpdate.time && 
      note.type === noteToUpdate.type
    );
    if (index !== -1) {
      this.notes[index] = noteToUpdate;
    }
  }

  public reset() {
    this.notes = [];
  }
}

export default NoteManager.getInstance();
