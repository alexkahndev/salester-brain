import { a, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { AdditiveBlending, type Group } from 'three';

import {
	BIRTH_SCALE_INIT,
	BIRTH_Y_RANDOM,
	BIRTH_Y_SPREAD,
	CHAT_ORIGIN_X,
	CHAT_ORIGIN_Z,
	EMISSIVE_HOVER,
	EMISSIVE_REST,
	FLOAT_AMP_X,
	FLOAT_AMP_Y,
	FLOAT_AMP_Z,
	FLOAT_IDX_MULT,
	FLOAT_PHASE_Z,
	FLOAT_SPEED_X,
	FLOAT_SPEED_Y,
	FLOAT_SPEED_Z,
	GLOW_OPACITY_HOVER,
	GLOW_OPACITY_REST,
	GLOW_SCALE_HOVER,
	GLOW_SCALE_REST,
	GLOW_SEGMENTS,
	INITIAL_MEMORY_COUNT,
	MEMORY_ACTIVITY_SCALE,
	NEW_INDEX_TIMEOUT,
	ORB_RADIUS,
	ORB_SCALE_HOVER,
	ORB_SEGMENTS
} from '../../../constants';
import { useBrainSurfacePoints } from './BrainModel';

type MemoryOrbProps = {
	color: string;
	index: number;
	isNew: boolean;
	position: [number, number, number];
};

/** Starting point for new dots — right side where the chat panel is */
const CHAT_ORIGIN: [number, number, number] = [CHAT_ORIGIN_X, 0, CHAT_ORIGIN_Z];

const MemoryOrb = ({ color, index, isNew, position }: MemoryOrbProps) => {
	const [hovered, setHovered] = useState(false);
	const floatRef = useRef<Group>(null);
	const [posX, posY, posZ] = position;

	// Fly-in: animate from chat area to target position on brain
	const travel = useSpring({
		birthScale: 1,
		config: { friction: 18, mass: 1.2, tension: 80 },
		from: isNew
			? {
					birthScale: BIRTH_SCALE_INIT,
					posX: CHAT_ORIGIN[0],
					posY:
						CHAT_ORIGIN[1] +
						(Math.random() - BIRTH_Y_RANDOM) * BIRTH_Y_SPREAD,
					posZ: CHAT_ORIGIN_Z
				}
			: undefined,
		posX,
		posY,
		posZ
	});

	const hover = useSpring({
		config: { friction: 28, mass: 0.6, tension: 300 },
		emissive: hovered ? EMISSIVE_HOVER : EMISSIVE_REST,
		glowOpacity: hovered ? GLOW_OPACITY_HOVER : GLOW_OPACITY_REST,
		glowScale: hovered ? GLOW_SCALE_HOVER : GLOW_SCALE_REST,
		scale: hovered ? ORB_SCALE_HOVER : 1
	});

	// Gentle float offset (applied on inner group so it doesn't fight the spring)
	useFrame(({ clock }) => {
		if (!floatRef.current) {
			return;
		}
		const elapsed = clock.getElapsedTime();
		const offset = index * FLOAT_IDX_MULT;
		floatRef.current.position.set(
			Math.sin(elapsed * FLOAT_SPEED_X + offset) * FLOAT_AMP_X,
			Math.sin(elapsed * FLOAT_SPEED_Y + offset + 1) * FLOAT_AMP_Y,
			Math.cos(elapsed * FLOAT_SPEED_Z + offset + FLOAT_PHASE_Z) *
				FLOAT_AMP_Z
		);
	});

	return (
		<a.group
			position-x={travel.posX}
			position-y={travel.posY}
			position-z={travel.posZ}
			scale={travel.birthScale}
		>
			<group ref={floatRef}>
				{/* Core orb */}
				<a.mesh
					onPointerOut={() => {
						setHovered(false);
					}}
					onPointerOver={(event) => {
						event.stopPropagation();
						setHovered(true);
					}}
					scale={hover.scale}
				>
					<sphereGeometry
						args={[ORB_RADIUS, ORB_SEGMENTS, ORB_SEGMENTS]}
					/>
					<a.meshStandardMaterial
						color={color}
						emissive={color}
						emissiveIntensity={hover.emissive}
						toneMapped={false}
					/>
				</a.mesh>

				{/* Glow halo */}
				<a.mesh scale={hover.glowScale}>
					<sphereGeometry
						args={[ORB_RADIUS, GLOW_SEGMENTS, GLOW_SEGMENTS]}
					/>
					<a.meshBasicMaterial
						blending={AdditiveBlending}
						color={color}
						depthWrite={false}
						opacity={hover.glowOpacity}
						transparent
					/>
				</a.mesh>
			</group>
		</a.group>
	);
};

const MAX_POINTS = 80;

type MemoryPointsProps = {
	activity?: number;
	colors: string[];
	count?: number;
};

export const MemoryPoints = ({
	activity = 0,
	colors,
	count = INITIAL_MEMORY_COUNT
}: MemoryPointsProps) => {
	const allPositions = useBrainSurfacePoints(MAX_POINTS);
	const prevCountRef = useRef(count);
	const [newIndices, setNewIndices] = useState<Set<number>>(new Set());

	useEffect(() => {
		if (count <= prevCountRef.current) {
			prevCountRef.current = count;

			return undefined;
		}

		const fresh = new Set<number>();
		for (let idx = prevCountRef.current; idx < count; idx++) {
			fresh.add(idx);
		}
		setNewIndices(fresh);
		const timer = setTimeout(
			() => setNewIndices(new Set()),
			NEW_INDEX_TIMEOUT
		);
		prevCountRef.current = count;

		return () => clearTimeout(timer);
	}, [count]);

	const { groupScale } = useSpring({
		config: { friction: 30, mass: 1, tension: 200 },
		groupScale: 1 + activity * MEMORY_ACTIVITY_SCALE
	});

	const visible = Math.min(count, allPositions.length);

	return (
		<a.group scale={groupScale}>
			{allPositions.slice(0, visible).map((pos, idx) => (
				<MemoryOrb
					color={colors[idx % colors.length] ?? colors[0] ?? ''}
					index={idx}
					isNew={newIndices.has(idx)}
					key={idx}
					position={pos}
				/>
			))}
		</a.group>
	);
};
