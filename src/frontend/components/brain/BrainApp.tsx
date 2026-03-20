import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
	useState,
	useEffect,
	Suspense,
	type ComponentType,
	type CSSProperties
} from 'react';

import {
	CAMERA_Z,
	DPR_MAX,
	INITIAL_MEMORY_COUNT,
	POLAR_ANGLE_DEN,
	POLAR_ANGLE_NUM,
	RESPONDING_ACTIVITY
} from '../../../constants';
import { ChatPanel } from './ChatPanel';
import { type BrainVariant, VARIANTS } from './styles';
import { type ChatState } from './utils';
import { AuroraBrain } from './variants/AuroraBrain';
import { ConstellationBrain } from './variants/ConstellationBrain';
import { CrystalBrain } from './variants/CrystalBrain';
import { EmberBrain } from './variants/EmberBrain';
import { NebulaBrain } from './variants/NebulaBrain';
import { SynapseBrain } from './variants/SynapseBrain';

type VariantButtonProps = {
	isActive: boolean;
	onSelect: () => void;
	variant: BrainVariant;
};

const BRAIN_COMPONENTS: Record<
	string,
	ComponentType<{
		activity: number;
		memoryCount: number;
		variant: (typeof VARIANTS)[number];
	}>
> = {
	aurora: AuroraBrain,
	constellation: ConstellationBrain,
	crystal: CrystalBrain,
	ember: EmberBrain,
	nebula: NebulaBrain,
	synapse: SynapseBrain
};

const getActivity = (state: ChatState) => {
	if (state === 'thinking') {
		return 1.0;
	}
	if (state === 'responding') {
		return RESPONDING_ACTIVITY;
	}

	return 0;
};

const VariantButton = ({ isActive, onSelect, variant }: VariantButtonProps) => (
	<button
		className={`variant-btn ${isActive ? 'active' : ''}`}
		onClick={onSelect}
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		style={{ '--v-color': variant.primary } as CSSProperties}
	>
		<span className="variant-dot" style={{ background: variant.primary }} />
		<span className="variant-name">{variant.name}</span>
	</button>
);

export const BrainApp = () => {
	const [isClient, setIsClient] = useState(false);
	const [activeId, setActiveId] = useState('constellation');
	const [chatOpen, setChatOpen] = useState(true);
	const [chatState, setChatState] = useState<ChatState>('idle');
	const [memoryCount, setMemoryCount] = useState(INITIAL_MEMORY_COUNT);

	useEffect(() => setIsClient(true), []);

	const [fallback] = VARIANTS;
	const variant = VARIANTS.find((vol) => vol.id === activeId) ?? fallback;
	const BrainComponent = BRAIN_COMPONENTS[activeId] ?? ConstellationBrain;
	const activity = getActivity(chatState);

	if (!isClient || !variant) {
		return (
			<div className="brain-loading">
				Initializing Neural Interface...
			</div>
		);
	}

	return (
		<div className="brain-container">
			{/* 3D Canvas */}
			<section className="brain-canvas">
				<Canvas
					camera={{ fov: 50, position: [0, 0, CAMERA_Z] }}
					dpr={[1, DPR_MAX]}
					gl={{
						alpha: false,
						antialias: true,
						powerPreference: 'high-performance'
					}}
				>
					<color args={[variant.bg]} attach="background" />
					<Suspense fallback={null}>
						<BrainComponent
							activity={activity}
							memoryCount={memoryCount}
							variant={variant}
						/>
					</Suspense>
					<OrbitControls
						dampingFactor={0.05}
						enablePan={false}
						enableZoom={false}
						maxPolarAngle={
							(Math.PI * POLAR_ANGLE_NUM) / POLAR_ANGLE_DEN
						}
						minPolarAngle={Math.PI / POLAR_ANGLE_DEN}
					/>
				</Canvas>
			</section>

			{/* Variant selector */}
			<div className="variant-selector">
				{VARIANTS.map((vol) => (
					<VariantButton
						isActive={activeId === vol.id}
						key={vol.id}
						onSelect={() => setActiveId(vol.id)}
						variant={vol}
					/>
				))}
			</div>

			{/* Info label */}
			<div className="brain-label">
				<h2 style={{ color: variant.primary }}>{variant.name}</h2>
				<p>{variant.description}</p>
			</div>

			{/* Chat toggle */}
			<button
				aria-label={chatOpen ? 'Close chat' : 'Open chat'}
				className="chat-toggle"
				onClick={() => setChatOpen(!chatOpen)}
			>
				{chatOpen ? '\u2715' : '\u{1F4AC}'}
			</button>

			{/* Chat */}
			<ChatPanel
				accentColor={variant.primary}
				chatState={chatState}
				onChatStateChange={setChatState}
				onMemoryAdd={(count) =>
					setMemoryCount((prev: number) => prev + count)
				}
				open={chatOpen}
			/>
		</div>
	);
};
