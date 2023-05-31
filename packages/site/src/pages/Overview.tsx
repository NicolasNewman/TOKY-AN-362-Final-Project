import { Movie } from '@ghibli-analysis/shared/dist/web';
import { Select } from 'antd';
import { useState } from 'react';
import { BaseOptionType } from 'antd/es/select';
import MovieAnalysis from '../components/MovieAnalysis';
import Movies from '../lib/data';
import MovieDisplay from '../components/MovieDisplay';

type OrderValue = 'asc' | 'dec';
interface OrderOptionType extends BaseOptionType {
	label: string;
	value: OrderValue;
}

type SortValue = 'reviews' | 'average' | 'dor';
interface SortOptionType extends BaseOptionType {
	label: string;
	value: SortValue;
}

const Overview: React.FC = () => {
	const movies = Object.values(Movies);
	const [aMovie, setAMovie] = useState<Movie | null>(null);
	const [orderValue, setOrderValue] = useState<OrderValue>('dec');
	const [sortValue, setSortValue] = useState<SortValue>('average');
	return (
		<div>
			<div className="mb-4 flex gap-x-2 justify-center">
				Sort:
				<Select<any, OrderOptionType>
					className="w-28"
					options={[
						{ label: 'Ascending', value: 'asc' },
						{ label: 'Decending', value: 'dec' },
					]}
					onChange={(v, _) => setOrderValue(v)}
					value={orderValue}
				/>
				<Select<any, SortOptionType>
					className="w-28"
					options={[
						{ label: 'Reviews', value: 'reviews' },
						{ label: 'Average', value: 'average' },
						{ label: 'Release Year', value: 'dor' },
					]}
					onChange={(v, _) => setSortValue(v)}
					value={sortValue}
				/>
			</div>
			<div className="flex">
				{aMovie ? (
					<div className="w-1/2 relative">
						<MovieAnalysis movie={aMovie} />
					</div>
				) : (
					<></>
				)}
				<div
					className={`px-4 pb-4 grid grid-cols-2 gap-y-4 gap-x-5 ${
						aMovie ? 'w-1/2 grid-cols-1 md:grid-cols-2' : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
					}`}
				>
					{movies
						.sort((a, b) => {
							const [av, bv] = (() => {
								switch (sortValue) {
									case 'dor':
										return [a['dor'], b['dor']];
									case 'reviews':
									case 'average':
										const statKey: keyof (typeof a)['stats'] =
											sortValue === 'average' ? 'avg' : 'n';
										return [a['stats'][statKey], b['stats'][statKey]];
								}
							})();
							return orderValue === 'asc' ? av - bv : bv - av;
						})
						.map((movie) => (
							<div key={movie.movieId} className="cursor-pointer" onClick={() => setAMovie(movie)}>
								<MovieDisplay movie={movie} />
							</div>
						))}
				</div>
			</div>
		</div>
	);
};

export default Overview;
