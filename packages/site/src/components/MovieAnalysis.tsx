import { Movie } from '@ghibli-analysis/shared/dist/web';
import React from 'react';
import MovieDisplay from './MovieDisplay';
import { getEntries } from '../lib/object';
import { ResponsiveBar } from '@nivo/bar';
//@ts-ignore
import { ResponsiveBoxPlot } from '@nivo/boxplot';
import Stat from './Stat';
import { ResponsiveNetwork } from '@nivo/network';

interface IProps {
	movie: Movie;
}

const MovieAnalysis: React.FC<IProps> = ({ movie }) => {
	const barData = getEntries(movie.reviewByYears).map(([year, reviews]) => ({
		year,
		Positive: reviews.filter((r) => r.rating > 3).length,
		PositiveColor: '#0f0',
		Negative: reviews.filter((r) => r.rating < 3).length,
		NegativeColor: '#f00',
	}));
	const boxplotData = [
		...movie.positive.map((r) => ({
			group: 'Positive',
			value: r.reviewEN?.length ?? 0,
			n: movie.positive.length,
		})),
		...movie.negative.map((r) => ({
			group: 'Negative',
			value: r.reviewEN?.length ?? 0,
			n: movie.negative.length,
		})),
	];

	return (
		<div className="h-full flex flex-col items-center w-full top-20">
			{/* <div className="h-full flex flex-col items-center w-[inherit] fixed top-20"> */}
			<div className="w-1/2">
				<MovieDisplay movie={movie} />
			</div>
			<div className="mt-4 h-[250px] w-full">
				<div>Positive v. Negative Movie Reviews by Year</div>
				<ResponsiveBar
					data={barData}
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
					tooltip={(props) => {
						const reviews = movie.reviewByYears[props.data.year];
						const monthData = new Array(12).fill(0).map((i) => ({ cnt: 0, name: '' }));
						reviews.forEach((review) => {
							const monthId = new Date(review.publishDate).getMonth();
							monthData[monthId].cnt++;
							monthData[monthId].name = new Date(review.publishDate).toLocaleString('en-US', {
								month: 'short',
							});
						});
						return (
							<div className="p-4 bg-black">
								<div className="mb-2 border-b-white border-b">{props.data.year} reviews by month</div>
								<div className="grid grid-cols-2 grid-rows-6 grid-flow-col">
									{monthData.map((data) =>
										data.name !== '' ? <Stat k={data.name} v={data.cnt} /> : <div></div>,
									)}
								</div>
							</div>
						);
					}}
					colors={({ id, data }) => data[`${id}Color` as keyof typeof data] as string}
					groupMode="grouped"
					theme={{ tooltip: { basic: { color: '#000' } }, axis: { ticks: { text: { fill: '#fff' } } } }}
				/>
				<div className="my-2">Review Length by Strongness</div>

				<ResponsiveBoxPlot
					data={boxplotData}
					layout="horizontal"
					whiskerWidith={1}
					whiskerEndSize={0.6}
					colors={(obj: any) => (obj.group === 'Positive' ? '#0f0' : '#f00')}
					margin={{ top: 10, right: 140, bottom: 20, left: 60 }}
					theme={{
						tooltip: { basic: { color: '#000' }, container: { color: '#000' } },
						axis: { ticks: { text: { fill: '#fff' } } },
					}}
				/>

				<ResponsiveNetwork
					data={movie.negativeHotwords}
					nodeSize={(n) => n.weight}
					repulsivity={6}
					nodeColor={(n) => {
						const num = Math.ceil(Math.abs(n.polarity * 255));
						return `rgb(${num},${num},${num})`;
					}}
				/>
			</div>
		</div>
	);
};

export default MovieAnalysis;
