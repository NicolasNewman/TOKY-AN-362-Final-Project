import React from 'react';
import SubsetNetwork from '../components/Charts/SubsetNetwork';
import Movies from '../lib/data';
import { Movie, movieIdToName } from '@ghibli-analysis/shared/dist/web';

interface RowProps {
	movie: Movie;
	posFilter: string[];
	minPosLinkWeight?: number;
	posNotes?: string[];
	negFilter: string[];
	minNegLinkWeight?: number;
	negNotes?: string[];
}

const Row: React.FC<RowProps> = ({
	movie,
	posFilter,
	negFilter,
	minPosLinkWeight = 1,
	minNegLinkWeight = 1,
	posNotes = [],
	negNotes = [],
}) => {
	return (
		<div>
			<div className="text-xl">
				{movieIdToName[movie.movieId]} ({movie.stats.avg})
			</div>
			<div className="flex h-[624px]">
				<div className="w-[50%]">
					<div>Positive reviews: {movie.stats.nPositive}</div>
					<ul className="max-w-xl mx-auto !list-disc text-left mt-2">
						{posNotes.map((note) => (
							<li className="mb-1">{note}</li>
						))}
					</ul>
					<SubsetNetwork
						network={movie.positiveHotwords}
						filter={posFilter}
						minLinkWeight={minPosLinkWeight}
					/>
				</div>
				<div className="w-[50%]">
					<div>Negative reviews: {movie.stats.nNegative}</div>
					<ul className="max-w-xl mx-auto !list-disc text-left mt-2">
						{negNotes.map((note) => (
							<li className="mb-1">{note}</li>
						))}
					</ul>
					<SubsetNetwork
						network={movie.negativeHotwords}
						filter={negFilter}
						minLinkWeight={minNegLinkWeight}
					/>
				</div>
			</div>
		</div>
	);
};

// TODO NETWORK USING WRONG MAX SIZE
const Conclusion: React.FC = () => {
	return (
		<div className="flex flex-col w-[100vw] min-h-screen">
			<Row
				movie={Movies['89972']}
				posFilter={['elementary', 'world', 'music', 'understand', 'magic', 'original', 'cute']}
				negFilter={['shallow']}
				posNotes={['Nostalgic about having watched the film in elementary school']}
				minPosLinkWeight={3}
			/>
			<Row
				movie={Movies['149868']}
				posFilter={['elementary', 'understand', 'famous', 'story', 'character', 'music']}
				negFilter={['shallow']}
				posNotes={['Nostalgic about having watched the film in elementary school']}
				minPosLinkWeight={8}
			/>
			<Row
				movie={Movies['163027']}
				posFilter={['elementary', 'high', 'understand', 'story', 'unique', 'world']}
				negFilter={['force', 'second', 'understand']}
				posNotes={['Nostalgic about having watched the film in elementary school']}
				negNotes={['Forced labour']}
				minPosLinkWeight={8}
			/>
			<Row
				movie={Movies['335800']}
				posFilter={['happy', 'beautiful', 'sound', 'perspective', 'world', 'actor']}
				negFilter={['boring', 'second', 'uncomfortable', 'work', 'understand', 'actor']}
				posNotes={[
					'Happy ending',
					'Good voice actors',
					'Unique perspective of the world',
					'Good sound effects',
				]}
				negNotes={['Borrowers were stealing, bad influence on children', 'Pacing in the 2nd half was rushed']}
				minPosLinkWeight={6}
				minNegLinkWeight={2}
			/>
			<Row
				movie={Movies['327529']}
				posFilter={['cute', 'happy', 'strong', 'understand']}
				negFilter={['half', 'difficult', 'uncomfortable', 'sick', 'actor', 'common', 'previous']}
				posNotes={['Happy ending', 'Cute characters', 'Easy to understand']}
				negNotes={[
					'Aired on national TV a few months after 2011 Tsunami',
					'Bad voice actor',
					'Children calling parents and adults by their first name',
					'Poor parenting choices of the adults',
				]}
				minPosLinkWeight={10}
				minNegLinkWeight={6}
			/>
			<Row
				movie={Movies['240799']}
				posFilter={['happy', 'howl', 'sophie', 'unique', 'quality', 'music', 'atmosphere']}
				negFilter={[
					'voice',
					'actor',
					'second',
					'difficult',
					'war',
					'howl',
					'boring',
					'character',
					'understand',
					'past',
				]}
				posNotes={['Unique atmosphere and characters', 'Happy ending', 'Good music']}
				negNotes={[
					'Difficult to understand',
					'Bad voice actor',
					"Disliked Howl's character",
					'War was pointless and poorly explained',
				]}
				minPosLinkWeight={3}
				minNegLinkWeight={2}
			/>
			{/* <Row
				movie={Movies['240799']}
				posFilter={[]}
				negFilter={[]}
				minPosLinkWeight={0}
				minNegLinkWeight={0}
			/> */}
		</div>
		// <div className="text-left mx-[20%]">
		// 	<div className="text-3xl mt-4 mb-2 text-center">Analysis Techniques</div>
		// 	<div className="flex flex-col gap-y-4">
		// 		<div>
		// 			To answer the question proposed earlier, a subjective way is needed to identify similar points
		// 			between positive and negative reviews. Two techniques to achieve this are NGRAM Analysis and Word
		// 			Networks. While both techniques aim to solve the problem of identifying common phrases between
		// 			groups of text, they achieve this using different techniques.
		// 		</div>
		// 		<div>
		// 			Before either of these techniques can be used, the reviews first need to be sorted by sentiment.
		// 			Luckily, that field is already provided since the source data is reviews with an associated rating
		// 			on a scale of [1,5]. Since a rating of "3" doesn't clearly indicate a strong or negative perception
		// 			of a movie, these reviews were not included in the analysis.
		// 		</div>
		// 	</div>
		// 	<div className="text-2xl mt-3 mb-2 text-center">N-GRAM Analysis</div>
		// 	<div className="flex flex-col gap-y-4">
		// 		<div>
		// 			An N-GRAM is a consecutive sequence of words where N indicates the number of words used. To achieve
		// 			the best results, stopwords are removed and words should be in their lemmatized form
		// 		</div>
		// 		<div>
		// 			The main drawback of using N-GRAM Analysis for finding key points in reviews is that similar points
		// 			can be made by different phrasing. For example, the 3-Grams of negative reviews
		// 		</div>
		// 	</div>
		// 	<div className="text-2xl mt-3 mb-2 text-center">Wordnet</div>
		// 	<div className="flex flex-col gap-y-4">
		// 		<div>
		// 			A Word Network (WordNet henceforth) can be thought of as a graph where each Node is a word and each
		// 			Edge is a relation between two words. Each node additionally contained the polarity associated with
		// 			that word.
		// 		</div>
		// 	</div>
		// </div>
	);
};

export default Conclusion;
