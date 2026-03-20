import { useSpring, a } from '@react-spring/three';
import { Float, Sparkles, Edges, shaderMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { DoubleSide, AdditiveBlending, type Group } from 'three';
import {
	ACTIVITY_SCALE,
	LIGHT_POS_2,
	LIGHT_POS_3,
	LIGHT_POS_4,
	LIGHT_POS_NEG_3,
	ROTATION_AMP,
	ROTATION_SPEED
} from '../../../../constants';
import { BrainModel } from '../BrainModel';
import { MemoryPoints } from '../MemoryPoints';
import { ThinkingWaves } from '../ThinkingWaves';
import type { BrainVariant } from '../styles';

const AuroraMaterial = shaderMaterial(
	{ uActivity: 0, uTime: 0 },
	/* vertex */ `
		varying vec3 vNormal;
		varying vec3 vViewPosition;
		varying vec3 vWorldPos;
		void main() {
			vNormal = normalize(normalMatrix * normal);
			vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
			vViewPosition = -mvPos.xyz;
			vWorldPos = position;
			gl_Position = projectionMatrix * mvPos;
		}
	`,
	/* fragment */ `
		uniform float uTime;
		uniform float uActivity;
		varying vec3 vNormal;
		varying vec3 vViewPosition;
		varying vec3 vWorldPos;
		void main() {
			vec3 viewDir = normalize(vViewPosition);
			float fresnel = 1.0 - abs(dot(viewDir, normalize(vNormal)));
			fresnel = pow(fresnel, 1.8);

			// Shifting iridescent color
			float shift = vWorldPos.y * 3.0 + uTime * 0.3;
			vec3 c1 = vec3(0.15, 0.78, 0.85); // teal
			vec3 c2 = vec3(0.0, 0.9, 0.46);   // green
			vec3 c3 = vec3(1.0, 0.84, 0.25);   // gold

			float t1 = sin(shift) * 0.5 + 0.5;
			float t2 = sin(shift + 2.094) * 0.5 + 0.5;
			vec3 color = c1 * t1 + c2 * t2 + c3 * (1.0 - t1 - t2 + t1 * t2);
			color = mix(color * 0.6, color, fresnel);

			float alpha = fresnel * 0.6 + 0.15 + uActivity * 0.08;
			gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.85));
		}
	`
);

type BrainVariantProps = {
	activity: number;
	memoryCount: number;
	variant: BrainVariant;
};

export const AuroraBrain = ({
	activity,
	variant,
	memoryCount
}: BrainVariantProps) => {
	const groupRef = useRef<Group>(null);

	const auroraMat = useMemo(() => {
		const mat = new AuroraMaterial();
		mat.transparent = true;
		mat.depthWrite = false;
		Object.assign(mat, { side: DoubleSide });

		return mat;
	}, []);

	const springs = useSpring({
		brainScale: 1 + activity * ACTIVITY_SCALE,
		config: { friction: 30, mass: 2, tension: 160 }
	});

	useFrame(({ clock }) => {
		const elapsed = clock.getElapsedTime();
		auroraMat.uTime = elapsed;
		auroraMat.uActivity = activity;
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
				intensity={0.7}
				position={[LIGHT_POS_4, LIGHT_POS_4, LIGHT_POS_4]}
			/>
			<pointLight
				color={variant.secondary}
				intensity={0.4}
				position={[LIGHT_POS_NEG_3, LIGHT_POS_2, LIGHT_POS_NEG_3]}
			/>
			<pointLight
				color={variant.accent}
				intensity={0.3}
				position={[0, LIGHT_POS_NEG_3, LIGHT_POS_3]}
			/>

			<Float floatIntensity={0.2} rotationIntensity={0.1} speed={0.8}>
				<a.group ref={groupRef} scale={springs.brainScale}>
					<BrainModel>
						<primitive attach="material" object={auroraMat} />
						<Edges
							color={variant.primary}
							lineWidth={1}
							opacity={0.25}
							threshold={20}
							transparent
						/>
					</BrainModel>

					{/* Brain-shaped glow (replaces sphere shell) */}
					<BrainModel scale={1.05}>
						<meshBasicMaterial
							blending={AdditiveBlending}
							color={variant.primary}
							depthWrite={false}
							opacity={0.06}
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
				count={45}
				opacity={0.25}
				scale={3.5}
				size={1.8}
				speed={0.2}
			/>
			<Sparkles
				color={variant.accent}
				count={25}
				opacity={0.15}
				scale={4}
				size={1}
				speed={0.1}
			/>
		</>
	);
};
