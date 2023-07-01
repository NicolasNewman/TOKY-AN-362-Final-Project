import { Review } from '@ghibli-analysis/shared';
import { ColumnsType } from 'antd/es/table';
import { Table } from 'antd';
import parse from 'html-react-parser';
import { StopOutlined } from '@ant-design/icons';

interface IProps {
	reviews: Review[];
	keywords: string[];
	close: () => void;
	polarity?: 'pos' | 'neg';
}

interface TableReview {
	key: string;
	review: string;
	rating: number;
}

const columnsReview: ColumnsType<TableReview> = [
	{
		title: 'Review',
		dataIndex: 'review',
		key: 'review',
		render: (_, { review }) => <div>{parse(review)}</div>,
	},
	{
		title: 'Rating',
		dataIndex: 'rating',
		key: 'rating',
	},
];

const ReviewList: React.FC<IProps> = ({ reviews, keywords, polarity, close }) => {
	const set: TableReview[] = [];
	let i = 0;
	for (const review of reviews) {
		const { reviewEN } = review;
		if (reviewEN) {
			let match = false;
			const en = reviewEN
				.split(/!|\.|\?/g)
				.map((r) => {
					if (r.includes(keywords[0]) && r.includes(keywords[1])) {
						match = true;
						return r
							.replaceAll(keywords[0], `<span style="color: red;">${keywords[0]}</span>`)
							.replaceAll(keywords[1], `<span style="color: red;">${keywords[1]}</span>`);
					}
					return r;
				})
				.join('. ');
			if (match) {
				const a = polarity === 'pos' && review.rating > 3;
				const b = polarity === 'neg' && review.rating < 3;
				if (a || b || polarity === undefined) {
					set.push({
						key: `review-${++i}`,
						review: en,
						rating: review.rating,
					});
				}
			}
		}
	}

	return (
		<div className="fixed w-screen h-screen top-0 left-0">
			<div className="relative w-screen h-screen">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5/6 overflow-y-scroll">
					<div className="relative">
						<StopOutlined
							className="absolute z-10 top-1 right-1 text-red-500 hover:text-red-900 !cursor-pointer ml-2"
							onClick={close}
						/>
						<Table<TableReview> columns={columnsReview} dataSource={set} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReviewList;
