import SwiftUI
import SpriteKit

struct StarFieldView: UIViewRepresentable {
    func makeUIView(context: Context) -> SKView {
        let skView = SKView()
        skView.backgroundColor = .clear
        skView.isOpaque = false
        skView.allowsTransparency = true
        return skView
    }
    
    func updateUIView(_ uiView: SKView, context: Context) {
        if uiView.scene == nil {
            DispatchQueue.main.async { [weak uiView] in
                guard let uiView = uiView, uiView.scene == nil else { return }
                let size = uiView.bounds.size
                // 防止 size 为 .zero
                let safeSize = CGSize(
                    width: max(size.width, 320),
                    height: max(size.height, 480)
                )
                let scene = TaiChiScene(size: safeSize)
                scene.backgroundColor = .clear
                scene.scaleMode = .resizeFill
                uiView.presentScene(scene)
            }
        }
    }
}

class TaiChiScene: SKScene {
    private var particles: [Particle] = []
    private var state: AnimState = .wander
    
    struct Particle {
        let node: SKNode
        let homeX: CGFloat
        let homeY: CGFloat
        let targetAngle: CGFloat
        let targetRadius: CGFloat
        let twinkleSpeed: Double
        let twinklePhase: Double
        var scale: CGFloat
    }
    
    enum AnimState: String {
        case wander, attract, spin, burst
    }
    
    override func didMove(to view: SKView) {
        backgroundColor = .clear
        guard size.width > 50, size.height > 50 else { return }
        createParticles()
        startAnimations()
    }
    
    private func createParticles() {
        guard size.width > 50, size.height > 50 else { return }
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let maxR = min(size.width, size.height) * 0.35
        let count = 120
        let goldColor = UIColor(red: 0.788, green: 0.659, blue: 0.325, alpha: 1)
        
        for i in 0..<count {
            let r: CGFloat = 0.8 + CGFloat.random(in: 0...1.2)
            let star = SKShapeNode(circleOfRadius: r)
            
            let isGold = i % 3 == 0
            if isGold {
                star.fillColor = goldColor
                star.strokeColor = goldColor.withAlphaComponent(0.3)
            } else {
                star.fillColor = UIColor(white: CGFloat.random(in: 0.5...0.9), alpha: 1)
                star.strokeColor = .clear
            }
            
            let angle = CGFloat.random(in: 0...(2 * .pi))
            let scatterR = min(size.width, size.height) * 0.45
            let dist = CGFloat.random(in: 20...scatterR)
            star.position = CGPoint(x: center.x + cos(angle) * dist,
                                   y: center.y + sin(angle) * dist)
            star.alpha = CGFloat.random(in: 0.3...0.9)
            
            if isGold {
                let glow = SKShapeNode(circleOfRadius: max(r * 4, 2.0))
                glow.fillColor = goldColor.withAlphaComponent(0.08)
                glow.strokeColor = .clear
                star.addChild(glow)
            }
            
            addChild(star)
            
            particles.append(Particle(
                node: star,
                homeX: star.position.x,
                homeY: star.position.y,
                targetAngle: CGFloat(i) / CGFloat(count) * 2 * .pi,
                targetRadius: maxR,
                twinkleSpeed: Double.random(in: 0.5...3.0),
                twinklePhase: Double.random(in: 0...(2 * .pi)),
                scale: 1.0
            ))
        }
    }
    
    private func startAnimations() {
        let update = SKAction.run { [weak self] in self?.tick() }
        let wait = SKAction.wait(forDuration: 0.03) // ~30fps
        run(SKAction.repeatForever(SKAction.sequence([update, wait])), withKey: "update")
        
        // State cycle
        let states: [AnimState] = [.wander, .attract, .spin, .burst]
        // 用更合理的时长，避免太快
        let durations: [TimeInterval] = [8, 10, 5, 3]
        var actions: [SKAction] = []
        for (i, s) in states.enumerated() {
            actions.append(SKAction.run { [weak self] in self?.state = s })
            actions.append(SKAction.wait(forDuration: durations[i]))
        }
        run(SKAction.repeatForever(SKAction.sequence(actions)), withKey: "cycle")
    }
    
    private func tick() {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let time = CACurrentMediaTime()
        
        for p in particles {
            let n = p.node
            switch state {
            case .wander:
                let dx = sin(time * p.twinkleSpeed + p.twinklePhase) * 20
                let dy = cos(time * p.twinkleSpeed * 0.7 + p.twinklePhase) * 20
                n.position = CGPoint(x: p.homeX + dx, y: p.homeY + dy)
                n.alpha = 0.3 + CGFloat(sin(time * p.twinkleSpeed + p.twinklePhase)) * 0.3 + 0.3
                
            case .attract:
                let t = CGFloat(p.targetAngle + time * 0.5)
                let r = p.targetRadius * (0.5 + 0.3 * sin(t))
                let tx = center.x + cos(t) * r
                let ty = center.y + sin(t) * r * 0.6
                n.position = CGPoint(
                    x: n.position.x + (tx - n.position.x) * 0.06,
                    y: n.position.y + (ty - n.position.y) * 0.06
                )
                n.alpha = 0.8
                
            case .spin:
                let speed = time * 0.6
                let t = p.targetAngle + speed
                let r = p.targetRadius * (0.5 + 0.3 * sin(t * 2 + speed * 0.5))
                let tx = center.x + cos(t + speed * 0.3) * r
                let ty = center.y + sin(t + speed * 0.3) * r * 0.6
                n.position = CGPoint(
                    x: n.position.x + (tx - n.position.x) * 0.1,
                    y: n.position.y + (ty - n.position.y) * 0.1
                )
                n.alpha = 0.7 + CGFloat(sin(time * p.twinkleSpeed + p.twinklePhase)) * 0.3
                n.setScale(1.0 + CGFloat(sin(time * p.twinkleSpeed + p.twinklePhase)) * 0.3)
                
            case .burst:
                let dx = n.position.x - center.x
                let dy = n.position.y - center.y
                let dist = sqrt(dx * dx + dy * dy)
                let screenDiag = max(size.width, size.height)
                if dist > screenDiag * 1.5 {
                    // 飞远了：淡出后回到 home 位置（不瞬移）
                    n.alpha = max(0, n.alpha - 0.05)
                    if n.alpha <= 0 {
                        n.position = CGPoint(x: p.homeX, y: p.homeY)
                        n.alpha = 0.3
                        n.setScale(1.0)
                    }
                } else if dist > 0 {
                    // 继续向外飞
                    let speed: CGFloat = 4 + dist / screenDiag * 3
                    n.position = CGPoint(
                        x: n.position.x + dx / dist * speed,
                        y: n.position.y + dy / dist * speed
                    )
                    n.alpha = max(0.15, n.alpha - 0.008)
                }
            }
        }
    }
}
