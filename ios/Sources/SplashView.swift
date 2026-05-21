import SwiftUI

/// 启动屏 - ✦ Logo + 星星动画
struct SplashView: View {
    @State private var showMain = false
    @State private var scale: CGFloat = 0.5
    @State private var opacity: Double = 0
    
    var body: some View {
        ZStack {
            if showMain {
                MainTabView()
                    .transition(.opacity)
            } else {
                AppTheme.bgPrimary.ignoresSafeArea()
                
                StarFieldView()
                    .ignoresSafeArea()
                    .allowsHitTesting(false)
                
                VStack(spacing: 12) {
                    Text("✦")
                        .font(.system(size: 100))
                        .foregroundColor(AppTheme.gold)
                        .scaleEffect(scale)
                        .shadow(color: AppTheme.gold.opacity(0.4), radius: 30)
                    
                    Text("FateWise")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(AppTheme.textPrimary)
                        .opacity(opacity)
                    
                    Text("Bazi · Chinese Astrology · AI")
                        .font(.system(size: 14))
                        .foregroundColor(AppTheme.textTertiary)
                        .opacity(opacity * 0.7)
                }
                .onAppear {
                    withAnimation(.easeOut(duration: 0.8)) {
                        scale = 1.0
                        opacity = 1.0
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                        withAnimation(.easeInOut(duration: 0.5)) {
                            showMain = true
                        }
                    }
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}
