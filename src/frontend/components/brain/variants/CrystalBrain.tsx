import { useSpring, a } from '@react-spring/three';
import { Float, Sparkles, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, type Group } from 'three';
import {
	ACTIVITY_SCALE,
	CRYSTAL_DISTORT_BASE,
	CRYSTAL_DISTORT_FACTOR,
	LIGHT_POS_4,
	LIGHT_POS_5,
	LIGHT_POS_NEG_2,
	LIGHT_POS_NEG_3,
	ROTATION_AMP,
	ROTATION_SPEED
} from '../../../../../constants';
import { BrainModel } from '../BrainModel';
import { MemoryPoints } from '../MemoryPoints';
import { ThinkingWaves } from '../ThinkingWaves';
import type { BrainVariant } from '../styles';

type BrainVariantProps = {
	activity: number;
	memoryCount: number;
	variant: BrainVariant;
};

export const CrystalBrain = ({
	activity,
	variant,
	memoryCount
}: BrainVariantProps) => {
	const groupRef = useRef<Group>(null);

	const springs = useSpring({
		brainScale: 1 + activity * ACTIVITY_SCALE,
		config: { friction: 30, mass: 2, tension: 150 },
		distortion: CRYSTAL_DISTORT_BASE + activity * CRYSTAL_DISTORT_FACTOR
	});

	useFrame(({ clock }) => {
		if (groupRef.current) {
			groupRef.current.rotation.y =
				Math.sin(clock.getElapsedTime() * ROTATION_SPEED) *
				ROTATION_AMP;
		}
	});

	return (
		<>
			<ambientLight intensity={0.4} />
			<pointLight
				color="#ffffff"
				intensity={1}
				position={[LIGHT_POS_5, LIGHT_POS_5, LIGHT_POS_5]}
			/>
			<pointLight
				color={variant.primary}
				intensity={0.4}
				position={[LIGHT_POS_NEG_3, LIGHT_POS_NEG_2, LIGHT_POS_4]}
			/>

			<Float floatIntensity={0.2} rotationIntensity={0.1} speed={0.8}>
				<a.group ref={groupRef} scale={springs.brainScale}>
					{/* Crystal brain surface */}
					<BrainModel>
						<meshStandardMaterial
							color={variant.primary}
							emissive={variant.primary}
							emissiveIntensity={0.3}
							metalness={0.6}
							opacity={0.7}
							roughness={0.3}
							transparent
						/>
						<Edges
							color={variant.secondary}
							lineWidth={1}
							opacity={0.5}
							threshold={15}
							transparent
						/>
					</BrainModel>

					{/* Subtle brain-shaped glow */}
					<BrainModel scale={1.04}>
						<meshBasicMaterial
							blending={AdditiveBlending}
							color={variant.primary}
							depthWrite={false}
							opacity={0.05}
							transparent
						/>
					</BrainModel>

					<MemoryPoints
						activity={activity}
						colors={variant.pointColors}
						count={memoryCount}
					/>
					<ThinkingWaves
						activity={activity}
						color={variant.primary}
					/>
				</a.group>
			</Float>

			<Sparkles
				color={variant.secondary}
				count={50}
				opacity={0.3}
				scale={3}
				size={1.5}
				speed={0.15}
			/>
		</>
	);
};
