import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { MovieId, NGram, NGramId, movieIdToName } from '@ghibli-analysis/shared/dist/web';
import { Select, Steps, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Movies from '../lib/data';

interface TableNGram {
	key: string;
	ngram: string;
	occurence: number;
	percentage: string;
}

// TODO: occurence double counts multiple in a review
const columnsNGram: ColumnsType<TableNGram> = [
	{
		title: 'N-Gram',
		dataIndex: 'ngram',
		key: 'ngram',
	},
	{
		title: 'Occurence',
		dataIndex: 'occurence',
		key: 'occurence',
	},
	{
		title: 'Percentage',
		dataIndex: 'percentage',
		key: 'percentage',
	},
];

interface TableReview {
	key: string;
	review: string;
	rating: number;
}

const columnsReviews: ColumnsType<TableReview> = [
	{
		title: 'Rating',
		dataIndex: 'rating',
		key: 'rating',
	},
	{
		title: 'Review',
		dataIndex: 'review',
		key: 'review',
		render: (_, { review }) => <div>{parse(review)}</div>,
	},
];

const NGramExplorer: React.FC = () => {
	const [movieId, setMovieId] = useState<null | MovieId>(null);
	const [ngramId, setNGram] = useState<null | NGramId>(null);
	const [selectedNGram, setSelectedNGram] = useState<null | (TableNGram & { opinion: 'pos' | 'neg' })>(null);

	useEffect(() => {
		setSelectedNGram(null);
	}, [movieId, ngramId]);

	const ngramTableFactory = (id: 'pos' | 'neg', list: NGram[], n: number) => (
		<Table<TableNGram>
			onRow={(row, i) => ({
				onClick: (e) =>
					setSelectedNGram({
						key: row.key,
						ngram: row.ngram,
						occurence: row.occurence,
						percentage: row.percentage,
						opinion: id,
					}),
			})}
			columns={columnsNGram}
			scroll={{ y: 425, scrollToFirstRowOnChange: true }}
			pagination={{ pageSize: 50, hideOnSinglePage: true }}
			dataSource={list.map(({ ngram, occurence }, i) => ({
				key: `${id}-ngram-${i}`,
				ngram,
				occurence,
				percentage: `${((occurence / n) * 100).toFixed(2)}%`,
			}))}
		/>
	);

	let ngrams = <></>;
	let reviews = <></>;
	if (movieId && ngramId) {
		const movie = Movies[movieId];
		const posNGram = movie.positiveNGrams[ngramId];
		const negNGram = movie.negativeNGrams[ngramId];
		const { nPositive, nNegative } = movie.stats;
		ngrams = (
			<div className="flex justify-center gap-4">
				<div>
					<div className="mb-4">Positive: {nPositive}</div>
					{ngramTableFactory('pos', posNGram, nPositive)}
				</div>
				<div>
					<div className="mb-4">Negative: {nNegative}</div>
					{ngramTableFactory('neg', negNGram, nNegative)}
				</div>
			</div>
		);

		if (movieId && ngramId && selectedNGram) {
			const regex = new RegExp(
				`(${selectedNGram.ngram
					.split(' ')
					.map((w) => `${w}(s|['\\w]{0,3})`)
					.join('( \\w* | )')})`,
				'gi',
			);
			reviews = (
				<Table<TableReview>
					columns={columnsReviews}
					// pagination={{ pageSize: 50, hideOnSinglePage: true }}
					dataSource={movie.reviews
						.filter(
							(r) =>
								r.reviewENClean?.includes(selectedNGram.ngram) &&
								((selectedNGram.opinion === 'pos' && r.rating > 3) ||
									(selectedNGram.opinion === 'neg' && r.rating < 3)),
						)
						.map((r, i) => ({
							key: `review-${i}`,
							review: r.reviewEN?.replace(regex, '<span style="color: red;">$1</span>') ?? '',
							rating: r.rating,
						}))}
				/>
			);
		}
	}
	console.log(ngramId);
	console.log(movieId);
	console.log(selectedNGram);
	return (
		<div>
			<div className="flex w-screen">
				<div className="w-1/4 p-8">
					<div className="flex gap-x-2 justify-center">
						<Select
							className="w-3/5"
							value={movieId}
							onChange={(v, opts) => setMovieId(v)}
							options={Object.entries(movieIdToName).map(([id, name]) => ({ value: id, label: name }))}
						/>
						<Select
							className="w-1/5"
							value={ngramId}
							onChange={(v, opts) => setNGram(v)}
							options={[
								{ value: '1', label: '1' },
								{ value: '2', label: '2' },
								{ value: '3', label: '3' },
							]}
						/>
					</div>
					<Steps
						className="mt-6"
						progressDot={true}
						current={selectedNGram === null ? 0 : 1}
						items={[
							{
								title: 'N-Grams',
							},
							{
								title: 'Reviews',
								description: `${selectedNGram?.ngram ?? ''}`,
							},
						]}
					/>
				</div>
				{selectedNGram === null ? (
					<div className="w-1/2">{ngrams}</div>
				) : (
					<div className="w-1/2">{reviews}</div>
				)}
				<div className="w-1/4"></div>
			</div>
		</div>
	);
};

export default NGramExplorer;
