/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': {
        icon?: string;
        width?: string | number;
        className?: string;
        style?: React.CSSProperties;
        [key: string]: any;
      };
    }
  }
}

export {};
