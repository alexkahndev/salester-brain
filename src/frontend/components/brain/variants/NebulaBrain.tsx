import { useSpring, a } from '@react-spring/three';
import { Float, Sparkles, Outlines } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, type Group } from 'three';
import {
	ACTIVITY_SCALE_LG,
	LIGHT_POS_2,
	LIGHT_POS_3,
	LIGHT_POS_NEG_2,
	LIGHT_POS_NEG_3,
	NEBULA_EMISSIVE_BASE,
	NEBULA_EMISSIVE_FACTOR,
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

export const NebulaBrain = ({
	activity,
	variant,
	memoryCount
}: BrainVariantProps) => {
	const groupRef = useRef<Group>(null);

	const springs = useSpring({
		brainScale: 1 + activity * ACTIVITY_SCALE_LG,
		config: { friction: 28, mass: 1.5, tension: 180 },
		emissive: NEBULA_EMISSIVE_BASE + activity * NEBULA_EMISSIVE_FACTOR
	});

	useFrame(({ clock }) => {
		const elapsed = clock.getElapsedTime();
		if (groupRef.current) {
			groupRef.current.rotation.y =
				Math.sin(elapsed * ROTATION_SPEED) * ROTATION_AMP;
		}
	});

	return (
		<>
			<ambientLight intensity={0.2} />
			<pointLight
				color={variant.primary}
				intensity={0.8}
				position={[LIGHT_POS_3, LIGHT_POS_3, LIGHT_POS_3]}
			/>
			<pointLight
				color={variant.secondary}
				intensity={0.4}
				position={[LIGHT_POS_NEG_3, LIGHT_POS_NEG_2, LIGHT_POS_NEG_3]}
			/>
			<pointLight
				color={variant.accent}
				intensity={0.3}
				position={[0, LIGHT_POS_NEG_3, LIGHT_POS_2]}
			/>

			<Float floatIntensity={0.25} rotationIntensity={0.12} speed={1.2}>
				<a.group ref={groupRef} scale={springs.brainScale}>
					{/* Glowing brain */}
					<BrainModel>
						<a.meshStandardMaterial
							color={variant.primary}
							emissive={variant.primary}
							emissiveIntensity={springs.emissive}
							metalness={0.1}
							roughness={0.3}
							toneMapped={false}
						/>
						<Outlines
							color={variant.secondary}
							opacity={0.5}
							thickness={0.008}
							transparent
						/>
					</BrainModel>

					{/* Brain-shaped glow (replaces sphere shells) */}
					<BrainModel scale={1.06}>
						<meshBasicMaterial
							blending={AdditiveBlending}
							color={variant.primary}
							depthWrite={false}
							opacity={0.08}
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
				count={70}
				opacity={0.35}
				scale={3.5}
				size={2.5}
				speed={0.3}
			/>
			<Sparkles
				color={variant.accent}
				count={40}
				opacity={0.2}
				scale={4}
				size={1.5}
				speed={0.15}
			/>
		</>
	);
};
