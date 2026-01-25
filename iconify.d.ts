/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    'iconify-icon': {
      icon?: string;
      width?: string | number;
      height?: string | number;
      className?: string;
      style?: React.CSSProperties;
      onClick?: React.MouseEventHandler<HTMLElement>;
      [key: string]: any;
    };
  }
}
