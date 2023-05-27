import { ReactNode } from 'react';

interface IProps {
	k: ReactNode;
	v: ReactNode;
}

const Stat: React.FC<IProps> = ({ k, v }) => {
	return (
		<div className="flex">
			<span className="w-1/3 text-end">{k}</span>
			<span className="mx-2">:</span>
			<span className="w-1/2 text-start">{v}</span>
		</div>
	);
};

export default Stat;
