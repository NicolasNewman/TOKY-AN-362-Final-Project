import { createBrowserRouter } from 'react-router-dom';
import Root from './pages/Root';
import Home from './pages/Home';
import Testing from './pages/Testing';
import NGramExplorer from './pages/NGramExplorer';
import Overview from './pages/Overview';

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
				path: 'overview',
				element: <Overview />,
			},
			{
				path: 'ngrams',
				element: <NGramExplorer />,
			},
			{
				path: 'testing',
				element: <Testing />,
			},
		],
	},
]);
