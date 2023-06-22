import { Network } from '@ghibli-analysis/shared/dist/web';
import { Network as NetworkChart } from '@nivo/network';
import React from 'react';
import { shiftRange } from '../../lib/math';

export interface NodeFilter {
	minPolarity: number;
	minNodeWeight: number;
	minLinkWeight: number;
}

interface IProps {
	network: Network;
	focus: string | string[] | null;
	setFocus: (focus: string | string[] | null) => void;
	filter: NodeFilter;
}

const HotwordNetwork: React.FC<IProps> = ({ network, focus, setFocus, filter }) => {
	const filteredNetwork = (() => {
		const nodeNames: { [key: string]: number } = {};
		let maxLinkWeight = 0;
		let maxNodeWeight = 0;
		const temp: Network = {
			links: network.links.filter((l) => {
				const a = Math.abs(l.polarity) < Math.abs(filter.minPolarity);
				const b = l.weight < filter.minLinkWeight;
				if (a || b) {
					return false;
				}

				if (typeof focus === 'string') {
					if (l.source === focus) {
						nodeNames[l.target] = 1;
					} else if (l.target === focus) {
						nodeNames[l.source] = 1;
					}
					if (l.source === focus || l.target === focus) {
						maxLinkWeight = Math.max(maxLinkWeight, l.weight);
						return true;
					}
					return false;
				}
				nodeNames[l.target] = 1;
				nodeNames[l.source] = 1;
				return true;
			}),
			nodes: network.nodes.filter((n) => {
				// if (typeof focus === 'string') {
				if (nodeNames[n.id] || n.id === focus) {
					maxNodeWeight = Math.max(maxNodeWeight, n.weight);
					return true;
				}
				return false;
				// }
				// return true;
			}),
			maxLinkWeight,
			maxNodeWeight,
		};
		return temp;
	})();
	return (
		<NetworkChart
			data={filteredNetwork}
			width={2500}
			height={2500}
			repulsivity={6}
			iterations={120}
			animate={false}
			linkDistance={(n) => shiftRange(n.weight, [0, network.maxLinkWeight], [300, 200], Math.ceil)}
			linkColor={(link) => {
				const { polarity } = link.data;
				const num = shiftRange(Math.abs(polarity), [0, 1], [64, 255], Math.ceil);
				const r = polarity < 0 ? num : 0;
				const g = polarity > 0 ? num : 0;

				if (r === 0 && g === 0) return '#aaa';
				return `rgb(${r},${g},0)`;
			}}
			linkThickness={(link) => shiftRange(link.data.weight, [0, network.maxLinkWeight], [1, 12], Math.ceil)}
			nodeBorderWidth={1}
			nodeSize={(n) => shiftRange(n.weight, [0, network.maxNodeWeight], [8, 36], Math.ceil)}
			inactiveNodeSize={(n) => shiftRange(n.weight, [0, network.maxNodeWeight], [8, 36], Math.ceil)}
			activeNodeSize={(n) => shiftRange(n.weight, [0, network.maxNodeWeight], [8, 36], Math.ceil)}
			nodeColor={(n) => {
				const num = shiftRange(Math.abs(n.polarity), [0, 1], [64, 255], Math.ceil);
				const r = n.polarity < 0 ? num : 0;
				const g = n.polarity > 0 ? num : 0;
				if (r === 0 && g === 0) return '#aaa';
				return `rgb(${r},${g},0)`;
			}}
			linkComponent={({ link }) => {
				return (
					<line
						x1={link.source.x}
						y1={link.source.y}
						x2={link.target.x}
						y2={link.target.y}
						stroke={link.color}
						strokeWidth={link.thickness}
						// strokeDasharray="5 7"
						strokeLinecap="round"
						onClick={(e) => {
							const a = link.source.id;
							const b = link.target.id;
							setFocus([a, b]);
						}}
						cursor={'pointer'}
					/>
				);
			}}
			theme={{
				tooltip: {
					basic: {
						color: '#000',
					},
					container: {
						color: '#000',
					},
				},
				annotations: {
					outline: {
						strokeWidth: 0,
						strokeOpacity: 0,
						opacity: 0,
						outlineWidth: 0,
						outlineOpacity: 0,
					},
					symbol: {
						strokeWidth: 0,
						strokeOpacity: 0,
						opacity: 0,
						outlineWidth: 0,
						outlineOpacity: 0,
					},
					link: {
						strokeWidth: 0,
						strokeOpacity: 0,
						opacity: 0,
						outlineWidth: 0,
						outlineOpacity: 0,
					},
				},
				// background: '#fff',
			}}
			annotations={network.nodes.map((n) => ({
				type: 'dot',
				noteWidth: 0,
				size: 0.1,
				noteX: 0,
				noteY: 0,
				match: {
					id: n.id,
				},
				note: n.id,
			}))}
			onClick={(n) => {
				setFocus(n.data.id);
			}}
			nodeTooltip={(props) => {
				// const { size } = props.node;
				const { id, polarity, weight } = props.node.data;

				const edges = filteredNetwork.links
					.filter((link) => link.source === id || link.target === id)
					.map(({ polarity, source, target, weight }) => {
						const linkEnd = source === id ? target : source;
						return (
							<div>
								{'->'}
								{linkEnd} (w={weight}, p=
								<span style={{ color: polarity === 0 ? '#000' : polarity > 0 ? '#0f0' : '#f00' }}>
									{polarity}
								</span>
								)
							</div>
						);
					});
				return (
					<div className="bg-white p-2 text-black">
						<div className="text-lg font-bold">{id}</div>
						<div>
							w={weight}, p=
							<span style={{ color: polarity === 0 ? '#000' : polarity > 0 ? '#0f0' : '#f00' }}>
								{polarity}
							</span>
						</div>
						{edges}
					</div>
				);
			}}
		/>
	);
};

export default HotwordNetwork;
