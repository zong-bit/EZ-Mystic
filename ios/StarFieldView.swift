import SwiftUI
import SpriteKit

/// 原生星空粒子动画
/// 使用 SpriteKit 粒子系统，60-120fps，支持低电量模式
struct StarFieldView: UIViewRepresentable {
    
    func makeUIView(context: Context) -> SKView {
        let skView = SKView()
        skView.backgroundColor = .clear
        skView.isOpaque = false
        
        let scene = StarScene()
        scene.backgroundColor = .clear
        scene.scaleMode = .resizeFill
        
        skView.presentScene(scene)
        
        // 低电量模式自动降帧
        if ProcessInfo.processInfo.isLowPowerModeEnabled {
            skView.preferredFramesPerSecond = 30
        }
        
        return skView
    }
    
    func updateUIView(_ uiView: SKView, context: Context) {}
}

class StarScene: SKScene {
    
    private var stars: [SKShapeNode] = []
    private let starCount: Int = 600
    
    override func didMove(to view: SKView) {
        backgroundColor = .clear
        generateStars()
    }
    
    private func generateStars() {
        for _ in 0..<starCount {
            let size = CGFloat.random(in: 0.5...2.5)
            let star = SKShapeNode(circleOfRadius: size)
            
            // 随机星色：白/淡金混合
            let brightness = CGFloat.random(in: 0.6...1.0)
            if Bool.random() {
                star.fillColor = UIColor(white: brightness, alpha: 1)
            } else {
                star.fillColor = UIColor(
                    red: brightness,
                    green: brightness * 0.85,
                    blue: brightness * 0.6,
                    alpha: 1
                )
            }
            
            star.strokeColor = .clear
            star.position = CGPoint(
                x: CGFloat.random(in: 0...size.width * 1.2),
                y: CGFloat.random(in: 0...size.height * 1.2)
            )
            star.alpha = CGFloat.random(in: 0.2...0.9)
            
            // 闪烁动画
            let fadeOut = SKAction.fadeAlpha(to: 0.1, duration: Double.random(in: 1.0...3.0))
            let fadeIn = SKAction.fadeAlpha(to: star.alpha, duration: Double.random(in: 1.0...3.0))
            let twinkle = SKAction.sequence([fadeOut, fadeIn])
            star.run(SKAction.repeatForever(twinkle))
            
            addChild(star)
            stars.append(star)
        }
    }
    
    // 屏幕 resize 时重新分布星星
    override func didChangeSize(_ oldSize: CGSize) {
        for star in stars {
            if star.position.x > size.width {
                star.position.x = CGFloat.random(in: 0...size.width)
            }
            if star.position.y > size.height {
                star.position.y = CGFloat.random(in: 0...size.height)
            }
        }
    }
}
