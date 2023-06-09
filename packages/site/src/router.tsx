import { createHashRouter } from 'react-router-dom';
import Root from './pages/Root';
import Testing from './pages/Testing';
import NGramExplorer from './pages/NGramExplorer';
import Overview from './pages/Overview';
import HotwordExplorer from './pages/HotwordExploer';
import Methodology from './pages/Methodology';
import Conclusion from './pages/Conclusion';

export default createHashRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				path: 'home',
				element: <Methodology />,
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
				path: 'conclusion',
				element: <Conclusion />,
			},
			{
				path: 'testing',
				element: <Testing />,
			},
		],
	},
]);
