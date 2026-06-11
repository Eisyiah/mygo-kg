export type EntityType = 'character' | 'song' | 'episode' | 'event' | 'radio' | 'interview' | 'live' | 'tag';

export type ContentNodeType = 'document' | 'section' | 'paragraph' | 'sentence';

export type NodeType = EntityType | ContentNodeType;

export type Importance = 'high' | 'medium' | 'low';

export type SourceType = 'official' | 'fan' | 'magazine' | 'radio' | 'staff' | 'va';

export type CharacterGroup = 'mygo' | 'ave-mujica' | 'crychic' | 'morfonica' | 'roselia' | 'pastel-palette' | 'afterglow' | 'poppinparty' | 'other';

export interface Character {
  id: string;
  name: string;
  nameJa?: string;
  aliases: string[];
  description: string;
  group: CharacterGroup;
  voiceActor?: string;
  image?: string;
}

export interface Song {
  id: string;
  title: string;
  titleJa?: string;
  album?: string;
  releaseDate?: string;
  lyricsReference?: string;
  composer?: string;
  lyricist?: string;
  arranger?: string;
  performers: string[];
}

export interface Episode {
  id: string;
  series: 'mygo' | 'ave-mujica';
  number: number;
  title: string;
  titleJa?: string;
  date: string;
  summary?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
  characters?: string[];
  songs?: string[];
}

export interface Radio {
  id: string;
  title: string;
  episodeNumber: number;
  date: string;
  participants: string[];
  summary?: string;
}

export interface Interview {
  id: string;
  title: string;
  date: string;
  participants: string[];
  source?: string;
  url?: string;
}

export interface Live {
  id: string;
  title: string;
  venue: string;
  date: string;
  participants: string[];
  setlist?: string[];
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export type Entity =
  | Character
  | Song
  | Episode
  | Event
  | Radio
  | Interview
  | Live
  | Tag;

export interface DocumentMetadata {
  title: string;
  type: ContentType;
  date?: string;
  characters?: string[];
  songs?: string[];
  events?: string[];
  tags?: string[];
  source?: SourceType;
}

export type ContentType = 'anime-episode' | 'game-story' | 'official-interview' | 'official-radio' | 'official-blog' | 'official-event-report' | 'live-report' | 'magazine-interview' | 'staff-interview' | 'va-interview' | 'official-article' | 'official-publication';

export interface Sentence {
  id: string;
  text: string;
  speaker?: string;
  characters?: string[];
  songs?: string[];
  events?: string[];
  topics?: string[];
  tags?: string[];
  references?: string[];
  importance?: Importance;
}

export interface Paragraph {
  id: string;
  sentences: Sentence[];
  text: string;
  characters?: string[];
  tags?: string[];
}

export interface Section {
  id: string;
  title: string;
  paragraphs: Paragraph[];
}

export interface Document {
  id: string;
  metadata: DocumentMetadata;
  sections: Section[];
  characters: string[];
  songs: string[];
  events: string[];
  tags: string[];
  rawContent: string;
}