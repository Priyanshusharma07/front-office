import { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#6366f1', // Indigo 500
    borderRadius: 8,
    fontFamily: 'var(--font-geist-sans)',
  },
  components: {
    Button: {
      controlHeight: 40,
      fontWeight: 600,
    },
    Input: {
      controlHeight: 40,
    },
    Card: {
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
  },
};
