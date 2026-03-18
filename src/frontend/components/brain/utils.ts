import {
	BRAIN_FISSURE_AMP,
	BRAIN_FISSURE_DECAY,
	BRAIN_GEN_X,
	BRAIN_GEN_Y,
	BRAIN_GEN_Z,
	CENTER_DIVISOR,
	DEFAULT_MAX_CONNECTIONS,
	DEFAULT_SEGMENTS,
	DEFORM_FISSURE_AMP,
	DEFORM_FISSURE_DECAY,
	DEFORM_GYRI_1_AMP,
	DEFORM_GYRI_1A,
	DEFORM_GYRI_1B,
	DEFORM_GYRI_1C,
	DEFORM_GYRI_1D,
	DEFORM_GYRI_2_AMP,
	DEFORM_GYRI_2A,
	DEFORM_GYRI_2B,
	DEFORM_GYRI_2C,
	DEFORM_X,
	DEFORM_Y,
	DEFORM_Z,
	GOLDEN_OFFSET,
	GOLDEN_SQRT,
	SULCI_1_AMP,
	SULCI_1A,
	SULCI_1B,
	SULCI_1C,
	SULCI_1D,
	SULCI_2_AMP,
	SULCI_2A,
	SULCI_2B,
	SULCI_2C,
	SULCI_3_AMP,
	SULCI_3A,
	SULCI_3B,
	SULCI_3C,
	TENDRIL_EXTEND,
	TENDRIL_RADIUS,
	TENDRIL_SEED,
	TENDRIL_WOBBLE,
	TENDRIL_X_FREQ,
	TENDRIL_Y_DAMP,
	TENDRIL_Y_FACTOR,
	TENDRIL_Y_FREQ,
	TENDRIL_Y_SEED_MULT,
	TENDRIL_Z_FREQ,
	TENDRIL_Z_SEED_MULT,
	VEC3_STRIDE,
	VEC3_Z
} from '../../../../constants';

export type ChatState = 'idle' | 'thinking' | 'responding';

export type Message = {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
};

export const AI_RESPONSES = [
	"I've analyzed your query through multiple neural pathways. The synthesis suggests a multi-layered approach drawing from cross-domain insights.",
	'Interesting perspective. My cognitive processes identify several key patterns. The most significant finding connects to deeper structural relationships.',
	'Processing complete. The data confluence points to an elegant solution balancing efficiency with thoroughness.',
	'Your question activates a fascinating cluster of interconnected concepts. The deep analysis reveals unexpected correlations worth exploring.',
	"I've cross-referenced this against my knowledge architecture. The emergent patterns suggest three promising directions.",
	'The neural synthesis is complete. What stands out is the underlying structure connecting these seemingly disparate elements.',
	'Fascinating input. My reasoning pathways converge on an insight that challenges conventional thinking about this domain.',
	'Deep processing complete. The convergence of these ideas opens up an unexpectedly rich solution space to explore.',
	'Your query maps to several established frameworks. The most illuminating connection reveals a pattern often overlooked.',
	'Analysis complete. Pattern recognition identified a primary insight that reframes the underlying question entirely.'
];

type Style = {
	accent: string;
	bg: string;
	description: string;
	name: string;
};

export const STYLES: Style[] = [
	{
		accent: '#4fc3f7',
		bg: '#0a1628',
		description: 'Constellation of interconnected neural nodes',
		name: 'Neural Network'
	},
	{
		accent: '#00e5ff',
		bg: '#020010',
		description: 'Vibrant energy radiating from the neural core',
		name: 'Neon Pulse'
	},
	{
		accent: '#f50057',
		bg: '#0d0221',
		description: 'Deep space neural architecture with flowing energy',
		name: 'Cosmic Neural'
	},
	{
		accent: '#26c6da',
		bg: '#060a12',
		description: 'Clean wireframe holographic neural interface',
		name: 'Holographic'
	}
];

type PositionAttr = {
	count: number;
	getX(idx: number): number;
	getY(idx: number): number;
	getZ(idx: number): number;
	setXYZ(idx: number, posX: number, posY: number, posZ: number): void;
};

