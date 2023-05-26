import { data } from '@ghibli-analysis/shared/dist/web';
import Movie from '../components/Movie';
import { Col, Row } from 'antd';

const Overview: React.FC = () => {
	const movies = Object.values(data);
	return (
		<div className="px-4">
			<Row gutter={16}>
				{movies.map((movie) => (
					<Col span={4}>
						<Movie movie={movie} />
					</Col>
				))}
			</Row>
		</div>
	);
};

export default Overview;
