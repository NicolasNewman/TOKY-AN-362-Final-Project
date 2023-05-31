import React from 'react';
import { ResponsiveChord } from '@nivo/chord';
import { movieIdToName } from '@ghibli-analysis/shared/dist/web';
import { getEntries } from '../lib/object';
import Movies from '../lib/data';

// const references = getEntries(data).map(([movieId, data]) => Object.values(data.stats.references));
const references2 = getEntries(Movies).map(([movieId, data]) =>
	getEntries(data.stats.references).map(
		([movieId2, references]) => Math.round((references / data.reviews.length) * 1e4) / 1e2,
	),
);

const Testing: React.FC = () => {
	return (
		<div className="flex justify-center h-screen text-black">
			<ResponsiveChord
				data={references2}
				keys={Object.values(movieIdToName)}
				ribbonTooltip={(data) => {
					const { source, target } = data.ribbon;
					return (
						<div className="bg-white p-4 shadow-md">
							<div>
								{source.formattedValue}% of <strong>{source.id}</strong> reviews mentioned{' '}
								<strong>{target.id}</strong>
							</div>
							<div>
								{target.formattedValue}% of <strong>{target.id}</strong> reviews mentioned{' '}
								<strong>{source.id}</strong>
							</div>
						</div>
					);
				}}
			/>
		</div>
	);
};

export default Testing;
