import { useSpring, a } from '@react-spring/three';
import { Float, Sparkles, Outlines } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, type Group } from 'three';
import {
	ACTIVITY_SCALE_LG,
	EMBER_EMISSIVE_BASE,
	EMBER_EMISSIVE_FACTOR,
	LIGHT_POS_3,
	LIGHT_POS_4,
	LIGHT_POS_NEG_2,
	LIGHT_POS_NEG_3,
	ROTATION_AMP,
	ROTATION_SPEED
} from '../../../../constants';
import { BrainModel } from '../BrainModel';
import { MemoryPoints } from '../MemoryPoints';
import { ThinkingWaves } from '../ThinkingWaves';
import type { BrainVariant } from '../styles';

type BrainVariantProps = {
	activity: number;
	memoryCount: number;
	variant: BrainVariant;
};

export const EmberBrain = ({
	activity,
	variant,
	memoryCount
}: BrainVariantProps) => {
	const groupRef = useRef<Group>(null);

	const springs = useSpring({
		brainScale: 1 + activity * ACTIVITY_SCALE_LG,
		config: { friction: 30, mass: 1.5, tension: 200 },
		emissive: EMBER_EMISSIVE_BASE + activity * EMBER_EMISSIVE_FACTOR
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
			<ambientLight intensity={0.15} />
			<pointLight
				color={variant.primary}
				intensity={1}
				position={[LIGHT_POS_4, LIGHT_POS_3, LIGHT_POS_3]}
			/>
			<pointLight
				color={variant.accent}
				intensity={0.4}
				position={[LIGHT_POS_NEG_3, LIGHT_POS_NEG_2, LIGHT_POS_NEG_3]}
			/>
			<pointLight
				color={variant.secondary}
				intensity={0.3}
				position={[0, LIGHT_POS_4, LIGHT_POS_NEG_2]}
			/>

			<Float floatIntensity={0.25} rotationIntensity={0.12} speed={1}>
				<a.group ref={groupRef} scale={springs.brainScale}>
					<BrainModel>
						<a.meshStandardMaterial
							color="#2a1508"
							emissive={variant.primary}
							emissiveIntensity={springs.emissive}
							metalness={0.2}
							roughness={0.4}
							toneMapped={false}
						/>
						<Outlines
							color={variant.accent}
							opacity={0.3}
							thickness={0.006}
							transparent
						/>
					</BrainModel>

					{/* Brain-shaped glow (replaces sphere shell) */}
					<BrainModel scale={1.05}>
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
				color={variant.primary}
				count={60}
				opacity={0.3}
				scale={3.5}
				size={2}
				speed={0.25}
			/>
			<Sparkles
				color={variant.secondary}
				count={30}
				opacity={0.15}
				scale={4}
				size={1.2}
				speed={0.1}
			/>
		</>
	);
};
