import { createBrowserRouter } from 'react-router-dom';
import Root from './pages/Root';
import Home from './pages/Home';
import Testing from './pages/Testing';

export default createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				path: 'home',
				element: <Home />,
			},
			{
				path: 'testing',
				element: <Testing />,
			},
		],
	},
]);
