declare const process: any;

const isProd = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';

export const warn = (...args: any[]) => {
  if (!isProd) {
    console.warn(...args);
  }
};

export const error = (...args: any[]) => {
  if (!isProd) {
    console.error(...args);
  }
};

export const info = (...args: any[]) => {
  if (!isProd) {
    console.warn(...args);
  }
};
