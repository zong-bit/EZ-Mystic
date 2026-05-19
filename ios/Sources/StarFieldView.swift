import SwiftUI
import SpriteKit

/// 原生星空动画背景
struct StarFieldView: UIViewRepresentable {
    func makeUIView(context: Context) -> SKView {
        let skView = SKView()
        skView.backgroundColor = .clear
        skView.isOpaque = false
        skView.allowsTransparency = true
        
        let scene = StarScene(size: UIScreen.main.bounds.size)
        scene.backgroundColor = .clear
        scene.scaleMode = .resizeFill
        skView.presentScene(scene)
        
        // 低电量模式降帧
        if ProcessInfo.processInfo.isLowPowerModeEnabled {
            skView.preferredFramesPerSecond = 30
        }
        
        return skView
    }
    
    func updateUIView(_ uiView: SKView, context: Context) {}
}

class StarScene: SKScene {
    private var stars: [SKShapeNode] = []
    private let maxStars: Int = 600
    private var isLowPower: Bool {
        ProcessInfo.processInfo.isLowPowerModeEnabled
    }
    
    override func didMove(to view: SKView) {
        backgroundColor = .clear
        generateStars()
    }
    
    private func generateStars() {
        let count = isLowPower ? 200 : maxStars
        for _ in 0..<count {
            let size = CGFloat.random(in: 0.5...2.5)
            let star = SKShapeNode(circleOfRadius: size)
            
            // 白/金混合
            let brightness = CGFloat.random(in: 0.5...1.0)
            if Double.random(in: 0...1) < 0.7 {
                star.fillColor = UIColor(white: brightness, alpha: 1)
                star.strokeColor = UIColor(white: brightness * 0.8, alpha: 0.3)
            } else {
                let gold = UIColor(
                    red: brightness,
                    green: brightness * 0.85,
                    blue: brightness * 0.5,
                    alpha: 1
                )
                star.fillColor = gold
                star.strokeColor = gold.withAlphaComponent(0.3)
            }
            
            star.position = CGPoint(
                x: CGFloat.random(in: 0...frame.width),
                y: CGFloat.random(in: 0...frame.height)
            )
            star.alpha = CGFloat.random(in: 0.2...0.9)
            
            // 闪烁动画（不同速度）
            let baseAlpha = star.alpha
            let duration = Double.random(in: 1.5...4.0)
            let fadeOut = SKAction.fadeAlpha(to: baseAlpha * 0.1, duration: duration * 0.5)
            let fadeIn = SKAction.fadeAlpha(to: baseAlpha, duration: duration * 0.5)
            let twinkle = SKAction.sequence([fadeOut, fadeIn])
            star.run(SKAction.repeatForever(twinkle), withKey: "twinkle-\(stars.count)")
            
            // 微小位移（漂移效果）
            let driftX = CGFloat.random(in: -5...5)
            let driftY = CGFloat.random(in: -5...5)
            let move = SKAction.moveBy(x: driftX, y: driftY, duration: duration * 2)
            let moveBack = move.reversed()
            let drift = SKAction.sequence([move, moveBack])
            star.run(SKAction.repeatForever(drift))
            
            addChild(star)
            stars.append(star)
        }
    }
    
    override func didChangeSize(_ oldSize: CGSize) {
        for star in stars {
            if star.position.x > frame.width {
                star.position.x = CGFloat.random(in: 0...frame.width)
            }
            if star.position.y > frame.height {
                star.position.y = CGFloat.random(in: 0...frame.height)
            }
        }
    }
}
