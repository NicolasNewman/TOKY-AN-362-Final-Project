import { data } from '@ghibli-analysis/shared/dist/web';
import Movie from '../components/Movie';

const Overview: React.FC = () => {
	const movies = Object.values(data);
	return (
		<div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-4 gap-x-5">
			{movies.map((movie) => (
				<Movie movie={movie} />
			))}
		</div>
	);
};

export default Overview;
