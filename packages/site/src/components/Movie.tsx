import { Data, movieIdToName } from '@ghibli-analysis/shared/dist/web';
import React from 'react';
import { round } from '../lib/math';
import { Card } from 'antd';

interface IProps {
	movie: Data;
}

const Movie: React.FC<IProps> = ({ movie }) => {
	const movieName = movieIdToName[movie.movieId];
	const { n, avg, nPositive, nNegative, nMixed, avgStrong } = movie.stats;
	return (
		<Card title={movieName}>
			<div className="flex flex-col">
				<div>Reviews: {n}</div>
				<div>Average: {avg}</div>
				<div>Strong Average: {avgStrong}</div>
				<div>
					Positive: {nPositive} ({round((nPositive / n) * 100, 2)}%)
				</div>
				<div>
					Negative: {nNegative} ({round((nNegative / n) * 100, 2)}%)
				</div>
				<div>
					Mixed: {nMixed} ({round((nMixed / n) * 100, 2)}%)
				</div>
			</div>
		</Card>
	);
};

export default Movie;
