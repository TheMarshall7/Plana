/// <reference types="vite/client" />
/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': {
        icon?: string;
        width?: string | number;
        height?: string | number;
        flip?: string;
        rotate?: string;
        inline?: boolean;
        className?: string;
        style?: React.CSSProperties;
        onClick?: React.MouseEventHandler<HTMLElement>;
        onMouseEnter?: React.MouseEventHandler<HTMLElement>;
        onMouseLeave?: React.MouseEventHandler<HTMLElement>;
        [key: string]: any;
      };
    }
  }
}

export { };
