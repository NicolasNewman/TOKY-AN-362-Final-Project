import React, { useRef, useState } from 'react';
import { MovieId, movieIdToName } from '@ghibli-analysis/shared/dist/web';
import { Button, Collapse, InputNumber, Select, Slider } from 'antd';
import Movies from '../lib/data';
import Route from '../components/Route';
import { StopOutlined } from '@ant-design/icons';
import { getEntries } from '../lib/object';
import HotwordNetwork, { NodeFilter } from '../components/Charts/HotwordNetwork';
import ReviewList from '../components/ReviewList';

const HotwordExplorer: React.FC = () => {
	const [movieId, setMovieId] = useState<null | MovieId>(null);
	const [isPos, setIsPos] = useState<boolean>(false);

	const [wordFocus, setWordFocus] = useState<string | null>(null);
	const [edgeFocus, setEdgeFocus] = useState<string[] | null>(null);

	const minNodeWeightRef = useRef<HTMLInputElement>(null);
	const minLinkWeightRef = useRef<HTMLInputElement>(null);
	const [minPolarityValue, setMinPolarityValue] = useState(0.25);

	const [filter, _setFilter] = useState<NodeFilter>({
		minPolarity: 0.25,
		minNodeWeight: 1,
		minLinkWeight: 2,
	});

	const setFilter = (partial: Partial<NodeFilter>) => _setFilter({ ...filter, ...partial });

	const setName = isPos ? 'positiveHotwords' : 'negativeHotwords';

	return (
		<div>
			<div className="relative flex flex-col">
				<div className="fixed top-0 left-0 z-10 flex flex-col gap-x-2 justify-center m-6 min-w-[250px]">
					<Route name="Home" path="/" />
					<Select
						className="w-full mb-2"
						value={movieId}
						placeholder={'Movie'}
						onChange={(v, opts) => setMovieId(v)}
						options={getEntries(movieIdToName).map(([id, name]) => ({
							value: id,
							label: `${name} (${Movies[id].stats.avg})`,
						}))}
						showSearch={true}
						filterOption={(input, opt) => {
							return opt?.label.toLowerCase().includes(input.toLowerCase()) ?? false;
						}}
					/>
					{movieId ? (
						<>
							<Select
								className="w-full mb-2"
								value={isPos}
								onChange={(v, opts) => setIsPos(v)}
								options={[
									{ label: 'Positive', value: true },
									{ label: 'Negative', value: false },
								]}
							/>
							<div className="flex items-center mb-2">
								<Select
									value={typeof wordFocus === 'string' ? wordFocus : null}
									className="w-full"
									onChange={(v, opts) => {
										setWordFocus(v);
									}}
									showSearch={true}
									options={Movies[movieId][setName].nodes.map((n) => ({
										label: `${n.id} (w=${n.weight}, p=${n.polarity})`,
										value: n.id,
									}))}
									placeholder={'Find word'}
									allowClear={true}
									onClear={() => setWordFocus('')}
								/>
								<StopOutlined
									disabled={wordFocus === null}
									className={`${
										wordFocus === null
											? 'text-gray-600 !cursor-not-allowed'
											: 'text-red-500 hover:text-red-900 !cursor-pointer'
									} ml-2 `}
									onClick={() => setWordFocus(null)}
								/>
							</div>
							<Collapse
								items={[
									{
										key: '1',
										label: 'Filter',
										children: (
											<div className="grid grid-cols-2 justify-items-end">
												<span>Min polarity: </span>
												<div className="w-full">
													<Slider
														value={minPolarityValue}
														min={0.0}
														max={1.0}
														step={0.05}
														onAfterChange={(v) => setMinPolarityValue(v)}
													/>
												</div>
												<span>Min node weight: </span>
												<InputNumber
													ref={minNodeWeightRef}
													min={0}
													max={Movies[movieId][setName].maxNodeWeight}
													defaultValue={1}
												/>
												<span>Min link weight: </span>
												<InputNumber
													ref={minLinkWeightRef}
													min={0}
													max={Movies[movieId][setName].maxLinkWeight}
													defaultValue={2}
												/>
												<Button
													type="primary"
													className="bg-[#1668dc]"
													onClick={() =>
														setFilter({
															minLinkWeight: parseInt(
																minLinkWeightRef.current?.value ?? '1',
															),
															minNodeWeight: parseInt(
																minNodeWeightRef.current?.value ?? '2',
															),
															minPolarity: minPolarityValue,
														})
													}
												>
													Submit
												</Button>
											</div>
										),
									},
									{
										key: '2',
										label: 'Movie Info',
										children: (
											<div className="grid grid-cols-2">
												<div className="text-end">Normal Average:</div>
												<div className="text-left ml-4">{Movies[movieId].stats.avg}</div>
												<div className="text-end">Strong Average:</div>
												<div className="text-left ml-4">{Movies[movieId].stats.avgStrong}</div>
												<div className="text-end">Reviews:</div>
												<div className="text-left ml-4">{Movies[movieId].stats.n}</div>
												<div className="text-end">Positive:</div>
												<div className="text-left ml-4">{Movies[movieId].stats.nPositive}</div>
												<div className="text-end">Negative:</div>
												<div className="text-left ml-4">{Movies[movieId].stats.nNegative}</div>
												<div className="text-end">Mixed:</div>
												<div className="text-left ml-4">{Movies[movieId].stats.nMixed}</div>
											</div>
										),
									},
								]}
							/>
						</>
					) : (
						<></>
					)}
				</div>
				{movieId ? (
					<HotwordNetwork
						network={Movies[movieId][setName]}
						wordFocus={wordFocus}
						setWordFocus={setWordFocus}
						edgeFocus={edgeFocus}
						setEdgeFocus={setEdgeFocus}
						filter={filter}
					/>
				) : (
					<></>
				)}
			</div>
			{movieId && edgeFocus !== null ? (
				<ReviewList
					close={() => setEdgeFocus(null)}
					reviews={Movies[movieId].reviews}
					keywords={edgeFocus}
					polarity={isPos ? 'pos' : 'neg'}
				/>
			) : (
				<></>
			)}
		</div>
	);
};

export default HotwordExplorer;
