import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// VOLTA design tokens
const VOLTA_INK      = '#1a2844'; // primary dark navy
const VOLTA_INK_2    = '#2a3a62'; // hover state
const VOLTA_ACCENT   = '#3a9456'; // green accent
const VOLTA_BG       = '#f7f6f3'; // off-white content bg
const VOLTA_LINE     = '#e2e4ec'; // border color
const VOLTA_TEXT_2   = '#6b7a9e'; // secondary text

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary:        VOLTA_INK,
            colorSuccess:        VOLTA_ACCENT,
            colorWarning:        '#d4891a',
            colorError:          '#d94f3d',
            colorInfo:           VOLTA_INK,
            colorLink:           VOLTA_INK,
            colorTextSecondary:  VOLTA_TEXT_2,
            colorBorder:         VOLTA_LINE,
            colorBorderSecondary: VOLTA_LINE,
            colorBgLayout:       VOLTA_BG,
            colorBgContainer:    '#ffffff',
            colorBgElevated:     '#ffffff',
            borderRadius:        4,
            borderRadiusLG:      6,
            borderRadiusSM:      2,
            fontFamily:          "'Inter', system-ui, -apple-system, sans-serif",
            fontSize:            14,
            fontSizeLG:          15,
            lineHeight:          1.6,
            controlHeight:       36,
          },
          components: {
            Button: {
              fontWeight: 600,
              letterSpacing: '0.02em',
              primaryColor: '#ffffff',
            },
            Menu: {
              darkItemBg:             VOLTA_INK,
              darkSubMenuItemBg:      VOLTA_INK_2,
              darkItemSelectedBg:     VOLTA_INK_2,
              darkItemHoverBg:        VOLTA_INK_2,
              darkItemColor:          'rgba(255,255,255,0.72)',
              darkItemSelectedColor:  '#ffffff',
              darkItemHoverColor:     '#ffffff',
              itemBorderRadius:       4,
              activeBarBorderWidth:   0,
            },
            Table: {
              headerBg:        '#f0f1f5',
              headerColor:     VOLTA_INK,
              headerSortActiveBg: '#e8eaf0',
              rowHoverBg:      '#f7f8fc',
              borderColor:     VOLTA_LINE,
            },
            Card: {
              headerBg:      '#ffffff',
              borderRadius:  6,
            },
            Statistic: {
              titleFontSize: 12,
            },
            Modal: {
              borderRadius: 6,
            },
            Select: {
              borderRadius: 4,
            },
            Input: {
              borderRadius: 4,
            },
            Tag: {
              borderRadius: 3,
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>,
);
