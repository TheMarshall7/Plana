import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        icon?: string;
        width?: string | number;
        className?: string;
      }, HTMLElement>;
    }
  }
}

export {};
