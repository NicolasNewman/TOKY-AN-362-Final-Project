import { Network } from '@ghibli-analysis/shared/dist/web';
import { ResponsiveNetwork } from '@nivo/network';
import React from 'react';
import { shiftRange } from '../../lib/math';

interface IProps {
	network: Network;
	filter: string[];
	minLinkWeight?: number;
}

const SubsetNetwork: React.FC<IProps> = ({ network, filter, minLinkWeight = 1 }) => {
	const nodeToWeight: { [key: string]: number } = {};
	const filteredNetwork = (() => {
		const nodeNames: { [key: string]: number } = {};
		// const linkNames: { [key: string]: number } = {};

		let maxLinkWeight = 0;
		let maxNodeWeight = 0;
		const temp: Network = {
			links: network.links.filter((l) => {
				if (l.weight > minLinkWeight && (filter.includes(l.source) || filter.includes(l.target))) {
					!nodeNames[l.source] ? (nodeNames[l.source] = l.weight) : (nodeNames[l.source] += l.weight);
					!nodeNames[l.target] ? (nodeNames[l.target] = l.weight) : (nodeNames[l.target] += l.weight);
					maxLinkWeight = Math.max(maxLinkWeight, l.weight);
					return true;
				}
				return false;
			}),
			nodes: network.nodes.filter((n) => {
				if (nodeNames[n.id]) {
					n.weight = nodeNames[n.id];
					maxNodeWeight = Math.max(maxNodeWeight, n.weight);
					nodeToWeight[n.id] = n.weight;
					return true;
				}
				return false;
			}),
			maxLinkWeight,
			maxNodeWeight,
		};
		// temp.nodes = temp.nodes.filter((n) => linkNames[n.id] !== undefined);
		return temp;
	})();
	console.log(filteredNetwork);
	return (
		<ResponsiveNetwork
			data={filteredNetwork}
			// repulsivity={8}
			iterations={20}
			animate={false}
			// linkDistance={75}
			linkDistance={(link) =>
				shiftRange(
					Math.max(nodeToWeight[link.target], nodeToWeight[link.source]),
					[0, filteredNetwork.maxNodeWeight],
					[25, 75],
					Math.ceil,
				)
			}
			linkColor={(link) => {
				const { polarity } = link.data;
				const num = shiftRange(Math.abs(polarity), [0, 1], [64, 255], Math.ceil);
				const r = polarity < 0 ? num : 0;
				const g = polarity > 0 ? num : 0;

				if (r === 0 && g === 0) return '#aaa';
				return `rgb(${r},${g},0)`;
			}}
			linkThickness={(link) =>
				shiftRange(link.data.weight, [0, filteredNetwork.maxLinkWeight], [1, 8], Math.ceil)
			}
			nodeBorderWidth={1}
			nodeSize={(n) => shiftRange(n.weight, [0, filteredNetwork.maxNodeWeight], [4, 26], Math.ceil)}
			inactiveNodeSize={(n) => shiftRange(n.weight, [0, filteredNetwork.maxNodeWeight], [4, 26], Math.ceil)}
			activeNodeSize={(n) => shiftRange(n.weight, [0, filteredNetwork.maxNodeWeight], [4, 26], Math.ceil)}
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
						// onClick={(e) => {
						// 	const a = link.source.id;
						// 	const b = link.target.id;
						// }}
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
			// onClick={(n) => {
			// 	setWordFocus(n.data.id);
			// }}
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

export default SubsetNetwork;
