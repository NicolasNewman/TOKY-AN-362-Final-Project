import { Data, movieIdToName } from '@ghibli-analysis/shared/dist/web';
import React, { ReactElement, ReactNode } from 'react';
import { round } from '../lib/math';
import { Card } from 'antd';
import { posters } from '../assets';
import { StarOutlined } from '@ant-design/icons';
import Stat from './Stat';

interface IProps {
	movie: Data;
}

const Movie: React.FC<IProps> = ({ movie }) => {
	const movieName = movieIdToName[movie.movieId];
	const { n, avg, nPositive, nNegative, nMixed, avgStrong } = movie.stats;
	return (
		<Card className="h-fit" title={movieName}>
			<div className="flex">
				<img className="h-[128px]" src={posters[movie.movieId]} alt={movieIdToName[movie.movieId]} />
				<div className="flex flex-col p-2 w-full">
					<Stat k="Reviews" v={n} />
					<Stat
						k="Average"
						v={
							<span>
								{avg} <StarOutlined />
							</span>
						}
					/>
					<Stat
						k={
							<span>
								4-5 <StarOutlined />
							</span>
						}
						v={`${nPositive} (${round((nPositive / n) * 100, 1)}%)`}
					/>
					<Stat
						k={
							<span>
								1-2 <StarOutlined />
							</span>
						}
						v={`${nNegative} (${round((nNegative / n) * 100, 1)}%)`}
					/>
					<Stat
						k={
							<span>
								3 <StarOutlined />
							</span>
						}
						v={`${nMixed} (${round((nMixed / n) * 100, 1)}%)`}
					/>
				</div>
			</div>
		</Card>
	);
};

export default Movie;
