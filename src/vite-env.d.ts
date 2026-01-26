/// <reference types="vite/client" />

import type * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.HTMLAttributes<HTMLElement> & {
        icon?: string;
        width?: string | number;
        height?: string | number;
        flip?: string;
        rotate?: string;
        inline?: boolean;
      };
    }
  }
}
