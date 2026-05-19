import SwiftUI

/// 主视图 - 底部 Tab 导航
struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // 底层：星星背景（全局）
            StarFieldView()
                .ignoresSafeArea()
                .allowsHitTesting(false)
            
            // 上层：Tab 内容
            TabView(selection: $selectedTab) {
                WebContainerView(title: "Home", tab: 0)
                    .tabItem {
                        Image(systemName: selectedTab == 0 ? "house.fill" : "house")
                        Text("Home")
                    }
                    .tag(0)
                
                WebContainerView(title: "Blog", tab: 1)
                    .tabItem {
                        Image(systemName: selectedTab == 1 ? "book.fill" : "book")
                        Text("Blog")
                    }
                    .tag(1)
                
                SettingsView()
                    .tabItem {
                        Image(systemName: selectedTab == 2 ? "gearshape.fill" : "gearshape")
                        Text("Settings")
                    }
                    .tag(2)
            }
            .tint(AppTheme.gold)
            // Tab Bar 背景透明
            .onAppear {
                let tabAppearance = UITabBarAppearance()
                tabAppearance.configureWithTransparentBackground()
                tabAppearance.backgroundColor = UIColor(AppTheme.bgPrimary).withAlphaComponent(0.7)
                tabAppearance.backgroundEffect = UIBlurEffect(style: .dark)
                UITabBar.appearance().standardAppearance = tabAppearance
                UITabBar.appearance().scrollEdgeAppearance = tabAppearance
            }
        }
        .ignoresSafeArea(.keyboard)
    }
}

/// 网页容器
struct WebContainerView: View {
    let title: String
    let tab: Int
    @State private var isLoading = true
    
    private var baseURL: URL {
        if title == "Blog" {
            return URL(string: "\(AppTheme.webViewURL)/blog")!
        }
        return URL(string: AppTheme.webViewURL)!
    }
    
    var body: some View {
        ZStack {
            WebView(url: baseURL)
                .background(.clear)
            
            // 加载进度指示
            if isLoading {
                VStack {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(AppTheme.gold)
                        .scaleEffect(1.2)
                    Text("Loading...")
                        .font(.caption)
                        .foregroundColor(AppTheme.textTertiary)
                        .padding(.top, 8)
                }
                .transition(.opacity)
            }
        }
        .background(AppTheme.bgPrimary)
        .onAppear {
            // 模拟加载延迟
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation { isLoading = false }
            }
        }
    }
}