const deformVertex = (positionAttr: PositionAttr, idx: number) => {
	let posX = positionAttr.getX(idx);
	let posY = positionAttr.getY(idx);
	let posZ = positionAttr.getZ(idx);

	posX *= DEFORM_X;
	posY *= DEFORM_Y;
	posZ *= DEFORM_Z;

	const fissure =
		DEFORM_FISSURE_AMP *
		Math.max(0, posY) *
		Math.exp(-posZ * posZ * DEFORM_FISSURE_DECAY);
	posY -= fissure;

	const displacement =
		DEFORM_GYRI_1_AMP *
			Math.sin(posX * DEFORM_GYRI_1A + posY * DEFORM_GYRI_1B) *
			Math.cos(posZ * DEFORM_GYRI_1C + posX * DEFORM_GYRI_1D) +
		DEFORM_GYRI_2_AMP *
			Math.sin(posY * DEFORM_GYRI_2A + posZ * DEFORM_GYRI_2B) *
			Math.cos(posX * DEFORM_GYRI_2C);

	const radius = Math.sqrt(posX * posX + posY * posY + posZ * posZ);
	if (radius <= 0) {
		positionAttr.setXYZ(idx, posX, posY, posZ);

		return;
	}
	posX += (posX / radius) * displacement;
	posY += (posY / radius) * displacement;
	posZ += (posZ / radius) * displacement;

	positionAttr.setXYZ(idx, posX, posY, posZ);
};

export const deformBrainVertices = (positionAttr: PositionAttr) => {
	for (let idx = 0; idx < positionAttr.count; idx++) {
		deformVertex(positionAttr, idx);
	}
};

const computeBrainPoint = (
	idx: number,
	count: number,
	positions: Float32Array
) => {
	const phi = Math.acos(1 - (CENTER_DIVISOR * (idx + GOLDEN_OFFSET)) / count);
	const theta = Math.PI * (1 + Math.sqrt(GOLDEN_SQRT)) * idx;

	let posX = Math.sin(phi) * Math.cos(theta) * BRAIN_GEN_X;
	let posY = Math.cos(phi) * BRAIN_GEN_Y;
	let posZ = Math.sin(phi) * Math.sin(theta) * BRAIN_GEN_Z;

	const fissure =
		BRAIN_FISSURE_AMP *
		Math.max(0, posY) *
		Math.exp(-posZ * posZ * BRAIN_FISSURE_DECAY);
	posY -= fissure;

	const detail =
		SULCI_1_AMP *
			Math.sin(posX * SULCI_1A + posY * SULCI_1B) *
			Math.cos(posZ * SULCI_1C + posX * SULCI_1D) +
		SULCI_2_AMP *
			Math.sin(posY * SULCI_2A + posZ * SULCI_2B) *
			Math.cos(posX * SULCI_2C) +
		SULCI_3_AMP *
			Math.sin(posZ * SULCI_3A + posX * SULCI_3B) *
			Math.cos(posY * SULCI_3C);

	const radius = Math.sqrt(posX * posX + posY * posY + posZ * posZ);
	if (radius <= 0) {
		return;
	}
	posX += (posX / radius) * detail;
	posY += (posY / radius) * detail;
	posZ += (posZ / radius) * detail;

	positions[idx * VEC3_STRIDE] = posX;
	positions[idx * VEC3_STRIDE + 1] = posY;
	positions[idx * VEC3_STRIDE + VEC3_Z] = posZ;
};

export const generateBrainPoints = (count: number) => {
	const positions = new Float32Array(count * VEC3_STRIDE);

	for (let idx = 0; idx < count; idx++) {
		computeBrainPoint(idx, count, positions);
	}

	return positions;
};

type ConnectionContext = {
	connCounts: Uint8Array;
	idx: number;
	innerIdx: number;
	lines: number[];
	maxPerNode: number;
	positions: Float32Array;
	threshold: number;
};

