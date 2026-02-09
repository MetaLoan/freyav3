import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * 自定义 HTML 模板
 * 用于 GitHub Pages 部署时正确处理 base path
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        
        {/* GitHub Pages SPA 重定向处理 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // GitHub Pages SPA 重定向处理
            (function(l) {
              if (l.search[1] === '/' ) {
                var decoded = l.search.slice(1).split('&').map(function(s) { 
                  return s.replace(/~and~/g, '&')
                }).join('?');
                window.history.replaceState(null, null,
                  l.pathname.slice(0, -1) + decoded + l.hash
                );
              }
            }(window.location))
          `
        }} />
        
        <ScrollViewStyleReset />
        
        {/* 隐藏滚动条样式 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar {
              -ms-overflow-style: none; /* IE/Edge */
              scrollbar-width: none; /* Firefox */
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none; /* Chrome/Safari/WebKit */
              width: 0;
              height: 0;
            }
            .no-scrollbar::-webkit-scrollbar-track {
              display: none;
            }
            .no-scrollbar::-webkit-scrollbar-thumb {
              display: none;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
