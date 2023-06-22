import dev from '../data/data.dev';
import prod from '../data/data.prod';

const Movies = await (async () => {
	if (process.env.NODE_ENV === 'development') {
		return dev();
	} else {
		return await prod();
	}
})();

export default Movies;
