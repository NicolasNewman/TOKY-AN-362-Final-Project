import { CracoConfig } from '@craco/types';

export default {
	webpack: { configure: { experiments: { topLevelAwait: true } } },
} as CracoConfig;
