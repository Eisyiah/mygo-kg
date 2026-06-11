import { defineCollection, z } from 'astro:content';

const characters = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    nameJa: z.string().optional(),
    aliases: z.array(z.string()).default([]),
    description: z.string(),
    group: z.enum(['mygo', 'ave-mujica', 'crychic', 'morfonica', 'roselia', 'pastel-palette', 'afterglow', 'poppinparty', 'other']),
    voiceActor: z.string().optional(),
    image: z.string().optional(),
  }),
});

const songs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleJa: z.string().optional(),
    album: z.string().optional(),
    releaseDate: z.string().optional(),
    lyricsReference: z.string().optional(),
    composer: z.string().optional(),
    lyricist: z.string().optional(),
    arranger: z.string().optional(),
    performers: z.array(z.string()).default([]),
  }),
});

const episodes = defineCollection({
  type: 'content',
  schema: z.object({
    series: z.enum(['mygo', 'ave-mujica']),
    number: z.number(),
    title: z.string(),
    titleJa: z.string().optional(),
    date: z.string(),
    summary: z.string().optional(),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    characters: z.array(z.string()).default([]),
    songs: z.array(z.string()).default([]),
  }),
});

const radio = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    episodeNumber: z.number(),
    date: z.string(),
    participants: z.array(z.string()).default([]),
    summary: z.string().optional(),
  }),
});

const interviews = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    participants: z.array(z.string()).default([]),
    source: z.string().optional(),
    url: z.string().optional(),
  }),
});

const lives = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    date: z.string(),
    participants: z.array(z.string()).default([]),
    setlist: z.array(z.string()).default([]),
  }),
});

const tags = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string(),
  }),
});

const documents = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum([
      'anime-episode',
      'game-story',
      'official-interview',
      'official-radio',
      'official-blog',
      'official-event-report',
      'live-report',
      'magazine-interview',
      'staff-interview',
      'va-interview',
      'official-article',
      'official-publication',
    ]),
    date: z.string().optional(),
    characters: z.array(z.string()).default([]),
    songs: z.array(z.string()).default([]),
    events: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    source: z.enum(['official', 'fan', 'magazine', 'radio', 'staff', 'va']).optional(),
  }),
});

export const collections = {
  characters,
  songs,
  episodes,
  events,
  radio,
  interviews,
  lives,
  tags,
  documents,
};