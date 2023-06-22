import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Route from '../components/Route';

const Root: React.FC = () => {
	const loc = useLocation();
	if (loc.pathname === '/hotwords') {
		return (
			<div className="relative bg-slate-900 min-h-screen min-w-fit">
				<Outlet />
			</div>
		);
	}
	return (
		<div className="w-screen min-h-screen bg-slate-900">
			<div className="pt-4">
				<div className="text-5xl">Ghibli Analysis</div>
				<div className="mt-4 flex justify-center">
					<Route name="Home" path="/home" />
					<Route name="Overview" path="/overview" />
					<Route name="NGrams" path="/ngrams" />
					<Route name="Hotwords" path="/hotwords" />
					<Route name="Testing" path="/testing" />
				</div>
			</div>
			<div className="mt-10">
				<Outlet />
			</div>
		</div>
	);
};

export default Root;
