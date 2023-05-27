import React from 'react';
import logo from './logo.svg';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { ConfigProvider, theme } from 'antd';

function App() {
	return (
		<div className="App">
			<ConfigProvider
				theme={{
					algorithm: theme.darkAlgorithm,
				}}
			>
				<RouterProvider router={router} />
			</ConfigProvider>
		</div>
	);
}

export default App;
