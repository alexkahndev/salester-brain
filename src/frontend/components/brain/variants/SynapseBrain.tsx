import { useSpring, a } from '@react-spring/three';
import { Float, Edges, Sparkles, shaderMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { DoubleSide, AdditiveBlending, type Group } from 'three';
import {
	ACTIVITY_SCALE,
	HEX_B_END,
	HEX_G_END,
	HEX_RADIX,
	HEX_R_END,
	LIGHT_POS_3,
	RGB_MAX,
	ROTATION_AMP,
	ROTATION_SPEED,
	SYNAPSE_COLOR_G
} from '../../../../constants';
import { BrainModel } from '../BrainModel';
import { MemoryPoints } from '../MemoryPoints';
import { ThinkingWaves } from '../ThinkingWaves';
import type { BrainVariant } from '../styles';

const PulseMaterial = shaderMaterial(
	{ uActivity: 0, uColor: [0, SYNAPSE_COLOR_G, 1], uTime: 0 },
	/* vertex */ `
		varying vec3 vNormal;
		varying vec3 vViewPosition;
		varying float vY;
		void main() {
			vNormal = normalize(normalMatrix * normal);
			vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
			vViewPosition = -mvPos.xyz;
			vY = position.y;
			gl_Position = projectionMatrix * mvPos;
		}
	`,
	/* fragment */ `
		uniform float uTime;
		uniform float uActivity;
		uniform vec3 uColor;
		varying vec3 vNormal;
		varying vec3 vViewPosition;
		varying float vY;
		void main() {
			vec3 viewDir = normalize(vViewPosition);
			float fresnel = 1.0 - abs(dot(viewDir, normalize(vNormal)));
			fresnel = pow(fresnel, 2.0);

			float scanSpeed = 1.5 + uActivity * 4.0;
			float scan = sin(vY * 25.0 - uTime * scanSpeed);
			scan = smoothstep(0.0, 0.08, scan) * 0.2;

			float beam = fract(-vY * 0.4 + uTime * 0.25);
			beam = pow(beam, 12.0) * 0.6;

			vec3 color = mix(uColor * 0.8, vec3(1.0), fresnel);
			float alpha = fresnel * 0.25 + scan + beam + uActivity * 0.06;
			gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.75));
		}
	`
);

type BrainVariantProps = {
	activity: number;
	memoryCount: number;
	variant: BrainVariant;
};

export const SynapseBrain = ({
	activity,
	variant,
	memoryCount
}: BrainVariantProps) => {
	const groupRef = useRef<Group>(null);

	const pulseMat = useMemo(() => {
		const mat = new PulseMaterial();
		mat.transparent = true;
		mat.depthWrite = false;
		Object.assign(mat, { side: DoubleSide });

		return mat;
	}, []);

	const springs = useSpring({
		brainScale: 1 + activity * ACTIVITY_SCALE,
		config: { friction: 26, mass: 1.5, tension: 200 }
	});

	useFrame(({ clock }) => {
		const elapsed = clock.getElapsedTime();
		pulseMat.uTime = elapsed;
		pulseMat.uActivity = activity;

		// Parse hex to RGB for shader
		const hex = variant.primary.replace('#', '');
		pulseMat.uColor = [
			parseInt(hex.slice(0, HEX_R_END), HEX_RADIX) / RGB_MAX,
			parseInt(hex.slice(HEX_R_END, HEX_G_END), HEX_RADIX) / RGB_MAX,
			parseInt(hex.slice(HEX_G_END, HEX_B_END), HEX_RADIX) / RGB_MAX
		];

		if (groupRef.current) {
			groupRef.current.rotation.y =
				Math.sin(elapsed * ROTATION_SPEED) * ROTATION_AMP;
		}
	});

	return (
		<>
			<ambientLight intensity={0.1} />
			<pointLight
				color={variant.primary}
				intensity={0.6}
				position={[LIGHT_POS_3, LIGHT_POS_3, LIGHT_POS_3]}
			/>

			<Float floatIntensity={0.2} rotationIntensity={0.1} speed={1}>
				<a.group ref={groupRef} scale={springs.brainScale}>
					{/* Holographic surface */}
					<BrainModel>
						<primitive attach="material" object={pulseMat} />
						<Edges
							color={variant.primary}
							lineWidth={1}
							opacity={0.4}
							threshold={15}
							transparent
						/>
					</BrainModel>

					{/* Inner wireframe glow */}
					<BrainModel scale={0.98}>
						<meshBasicMaterial
							blending={AdditiveBlending}
							color={variant.primary}
							depthWrite={false}
							opacity={0.08}
							transparent
							wireframe
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
				count={35}
				opacity={0.3}
				scale={3}
				size={1.8}
				speed={0.4}
			/>
		</>
	);
};
