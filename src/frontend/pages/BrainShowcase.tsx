import { Head } from '../components/Head';
import { BrainApp } from '../components/brain/BrainApp';

type BrainShowcaseProps = {
	cssPath: string;
};

export const BrainShowcase = ({ cssPath }: BrainShowcaseProps) => (
	<html>
		<Head
			cssPath={cssPath}
			description="Interactive 3D AI Brain Interface"
			font="Inter"
			title="Salester Brain"
		/>
		<body>
			<BrainApp />
		</body>
	</html>
);
