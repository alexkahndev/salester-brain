import {
	asset,
	handleReactPageRequest,
	networking,
	prepare
} from '@absolutejs/absolute';
import { Elysia } from 'elysia';
import { BrainShowcase } from '../frontend/pages/BrainShowcase';
import { ReactExample } from '../frontend/pages/ReactExample';

const { absolutejs, manifest } = await prepare();

export const server = new Elysia()
	.use(absolutejs)

	.get('/', () =>
		handleReactPageRequest(
			BrainShowcase,
			asset(manifest, 'BrainShowcaseIndex'),
			{ cssPath: asset(manifest, 'BrainShowcaseCSS') }
		)
	)
	.get('/brain', () =>
		handleReactPageRequest(
			BrainShowcase,
			asset(manifest, 'BrainShowcaseIndex'),
			{ cssPath: asset(manifest, 'BrainShowcaseCSS') }
		)
	)
	.get('/react', () =>
		handleReactPageRequest(
			ReactExample,
			asset(manifest, 'ReactExampleIndex'),
			{ cssPath: asset(manifest, 'ReactExampleCSS'), initialCount: 0 }
		)
	)
	.use(networking)
	.on('error', (err) => {
		const { request } = err;
		console.error(
			`Server error on ${request.method} ${request.url}: ${err.message}`
		);
	});

export type Server = typeof server;
