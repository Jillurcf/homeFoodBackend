import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconTopArrowProps = {
  size?: number;
  color?: string;
};

const IconArrow: React.FC<IconTopArrowProps> = ({ size = 24, color = '#949494' }) => {
  return (
    <Svg
      width={size}
      height={(size * 8) / 13}
      viewBox="0 0 13 8"
      fill="none"
      style={{ transform: [{ scaleY: -1 }] }} 
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2499 7.9585L6.49992 3.2085L1.74992 7.9585L0.166585 6.37516L6.49992 0.0418301L12.8333 6.37516L11.2499 7.9585Z"
        fill={color}
      />
    </Svg>
  );
};

export default IconArrow;
