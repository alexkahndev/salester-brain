import { shaderMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { AdditiveBlending, DoubleSide } from 'three';

import {
	HEX_B_END,
	HEX_G_END,
	HEX_RADIX,
	HEX_R_END,
	RGB_MAX,
	WAVE_COLOR_B,
	WAVE_COLOR_G,
	WAVE_COLOR_R
} from '../../../../constants';
import { BrainModel } from './BrainModel';

const WaveMaterial = shaderMaterial(
	{
		uActivity: 0,
		uColor: [WAVE_COLOR_R, WAVE_COLOR_G, WAVE_COLOR_B],
		uTime: 0
	},
	/* vertex */ `
		varying vec3 vPos;
		varying vec3 vNormal;
		void main() {
			vPos = position;
			vNormal = normalize(normalMatrix * normal);
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	/* fragment */ `
		uniform float uTime;
		uniform float uActivity;
		uniform vec3 uColor;
		varying vec3 vPos;
		varying vec3 vNormal;

		void main() {
			if (uActivity < 0.01) discard;

			// Traveling wave from bottom to top
			float wave1 = sin(vPos.y * 12.0 - uTime * 4.0) * 0.5 + 0.5;
			wave1 = pow(wave1, 6.0);

			// Second wave at diagonal angle
			float d = dot(normalize(vPos.xz), vec2(0.7, 0.7));
			float wave2 = sin(d * 80.0 - uTime * 3.0) * 0.5 + 0.5;
			wave2 = pow(wave2, 6.0);

			// Radial pulse from center
			float dist = length(vPos) / 120.0;
			float pulse = sin(dist * 20.0 - uTime * 5.0) * 0.5 + 0.5;
			pulse = pow(pulse, 5.0);

			float combined = max(wave1, max(wave2 * 0.6, pulse * 0.5));

			// Fade in/out based on activity
			float alpha = uActivity * combined * 0.3;

			// Subtle base pulse
			alpha += uActivity * (sin(uTime * 3.0) * 0.5 + 0.5) * 0.02;

			gl_FragColor = vec4(uColor * 1.5, alpha);
		}
	`
);

type ThinkingWavesProps = {
	activity: number;
	color: string;
};

export const ThinkingWaves = ({ activity, color }: ThinkingWavesProps) => {
	const waveMat = useMemo(() => {
		const mat = new WaveMaterial();
		mat.transparent = true;
		mat.depthWrite = false;
		Object.assign(mat, { blending: AdditiveBlending, side: DoubleSide });

		return mat;
	}, []);

	useFrame(({ clock }) => {
		waveMat.uTime = clock.getElapsedTime();
		waveMat.uActivity = activity;

		const hex = color.replace('#', '');
		waveMat.uColor = [
			parseInt(hex.slice(0, HEX_R_END), HEX_RADIX) / RGB_MAX,
			parseInt(hex.slice(HEX_R_END, HEX_G_END), HEX_RADIX) / RGB_MAX,
			parseInt(hex.slice(HEX_G_END, HEX_B_END), HEX_RADIX) / RGB_MAX
		];
	});

	return (
		<BrainModel scale={1.01}>
			<primitive attach="material" object={waveMat} />
		</BrainModel>
	);
};
