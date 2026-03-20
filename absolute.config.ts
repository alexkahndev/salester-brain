import { defineConfig } from '@absolutejs/absolute';

export default defineConfig({
	assetsDirectory: 'src/backend/assets',
	buildDirectory: 'build',
	reactDirectory: 'src/frontend',
	publicDirectory: 'public',
	stylesConfig: 'src/frontend/styles'
});
