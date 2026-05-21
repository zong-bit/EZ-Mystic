import SwiftUI
import WebKit

/// 主视图 - 底部 Tab 导航
struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        ZStack {
            // 底层：星星背景
            StarFieldView()
                .ignoresSafeArea()
                .allowsHitTesting(false)
            
            // 上层：Tab 内容
            TabView(selection: $selectedTab) {
                WebContainerView(url: AppTheme.webViewURL, title: "Home")
                    .tabItem {
                        Image(systemName: selectedTab == 0 ? "house.fill" : "house")
                        Text("Home")
                    }
                    .tag(0)
                
                WebContainerView(url: "\(AppTheme.webViewURL)/chat", title: "Chat")
                    .tabItem {
                        Image(systemName: selectedTab == 1 ? "message.fill" : "message")
                        Text("Chat")
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
        }
        .ignoresSafeArea(.keyboard)
        .preferredColorScheme(.dark)
    }
}

/// 网页容器 - 透明背景
struct WebContainerView: View {
    let url: String
    let title: String
    @State private var isLoading = true
    
    var body: some View {
        ZStack {
            Color.clear
            
            if let url = URL(string: url) {
                WebView(url: url)
            }
            
            if isLoading {
                VStack(spacing: 12) {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(AppTheme.gold)
                        .scaleEffect(1.5)
                    Text("Loading...")
                        .font(.subheadline)
                        .foregroundColor(AppTheme.textTertiary)
                }
                .transition(.opacity.animation(.easeInOut(duration: 0.3)))
            }
        }
        .background(Color.clear)
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                withAnimation { isLoading = false }
            }
        }
    }
}
