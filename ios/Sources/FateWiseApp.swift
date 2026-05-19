import SwiftUI
import WebKit

/// 封装 WKWebView 用于 SwiftUI
struct WebView: UIViewRepresentable {
    let url: URL
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        
        // 允许透明背景
        config.allowsInlineMediaPlayback = true
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.backgroundColor = .clear
        webView.isOpaque = false
        webView.scrollView.backgroundColor = .clear
        
        // 禁止网页内的手势冲突
        webView.allowsBackForwardNavigationGestures = true
        
        let request = URLRequest(url: url)
        webView.load(request)
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {}
}

/// 应用主色
enum AppTheme {
    static let gold = Color(red: 0.788, green: 0.659, blue: 0.325)   // #C9A84C
    static let goldLight = Color(red: 0.91, green: 0.79, blue: 0.48) // #E8C97A
    static let bgPrimary = Color(red: 0.05, green: 0.05, blue: 0.10) // #0D0D1A
    static let textPrimary = Color(red: 0.96, green: 0.94, blue: 0.91)
    static let textSecondary = Color(red: 0.63, green: 0.60, blue: 0.53)
}

/// App 主视图：星星背景 + WebView
struct ContentView: View {
    var body: some View {
        ZStack {
            // 底层：原生星星动画
            StarFieldView()
                .ignoresSafeArea()
                .allowsHitTesting(false) // 不拦截触摸
            
            // 上层：网页内容
            if let url = URL(string: "https://bornchart.app") {
                WebView(url: url)
                    .background(.clear)
            }
        }
        .background(AppTheme.bgPrimary)
        .ignoresSafeArea()
        .preferredColorScheme(.dark)
    }
}

@main
struct FateWiseApp: App {
    var body: some Scene {
        WindowGroup {
            SplashView()
        }
    }
}

/// 启动屏
struct SplashView: View {
    @State private var showMain = false
    
    var body: some View {
        ZStack {
            if showMain {
                ContentView()
                    .transition(.opacity)
            } else {
                AppTheme.bgPrimary
                    .ignoresSafeArea()
                
                StarFieldView()
                    .ignoresSafeArea()
                    .allowsHitTesting(false)
                
                VStack(spacing: 16) {
                    Text("✦")
                        .font(.system(size: 80))
                        .foregroundColor(AppTheme.gold)
                    
                    Text("FateWise")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(AppTheme.textPrimary)
                }
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                withAnimation(.easeInOut(duration: 0.8)) {
                    showMain = true
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
