# FateWise iOS App 开发指南

## 项目概览

FateWise 是一个基于 Capacitor 的 iOS App，核心 UI 来自 Web 端 (bornchart.app)，iOS 端提供原生壳、启动屏和状态栏管理。

- **Bundle ID**: `com.fatewise.app`
- **最低支持 iOS**: 16.0
- **目标设备**: iPhone + iPad
- **Web 源**: `https://bornchart.app`
- **技术栈**: SwiftUI + Capacitor 8 + XcodeGen

---

## ⚠️ 需要老板提供的信息

### 1. Apple Developer 账号
**如果你还没有，需要注册：**
- 网址：https://developer.apple.com/programs/enroll/
- 费用：$99/年
- 公司主体需要 D-U-N-S Number

### 2. Apple Developer Team ID
注册后在 [Membership Center](https://developer.apple.com/account) 查看。
格式类似：`XXXXXXXXXX`（10 位字母数字）。

> 拿到后需要更新：
> - `ios/project.yml` 中的 `DEVELOPMENT_TEAM`
> - `ios/FateWise.xcodeproj/project.pbxproj` 中 Debug/Release 配置里的 `DEVELOPMENT_TEAM`

### 3. 签名证书（首次需要）
Mac 上首次运行时 Xcode 会自动处理，但需要：
- Apple ID 登录 Xcode
- 自动签名（个人账号）或手动签名（企业账号）

---

## 环境设置

### 1. 安装 Xcode
```bash
# App Store 下载 Xcode 16+（推荐最新稳定版）
# 或从 https://developer.apple.com/xcode/ 下载
```

### 2. 安装 XcodeGen
```bash
brew install xcodegen
```

### 3. 安装 Capacitor CLI
```bash
npm install -g @capacitor/cli @capacitor/core
```

### 4. 安装 CocoaPods（Capacitor 插件需要）
```bash
sudo gem install cocoapods
# 或
brew install cocoapods
```

---

## 构建和运行

### 日常开发

```bash
# 1. 确保 Web 端已构建
cd /home/zxw/.openclaw/workspace/ez-mystic
npm run build

# 2. 同步到 iOS 目录
npx cap sync ios

# 3. 用 XcodeGen 生成 Xcode 项目（如果 project.yml 有变更）
cd ios
xcodegen generate

# 4. 打开 Xcode
open FateWise.xcodeproj

# 5. 在 Xcode 中：
#    - 选择你的设备或模拟器
#    - 设置 Signing & Capabilities（选你的 Team）
#    - Product → Run (⌘R)
```

### 模拟器调试（快速迭代）
```bash
# 选择 iOS 模拟器后直接 Run
# Web 内容加载 bornchart.app，可以在浏览器中打开检查
```

### 真机调试
```bash
# 1. 用 USB 连接 iPhone
# 2. Xcode 中选中你的设备
# 3. 首次需要在 Xcode → Signing → 勾选 "Automatically manage signing"
# 4. Product → Run
```

---

## 发布到 App Store

### 前置条件
- ✅ Apple Developer 账号（$99/年）
- ✅ Team ID
- ✅ Mac + Xcode 16+
- ✅ 产品截图（iPhone 6.7"/6.1"/5.4" 三种尺寸）
- ✅ App Store Connect 中创建 App

### 步骤

#### 1. 在 App Store Connect 创建 App
1. 登录 https://appstoreconnect.apple.com
2. Apps → "+" 新建 App
3. 选择 **Native**，填写：
   - Name: FateWise
   - Bundle ID: `com.fatewise.app`
   - SKU: `com.fatewise.app`
   - 语言: 英语
4. 记录 App Store Connect 生成的 **Apple ID**

#### 2. 配置 App 信息
- **描述**: Free Bazi calculator and AI Chinese astrology reading
- **分类**: Lifestyle / Entertainment
- **年龄分级**: 需要回答内容分级问卷
- **版权**: © 2025 FateWise
- **URL**: https://bornchart.app

#### 3. 准备截图
- iPhone 6.7" (1290 x 2796): 3-5 张
- iPhone 6.1" (1170 x 2532): 3-5 张
- iPad 12.9" (2048 x 2732): 可选

#### 4. 构建并提交
```bash
# 1. 更新版本号
#    - ios/project.yml: CFBundleShortVersionString
#    - ios/project.yml: iOS deployment target 版本

# 2. 用 Xcode 归档
#    Product → Archive

# 3. 归档后 → Distribute App → App Store Connect → Upload

# 4. 提交到 App Store Review
#    App Store Connect → 你的 App → 版本 → App Review Information
```

#### 5. App Review 注意事项
- **隐私政策**: 需要在 bornchart.app/privacy 有隐私页面
- **用户数据**: 说明收集的数据类型（如果有）
- **App 功能**: 清晰描述 App 用途
- **联系我们**: support@bornchart.app

---

## 关键配置说明

### Info.plist 权限
当前已配置以下权限描述：
- `NSCameraUsageDescription` — 相机
- `NSPhotoLibraryUsageDescription` — 相册
- `NSMicrophoneUsageDescription` — 麦克风

> 如果后续不需要这些权限，可以删除对应条目。

### Capacitor 配置 (capacitor.config.ts)
- **SplashScreen**: 深色背景 (#0d0d1a)，2 秒自动隐藏
- **StatusBar**: 浅色文字，深色背景
- **allowNavigation**: 白名单包含 Gumroad、Paddle、Supabase 等

### project.yml (XcodeGen)
- 最低 iOS: 16.0
- 设备支持: iPhone + iPad (portrait only)
- Swift 版本: 5.9
- **DEVELOPMENT_TEAM**: 待填入

---

## 常见问题

### Q: XcodeGen generate 报错？
```bash
# 确保 Xcode 命令行工具已设置
xcode-select --switch /Applications/Xcode.app
```

### Q: 模拟器能加载 Web 内容吗？
能。模拟器有完整 Safari 引擎，可以加载 https://bornchart.app。

### Q: 真机调试白屏？
检查 Info.plist 的 `NSAppTransportSecurity` → `NSAllowsArbitraryLoads` 是否开启（已开启）。

### Q: 需要更新 App Icon？
1. 在 Xcode 中打开 Asset Catalog
2. 拖入对应尺寸的图标
3. 或生成后替换 `ios/FateWise/Images.xcassets/AppIcon.appiconset/` 中的图片

### Q: 如何切换 Web 源为本地开发？
编辑 `capacitor.config.ts` 中的 `server.url`：
```typescript
url: 'http://192.168.x.x:3000',  // 本机 IP:3000
```

---

## 文件结构

```
ios/
├── project.yml              # XcodeGen 配置
├── FateWise.xcodeproj/      # Xcode 项目（由 XcodeGen 生成）
├── FateWise/
│   └── Info.plist           # 权限和元数据
└── Sources/
    ├── FateWiseApp.swift    # App 入口
    ├── Constants.swift      # 主题色和常量
    ├── WebView.swift        # WKWebView 封装
    ├── MainTabView.swift    # 底部 Tab 导航
    ├── SplashView.swift     # 启动屏
    ├── StarFieldView.swift  # 星星背景
    └── SettingsView.swift   # 设置页
```