const tryAddConnection = ({
	connCounts,
	idx,
	innerIdx,
	lines,
	maxPerNode,
	positions,
	threshold
}: ConnectionContext) => {
	if ((connCounts[innerIdx] ?? 0) >= maxPerNode) {
		return;
	}

	const deltaX =
		(positions[idx * VEC3_STRIDE] ?? 0) -
		(positions[innerIdx * VEC3_STRIDE] ?? 0);
	const deltaY =
		(positions[idx * VEC3_STRIDE + 1] ?? 0) -
		(positions[innerIdx * VEC3_STRIDE + 1] ?? 0);
	const deltaZ =
		(positions[idx * VEC3_STRIDE + VEC3_Z] ?? 0) -
		(positions[innerIdx * VEC3_STRIDE + VEC3_Z] ?? 0);
	const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

	if (dist >= threshold) {
		return;
	}
	lines.push(
		positions[idx * VEC3_STRIDE] ?? 0,
		positions[idx * VEC3_STRIDE + 1] ?? 0,
		positions[idx * VEC3_STRIDE + VEC3_Z] ?? 0,
		positions[innerIdx * VEC3_STRIDE] ?? 0,
		positions[innerIdx * VEC3_STRIDE + 1] ?? 0,
		positions[innerIdx * VEC3_STRIDE + VEC3_Z] ?? 0
	);
	connCounts[idx] = (connCounts[idx] ?? 0) + 1;
	connCounts[innerIdx] = (connCounts[innerIdx] ?? 0) + 1;
};

const addConnectionsForNode = (
	idx: number,
	count: number,
	positions: Float32Array,
	connCounts: Uint8Array,
	maxPerNode: number,
	threshold: number,
	lines: number[]
) => {
	if ((connCounts[idx] ?? 0) >= maxPerNode) {
		return;
	}
	for (let innerIdx = idx + 1; innerIdx < count; innerIdx++) {
		tryAddConnection({
			connCounts,
			idx,
			innerIdx,
			lines,
			maxPerNode,
			positions,
			threshold
		});
	}
};

export const generateConnections = (
	positions: Float32Array,
	threshold: number,
	maxPerNode: number = DEFAULT_MAX_CONNECTIONS
) => {
	const count = positions.length / VEC3_STRIDE;
	const lines: number[] = [];
	const connCounts = new Uint8Array(count);

	for (let idx = 0; idx < count; idx++) {
		addConnectionsForNode(
			idx,
			count,
			positions,
			connCounts,
			maxPerNode,
			threshold,
			lines
		);
	}

	return new Float32Array(lines);
};

const buildTendrilPoints = (
	tendrilIdx: number,
	count: number,
	segmentsPerTendril: number
) => {
	const angle = (tendrilIdx / count) * Math.PI * CENTER_DIVISOR;
	const seed = tendrilIdx * TENDRIL_SEED;
	const baseRadius = TENDRIL_RADIUS;
	const startX = Math.cos(angle) * baseRadius;
	const startY = Math.sin(seed) * TENDRIL_Y_FACTOR * baseRadius;
	const startZ = Math.sin(angle) * baseRadius;
	const points: [number, number, number][] = [];

	for (let seg = 0; seg <= segmentsPerTendril; seg++) {
		const fraction = seg / segmentsPerTendril;
		const extend = fraction * TENDRIL_EXTEND;
		const wobble = fraction * TENDRIL_WOBBLE;
		points.push([
			startX +
				Math.cos(angle) * extend +
				Math.sin(fraction * TENDRIL_X_FREQ + seed) * wobble,
			startY +
				Math.cos(
					fraction * TENDRIL_Y_FREQ + seed * TENDRIL_Y_SEED_MULT
				) *
					wobble *
					TENDRIL_Y_DAMP,
			startZ +
				Math.sin(angle) * extend +
				Math.cos(
					fraction * TENDRIL_Z_FREQ + seed * TENDRIL_Z_SEED_MULT
				) *
					wobble
		]);
	}

	return points;
};

export const generateTendrilPoints = (
	count: number,
	segmentsPerTendril: number = DEFAULT_SEGMENTS
) => {
	const tendrils: [number, number, number][][] = [];

	for (let tendrilIdx = 0; tendrilIdx < count; tendrilIdx++) {
		tendrils.push(
			buildTendrilPoints(tendrilIdx, count, segmentsPerTendril)
		);
	}

	return tendrils;
};
