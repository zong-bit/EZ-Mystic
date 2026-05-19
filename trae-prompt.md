# Trae 完整提示词 — FateWise iOS App

## 项目概述
FateWise 是一个 AI 八字（Bazi/Four Pillars of Destiny）占星平台，目前已有一个 Next.js 网页版（bornchart.app）。现在要做一个原生 iOS App，用 Swift 开发，上架 App Store。

## 技术选型
- **UI 框架**: SwiftUI + UIKit 混合
- **网页内容**: WKWebView（加载现有 bornchart.app 页面）
- **背景动画**: SpriteKit 粒子系统（原生星星，120fps）
- **架构**: MVVM
- **最低部署目标**: iOS 16.0

## App 结构

```
FateWise/
├── App/
│   ├── App.swift                    # 入口
│   ├── ContentView.swift            # 主容器（星星背景 + WKWebView）
│   ├── WebView.swift                # WKWebView 封装
│   ├── StarFieldView.swift          # SpriteKit 原生星空动画
│   ├── StarScene.swift              # SKScene 粒子系统
│   ├── Constants.swift              # 常量、颜色、配置
│   └── Info.plist                   # 应用配置
├── Models/
│   ├── BaziChart.swift              # 八字数据结构
│   ├── Token.swift                  # Token/订阅模型
│   └── Settings.swift               # 用户设置
├── ViewModels/
│   └── WebViewModel.swift           # WebView 状态管理
├── Views/
│   ├── SplashView.swift             # 启动屏（带星星动画）
│   ├── TabBarView.swift             # 底部 Tab 导航
│   └── SettingsView.swift           # 设置页面
├── Services/
│   ├── DeepSeekService.swift        # AI 解读 API 封装
│   ├── PaymentService.swift         # 支付处理
│   └── TokenManager.swift           # Token 管理
└── Resources/
    ├── Assets.xcassets/
    └── LaunchScreen.storyboard
```

## 需要逐个实现的功能

### 1. App 入口 + 主题
- App.swift — @main 入口，初始化全局主题
- 主题色：主色 #C9A84C（金色），背景 #0D0D1A（深色）
- 支持 Dark Mode（强制深色）

### 2. 原生星空动画（核心！）
- StarScene.swift — 继承 SKScene，使用 SKEmitterNode 或自定义粒子
- 生成 500-800 颗星星，随机大小、亮度、闪烁速度
- 星星颜色：白色/淡金色混合，随机透明度
- 60fps（弱设备）到 120fps（ProMotion）
- 低电量模式降低粒子数到 200 颗
- 内存优化：使用 SKTextureAtlas 预加载纹理

### 3. WKWebView 封装
- WebView.swift — 符合 UIViewRepresentable，嵌入 SwiftUI
- 加载 URL：https://bornchart.app
- 处理导航：拦截支付回调 URL，调用原生支付接口
- Cookie 管理：保持登录状态
- JavaScript Bridge：用于 Web 和 Native 通信
- 下拉刷新支持
- 加载进度条（原生，非网页的）

### 4. 主视图布局
- ContentView.swift — ZStack 布局
  - 底层：StarFieldView（全屏星星动画）
  - 上层：WebView（透明背景，毛玻璃效果边框）
- TabBarView.swift — 底部导航
  - 首页（WebView 加载 /bazi）
  - 博客（WebView 加载 /blog）
  - 设置（原生 SettingsView）

### 5. 启动屏
- SplashView.swift — 展示品牌 Logo（✦ 字符）+ 星星动画
- 2秒后渐变过渡到主界面
- 支持 Light/Dark 模式

### 6. 设置页面
- SettingsView.swift — 原生 SwiftUI
  - 账户信息（显示登录邮箱）
  - App 版本号
  - 清除缓存按钮
  - 联系支持（mailto:support@bornchart.app）
  - Terms / Privacy / Refund 链接
  - 深色模式开关

### 7. 支付集成
- 支付通过 WKWebView 中的网页端 Paddle/Gumroad 完成
- 支付成功后，通过 JavaScript Bridge 通知原生层
- TokenManager.swift 管理本地 Token 存储

## 代码规范
- 使用 SwiftLint 风格（符合官方 Swift API Design Guidelines）
- 所有 View 用 `struct`，需要继承的用 `final class`
- 使用 `@MainActor` 标记 UI 相关方法
- error 处理使用 `throws` + 自定义 `AppError` 枚举
- 所有字符串使用 `String(localized:)` 支持本地化
- MARK: 注释标记代码分区

## 特别要求
1. 星星动画必须原生 60fps+，不能有掉帧
2. WKWebView 和星星动画之间不能互相遮挡导致性能问题
3. 内存占用控制在 80MB 以下（不含 WebView 本身）
4. 启动时间控制在 2 秒内
5. 支持 iPhone 全系（SE 到 Pro Max）
6. 横竖屏自适应

## 实现顺序
1. 先建项目结构、主题色、Constants
2. 做星星动画（最核心，先跑起来看效果）
3. 做 WKWebView 封装
4. 组合主视图（星星 + WebView）
5. 做启动屏
6. 做设置页
7. 整体联调、测试

## 运行方式
在 Xcode 中用 iPhone 模拟器或真机运行。
