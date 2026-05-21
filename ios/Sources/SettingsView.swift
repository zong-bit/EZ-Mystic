import SwiftUI

/// 原生设置页面
struct SettingsView: View {
    @State private var darkMode = true
    @State private var showClearCacheAlert = false
    @State private var cacheCleared = false
    
    var body: some View {
        NavigationView {
            ZStack {
                AppTheme.bgPrimary.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // 品牌标头
                        VStack(spacing: 8) {
                            Text("✦")
                                .font(.system(size: 48))
                                .foregroundColor(AppTheme.gold)
                            Text("FateWise")
                                .font(.title2.bold())
                                .foregroundColor(AppTheme.textPrimary)
                            Text("Version \(AppTheme.appVersion)")
                                .font(.caption)
                                .foregroundColor(AppTheme.textTertiary)
                        }
                        .padding(.top, 40)
                        .padding(.bottom, 20)
                        
                        // 设置项
                        settingsCard {
                            settingsRow(icon: "moon.stars", title: "Dark Mode") {
                                Toggle("", isOn: $darkMode)
                                    .tint(AppTheme.gold)
                            }
                            
                            Divider().background(AppTheme.separator)
                            
                            settingsRow(icon: "trash", title: "Clear Cache") {
                                Button("Clear") {
                                    showClearCacheAlert = true
                                }
                                .font(.subheadline)
                                .foregroundColor(AppTheme.textTertiary)
                            }
                            .alert("Clear Cache?", isPresented: $showClearCacheAlert) {
                                Button("Cancel", role: .cancel) {}
                                Button("Clear", role: .destructive) {
                                    clearWebCache()
                                    cacheCleared = true
                                }
                            } message: {
                                Text("This will clear all cached data and reload the app.")
                            }
                        }
                        
                        // 链接
                        settingsCard {
                            linkRow(icon: "doc.text", title: "Terms of Service", url: AppTheme.termsURL)
                            Divider().background(AppTheme.separator)
                            linkRow(icon: "hand.raised", title: "Privacy Policy", url: AppTheme.privacyURL)
                            Divider().background(AppTheme.separator)
                            linkRow(icon: "arrow.counterclockwise", title: "Refund Policy", url: AppTheme.refundURL)
                        }
                        
                        // 支持
                        settingsCard {
                            settingsRow(icon: "envelope", title: "Contact Support") {
                                Button("Email") {
                                    if let url = URL(string: "mailto:\(AppTheme.supportEmail)") {
                                        UIApplication.shared.open(url)
                                    }
                                }
                                .font(.subheadline)
                                .foregroundColor(AppTheme.gold)
                            }
                        }
                        
                        // 底部信息
                        Text("© 2026 BornChart · FateWise")
                            .font(.caption2)
                            .foregroundColor(AppTheme.textTertiary)
                            .padding(.top, 10)
                        
                        Text("Disclaimer: For entertainment and educational purposes only.")
                            .font(.caption2)
                            .foregroundColor(AppTheme.textTertiary.opacity(0.5))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
        }
        .navigationViewStyle(.stack)
    }
    
    // MARK: - 清空 Web 缓存
    private func clearWebCache() {
        let websiteDataTypes = WKWebsiteDataStore.allWebsiteDataTypes()
        let date = Date(timeIntervalSince1970: 0)
        WKWebsiteDataStore.default().removeData(ofTypes: websiteDataTypes, modifiedSince: date) {
            cacheCleared = true
        }
    }
}

// MARK: - 组件
private func settingsCard<Content: View>(@ViewBuilder content: () -> Content) -> some View {
    VStack(spacing: 0) {
        content()
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 8)
    .background(AppTheme.surface)
    .cornerRadius(16)
    .overlay(
        RoundedRectangle(cornerRadius: 16)
            .stroke(AppTheme.separator, lineWidth: 1)
    )
}

private func settingsRow<Content: View>(
    icon: String,
    title: String,
    @ViewBuilder trailing: () -> Content
) -> some View {
    HStack(spacing: 12) {
        Image(systemName: icon)
            .foregroundColor(AppTheme.gold)
            .frame(width: 24)
        Text(title)
            .foregroundColor(AppTheme.textPrimary)
            .font(.subheadline)
        Spacer()
        trailing()
    }
    .padding(.vertical, 8)
}

private func linkRow(icon: String, title: String, url: String) -> some View {
    Button {
        if let link = URL(string: url) {
            UIApplication.shared.open(link)
        }
    } label: {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(AppTheme.gold)
                .frame(width: 24)
            Text(title)
                .foregroundColor(AppTheme.textPrimary)
                .font(.subheadline)
            Spacer()
            Image(systemName: "arrow.up.right")
                .font(.caption2)
                .foregroundColor(AppTheme.textTertiary)
        }
        .padding(.vertical, 8)
    }
}

// 需要导入 WebKit 用于清缓存
import WebKit
