import SwiftUI

/// 应用主题色和常量
enum AppTheme {
    // 颜色
    static let gold = Color(red: 0.788, green: 0.659, blue: 0.325)       // #C9A84C
    static let goldLight = Color(red: 0.91, green: 0.79, blue: 0.48)     // #E8C97A
    static let goldDark = Color(red: 0.55, green: 0.45, blue: 0.20)      // 暗金色
    static let bgPrimary = Color(red: 0.051, green: 0.051, blue: 0.098)  // #0D0D1A
    static let bgSecondary = Color(red: 0.09, green: 0.09, blue: 0.16)   // 稍亮深色
    static let bgCard = Color(red: 0.14, green: 0.14, blue: 0.22)        // 卡片背景
    static let textPrimary = Color(red: 0.96, green: 0.94, blue: 0.91)   // 主文本
    static let textSecondary = Color(red: 0.63, green: 0.60, blue: 0.53) // 次要文本
    static let textTertiary = Color(red: 0.42, green: 0.40, blue: 0.36)  // 第三级文本
    static let separator = Color(white: 1.0, opacity: 0.08)              // 分割线
    static let surface = Color(red: 0.12, green: 0.12, blue: 0.20)      // 表面色
    
    // 功能
    static let webViewURL = "https://bornchart.app"
    static let supportEmail = "support@bornchart.app"
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    static let termsURL = "https://bornchart.app/terms"
    static let privacyURL = "https://bornchart.app/privacy"
    static let refundURL = "https://bornchart.app/refund"
    
    // 布局
    static let cornerRadius: CGFloat = 12
    static let cardPadding: CGFloat = 16
}
