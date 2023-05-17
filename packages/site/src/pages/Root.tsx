import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Root: React.FC = ({}) => {
	const loc = useLocation();
	return (
		<div className="w-screen min-h-screen bg-slate-900">
			<div className="pt-4">
				<div className="text-5xl">Ghibli Analysis</div>
				<div className="mt-4 flex justify-center">
					<Link
						className={`text-xl mx-2 pb-1 hover:text-blue-500 ${
							loc.pathname === '/home' ? 'border-b-2 hover:border-b-blue-500' : ''
						}`}
						to={'/home'}
					>
						Home{' '}
					</Link>
					<Link
						className={`text-xl mx-2 pb-1 hover:text-blue-500 ${
							loc.pathname === '/testing' ? 'border-b-2 hover:border-b-blue-500' : ''
						}`}
						to={'/testing'}
					>
						Testing{' '}
					</Link>
				</div>
			</div>
			<div className="mt-10">
				<Outlet />
			</div>
		</div>
	);
};

export default Root;
