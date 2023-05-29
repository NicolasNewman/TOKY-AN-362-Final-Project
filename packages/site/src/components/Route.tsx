import { Link, useLocation } from 'react-router-dom';

interface IProps {
	path: string;
	name: string;
}

const Route: React.FC<IProps> = ({ name, path }) => {
	const loc = useLocation();
	return (
		<Link
			className={`text-xl mx-2 pb-1 hover:text-blue-500 ${
				loc.pathname === path ? 'border-b-2 hover:border-b-blue-500' : ''
			}`}
			to={path}
		>
			{name}{' '}
		</Link>
	);
};

export default Route;
