import { Data } from '@ghibli-analysis/shared/dist/web';
import React from 'react';
import Movie from './Movie';
import { getEntries } from '../lib/object';
import { ResponsiveBar } from '@nivo/bar';

interface IProps {
	movie: Data;
}

const MovieAnalysis: React.FC<IProps> = ({ movie }) => {
	const data = getEntries(movie.reviewByYears).map(([year, reviews]) => ({
		year,
		Positive: reviews.filter((r) => r.rating > 3).length,
		PositiveColor: '#0f0',
		Negative: reviews.filter((r) => r.rating < 3).length,
		NegativeColor: '#f00',
	}));

	return (
		<div className="h-full flex flex-col items-center w-full  top-20">
			<div className="w-1/2">
				<Movie movie={movie} />
			</div>
			<div className="mt-4 h-[250px] w-full">
				<div>Positive v. Negative Movie Reviews by Year</div>
				<ResponsiveBar
					data={data}
					keys={['Positive', 'Negative']}
					indexBy="year"
					margin={{
						top: 10,
						right: 80,
						bottom: 20,
						left: 60,
					}}
					legends={[
						{
							anchor: 'top-right',
							itemWidth: -10,
							itemHeight: 20,
							dataFrom: 'keys',
							direction: 'column',
							itemTextColor: '#fff',
						},
					]}
					colors={({ id, data }) => data[`${id}Color` as keyof typeof data] as string}
					groupMode="grouped"
					theme={{ tooltip: { basic: { color: '#000' } }, axis: { ticks: { text: { fill: '#fff' } } } }}
				/>
			</div>
		</div>
	);
};

export default MovieAnalysis;
