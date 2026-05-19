import SwiftUI
import SpriteKit

/// Enhanced SpriteKit star field with Tai-Chi inspired gold/white particles
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
        
        if ProcessInfo.processInfo.isLowPowerModeEnabled {
            skView.preferredFramesPerSecond = 30
        }
        
        return skView
    }
    
    func updateUIView(_ uiView: SKView, context: Context) {}
}

class StarScene: SKScene {
    private var stars: [SKNode] = []
    private let maxStars = 400
    
    override func didMove(to view: SKView) {
        backgroundColor = .clear
        generateStars()
    }
    
    private func generateStars() {
        let count = ProcessInfo.processInfo.isLowPowerModeEnabled ? 150 : maxStars
        
        for _ in 0..<count {
            let size = CGFloat.random(in: 1.0...3.0)
            let star: SKNode
            
            // 混合星型：小圆点 + 十字光晕
            if Bool.random() {
                let circle = SKShapeNode(circleOfRadius: size)
                circle.fillColor = starColor()
                circle.strokeColor = .clear
                star = circle
            } else {
                let path = UIBezierPath()
                path.move(to: .zero)
                path.addLine(to: CGPoint(x: -size * 3, y: 0))
                path.move(to: .zero)
                path.addLine(to: CGPoint(x: size * 3, y: 0))
                path.move(to: .zero)
                path.addLine(to: CGPoint(x: 0, y: -size * 3))
                path.move(to: .zero)
                path.addLine(to: CGPoint(x: 0, y: size * 3))
                let cross = SKShapeNode(path: path.cgPath)
                cross.strokeColor = starColor()
                cross.lineWidth = 0.5
                star = cross
                
                // 加中心光晕
                let glow = SKShapeNode(circleOfRadius: size * 0.5)
                glow.fillColor = starColor().withAlphaComponent(0.8)
                glow.strokeColor = .clear
                star.addChild(glow)
            }
            
            star.position = CGPoint(
                x: CGFloat.random(in: 0...frame.width),
                y: CGFloat.random(in: 0...frame.height)
            )
            star.alpha = CGFloat.random(in: 0.3...1.0)
            star.setScale(CGFloat.random(in: 0.5...1.5))
            
            // 不同速度的闪烁 + 旋转
            let baseAlpha = star.alpha
            let speed = Double.random(in: 1.5...5.0)
            let fadeOut = SKAction.fadeAlpha(to: baseAlpha * 0.1, duration: speed * 0.4)
            let fadeIn = SKAction.fadeAlpha(to: baseAlpha, duration: speed * 0.6)
            star.run(SKAction.repeatForever(SKAction.sequence([fadeOut, fadeIn])))
            
            // 缓慢漂移
            let dx = CGFloat.random(in: -8...8)
            let dy = CGFloat.random(in: -8...8)
            let drift = SKAction.sequence([
                SKAction.moveBy(x: dx, y: dy, duration: speed * 2),
                SKAction.moveBy(x: -dx, y: -dy, duration: speed * 2)
            ])
            star.run(SKAction.repeatForever(drift))
            
            addChild(star)
            stars.append(star)
        }
        
        // 添加大星星（带金色光晕）
        for _ in 0..<20 {
            let size = CGFloat.random(in: 2.0...4.0)
            let glowSize = size * 4
            
            // 外层光晕
            let glow = SKShapeNode(circleOfRadius: glowSize)
            glow.fillColor = UIColor(red: 0.788, green: 0.659, blue: 0.325, alpha: 0.08)
            glow.strokeColor = .clear
            
            // 内核
            let core = SKShapeNode(circleOfRadius: size)
            core.fillColor = UIColor(red: 0.788, green: 0.659, blue: 0.325, alpha: 0.9)
            core.strokeColor = UIColor(red: 0.788, green: 0.659, blue: 0.325, alpha: 0.3)
            core.lineWidth = 0.5
            
            glow.addChild(core)
            glow.position = CGPoint(
                x: CGFloat.random(in: 0...frame.width),
                y: CGFloat.random(in: 0...frame.height)
            )
            
            // 金色星星呼吸效果
            let breathe = SKAction.sequence([
                SKAction.scale(to: 1.3, duration: 3.0),
                SKAction.scale(to: 0.7, duration: 3.0)
            ])
            glow.run(SKAction.repeatForever(breathe))
            
            addChild(glow)
            stars.append(glow)
        }
    }
    
    private func starColor() -> UIColor {
        let brightness = CGFloat.random(in: 0.6...1.0)
        if Double.random(in: 0...1) < 0.4 {
            // 金色星星
            return UIColor(red: brightness * 0.9, green: brightness * 0.8, blue: brightness * 0.4, alpha: brightness)
        } else {
            // 白色/淡蓝色星星
            return UIColor(white: brightness, alpha: brightness * 0.9)
        }
    }
    
    override func didChangeSize(_ oldSize: CGSize) {
        for star in stars {
            let margin: CGFloat = 20
            if star.position.x > frame.width + margin {
                star.position.x = -margin
            }
            if star.position.y > frame.height + margin {
                star.position.y = -margin
            }
            if star.position.x < -margin {
                star.position.x = frame.width + margin
            }
            if star.position.y < -margin {
                star.position.y = frame.height + margin
            }
        }
    }
}
