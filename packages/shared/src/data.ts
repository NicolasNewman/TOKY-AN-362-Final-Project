/* eslint-disable quotes */
/* eslint-disable max-len */
import { Data, Review } from './types';

export type MovieId =
	| 163027
	| 159561
	| 327529
	| 335800
	| 240799
	| 149868
	| 89778
	| 148901
	| 150435
	| 89972
	| 150436
	| 152271
	| 151441
	| 161722
	| 344584;
export const movieIdToName: { [key in MovieId]: string } = {
	163027: 'Spirited Away',
	159561: 'Princess Mononoke',
	327529: 'Ponyo',
	335800: 'Secret World of Arrietty',
	240799: "Howl's Moving Castle",
	150435: 'My Neighbor Totoro',
	89972: "Kiki's Deliver Service",
	149868: 'Laputa: Castle in the Sky',
	89778: 'Whisper of the Heart',
	148901: 'Nausicaa of the Valley of the Wind',
	150436: 'Grave of the Fireflies',
	152271: 'Pom Poko',
	344584: 'The Wind Rises',
	151441: 'Only Yesterday',
	161722: 'My Neighbors the Yamadas',
};
export const movieIdToIdentifier: { [key in MovieId]: string } = {
	163027: 'spirited away',
	159561: 'mononoke',
	327529: 'ponyo',
	335800: 'arrietty',
	240799: 'howl',
	150435: 'totoro',
	89972: 'kiki',
	149868: 'laputa',
	89778: 'whisper',
	148901: 'nausicaa',
	150436: 'grave of the fireflies',
	152271: 'pom poko',
	344584: 'wind rises',
	151441: 'only yesterday',
	161722: 'yamadas',
};
