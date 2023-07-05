import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Route from '../components/Route';

const Root: React.FC = () => {
	const loc = useLocation();
	const nav = useNavigate();
	useEffect(() => {
		if (loc.pathname === '/') {
			nav('/home');
		}
	}, [loc.pathname, nav]);
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
					<Route name="N-Grams" path="/ngrams" />
					<Route name="WordNet" path="/hotwords" />
					<Route name="Visualizations" path="/testing" />
					<Route name="Conclusion" path="/conclusion" />
				</div>
			</div>
			<div className="mt-10">
				<Outlet />
			</div>
		</div>
	);
};

export default Root;
