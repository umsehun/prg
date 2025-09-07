import { Chart, ChartNoteData } from '../../shared/types';

class SmParser {
  public parse(smFileContent: string): Chart | null {
    const sections = smFileContent.split(';').map(s => s.trim()).filter(s => s.length > 0);

    const metadata: { [key: string]: string } = {};
    let notesSection = '';

    sections.forEach(section => {
      if (section.startsWith('#NOTES')) {
        notesSection = section;
      } else if (section.startsWith('#')) {
        const match = section.match(/#([^:]+):([^;]*)/);
        if (match && match[1]) {
          metadata[match[1]] = match[2] || '';
        }
      }
    });

    if (!notesSection) {
      return null;
    }

    const bpms = this.parseBPMs(metadata.BPMS ?? '');
    const offset = parseFloat(metadata.OFFSET || '0');

    const noteData = this.parseNotes(notesSection);
    if (!noteData) return null;

    const chart: Chart = {
      title: metadata.TITLE || '',
      artist: metadata.ARTIST || '',
      banner: metadata.BANNER || '',
      background: metadata.BACKGROUND || '',
      cdtitle: metadata.CDTITLE || '',
      music: metadata.MUSIC || '',
      offset: offset,
      sampleStart: parseFloat(metadata.SAMPLESTART || '0'),
      sampleLength: parseFloat(metadata.SAMPLELENGTH || '0'),
      displayBPM: metadata.DISPLAYBPM || '',
      bpms: bpms,
      notes: [noteData],
    };

    return chart;
  }

  private parseBPMs(bpmsString: string): { beat: number; bpm: number }[] {
    if (!bpmsString) return [];
    return bpmsString.split(',').map(part => {
      const [beatStr, bpmStr] = part.split('=');
      return { beat: parseFloat(beatStr ?? '0'), bpm: parseFloat(bpmStr ?? '120') };
    });
  }

  private parseNotes(notesSection: string): ChartNoteData | null {
    const noteParts = notesSection.split(':').map(s => s.trim());

    const type = noteParts[1];
    const difficulty = noteParts[2];
    const levelStr = noteParts[3];
    const measuresStr = noteParts[5];

    if (!type || !difficulty || !levelStr || !measuresStr) {
      return null;
    }

    return {
      type,
      difficulty,
      level: parseInt(levelStr, 10),
      measures: measuresStr.split(',').map(m => m.trim()),
    };
  }
}

export default new SmParser();
