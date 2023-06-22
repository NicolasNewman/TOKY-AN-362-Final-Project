import { createHashRouter } from 'react-router-dom';
import Root from './pages/Root';
import Home from './pages/Home';
import Testing from './pages/Testing';
import NGramExplorer from './pages/NGramExplorer';
import Overview from './pages/Overview';
import HotwordExplorer from './pages/HotwordExploer';

export default createHashRouter([
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
				path: 'hotwords',
				element: <HotwordExplorer />,
			},
			{
				path: 'testing',
				element: <Testing />,
			},
		],
	},
]);
