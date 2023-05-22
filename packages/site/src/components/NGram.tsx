import React, { useState } from 'react';
import { MovieId, NGramId, data, movieIdToName } from '@ghibli-analysis/shared/dist/web';
import { Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface TableNGram {
	key: string;
	ngram: string;
	occurence: string;
	percentage: string;
}

interface TableReview {
	key: string;
	review: string;
}

const NGram: React.FC = ({}) => {
	const [movieId, setMovieId] = useState<null | MovieId>(null);
	const [ngramId, setNGram] = useState<null | NGramId>(null);
	const [selectedNGram, setSelectedNGram] = useState<null | string>(null);

	let ngrams = <></>;
	let reviews = <></>;
	if (movieId && ngramId) {
		const movie = data[movieId];
		const posNGram = movie.positiveNGrams[ngramId];
		const negNGram = movie.negativeNGrams[ngramId];
		const { nPositive, nNegative } = movie.stats;
		ngrams = (
			<div className="flex justify-center gap-4 mt-4">
				<div>
					<div>Positive: {nPositive}</div>
					{posNGram.map((ng) => (
						<div className="flex justify-between" onClick={() => setSelectedNGram(ng.ngram)}>
							<span>{ng.ngram}</span>
							<span>
								{ng.occurence} ({((ng.occurence / nPositive) * 100).toFixed(2) + '%'})
							</span>
						</div>
					))}
				</div>
				<div>
					<div>Negative: {nNegative}</div>
					{negNGram.map((ng) => (
						<div className="flex justify-between" onClick={() => setSelectedNGram(ng.ngram)}>
							<span>{ng.ngram}</span>
							<span>
								{ng.occurence} ({((ng.occurence / nNegative) * 100).toFixed(2) + '%'})
							</span>
						</div>
					))}
				</div>
			</div>
		);

		if (movieId && ngramId && selectedNGram) {
			reviews = (
				<div>
					{movie.reviews
						.filter((m) => m.reviewENClean?.includes(selectedNGram))
						.map((m) => (
							<div className="mb-2">{m.reviewEN}</div>
						))}
				</div>
			);
		}
	}

	return (
		<div>
			<Select
				className="w-[12rem]"
				onChange={(v, opts) => setMovieId(v)}
				options={Object.entries(movieIdToName).map(([id, name]) => ({ value: id, label: name }))}
			/>
			<Select
				className="w-16"
				onChange={(v, opts) => setNGram(v)}
				options={[
					{ value: '1', label: '1' },
					{ value: '2', label: '2' },
					{ value: '3', label: '3' },
				]}
			/>
			<div className="flex max-h-full">
				{ngrams}
				{reviews}
			</div>
		</div>
	);
};

export default NGram;
