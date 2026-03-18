import { useSpring, a } from '@react-spring/three';
import { Float, Stars, Sparkles, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import {
	ACTIVITY_SCALE,
	LIGHT_POS_4,
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

export const ConstellationBrain = ({
	activity,
	variant,
	memoryCount
}: BrainVariantProps) => {
	const groupRef = useRef<Group>(null);

	const { brainScale } = useSpring({
		brainScale: 1 + activity * ACTIVITY_SCALE,
		config: { friction: 30, mass: 2, tension: 170 }
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
			<Stars
				count={2500}
				depth={50}
				factor={3}
				fade
				radius={80}
				speed={0.4}
			/>
			<ambientLight intensity={0.12} />
			<pointLight
				color={variant.primary}
				intensity={0.4}
				position={[LIGHT_POS_4, LIGHT_POS_4, LIGHT_POS_4]}
			/>

			<Float floatIntensity={0.3} rotationIntensity={0.15} speed={1}>
				<a.group ref={groupRef} scale={brainScale}>
					{/* Subtle brain fill + clean edge lines (no wireframe overlay) */}
					{/* Internal structure lines */}
					<BrainModel>
						<meshBasicMaterial
							color={variant.primary}
							depthWrite={false}
							opacity={0.04}
							polygonOffset
							polygonOffsetFactor={1}
							polygonOffsetUnits={1}
							transparent
						/>
						<Edges
							color={variant.primary}
							lineWidth={1}
							opacity={0.35}
							threshold={60}
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
				color={variant.accent}
				count={40}
				opacity={0.25}
				scale={4}
				size={1.2}
				speed={0.2}
			/>
		</>
	);
};
