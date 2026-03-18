export type BrainVariant = {
	id: string;
	name: string;
	description: string;
	bg: string;
	primary: string;
	secondary: string;
	accent: string;
	pointColors: string[];
};

export const VARIANTS: BrainVariant[] = [
	{
		accent: '#80deea',
		bg: '#080e1a',
		description: 'Neural network of interconnected nodes',
		id: 'constellation',
		name: 'Constellation',
		pointColors: ['#4fc3f7', '#80deea', '#e0f7fa'],
		primary: '#4fc3f7',
		secondary: '#b3e5fc'
	},
	{
		accent: '#ff6d00',
		bg: '#0d0320',
		description: 'Cosmic neural energy in deep space',
		id: 'nebula',
		name: 'Nebula',
		pointColors: ['#b388ff', '#f50057', '#ff6d00', '#e040fb'],
		primary: '#b388ff',
		secondary: '#f50057'
	},
	{
		accent: '#42a5f5',
		bg: '#060910',
		description: 'Translucent neural architecture',
		id: 'crystal',
		name: 'Crystal',
		pointColors: ['#90caf9', '#e3f2fd', '#bbdefb'],
		primary: '#90caf9',
		secondary: '#e3f2fd'
	},
	{
		accent: '#0091ea',
		bg: '#020810',
		description: 'Electric impulses across neural pathways',
		id: 'synapse',
		name: 'Synapse',
		pointColors: ['#00e5ff', '#18ffff', '#00b0ff'],
		primary: '#00e5ff',
		secondary: '#18ffff'
	},
	{
		accent: '#ff3d00',
		bg: '#120a06',
		description: 'Warm intelligence radiating knowledge',
		id: 'ember',
		name: 'Ember',
		pointColors: ['#ff6d00', '#ffab40', '#ffd180', '#ff9e80'],
		primary: '#ff6d00',
		secondary: '#ffab40'
	},
	{
		accent: '#ffd740',
		bg: '#060d12',
		description: 'Premium shifting neural interface',
		id: 'aurora',
		name: 'Aurora',
		pointColors: ['#26c6da', '#00e676', '#ffd740', '#69f0ae'],
		primary: '#26c6da',
		secondary: '#00e676'
	}
];
