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
            let scene = TaiChiScene(size: uiView.bounds.size)
            scene.backgroundColor = .clear
            scene.scaleMode = .resizeFill
            uiView.presentScene(scene)
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
        guard size.width > 0, size.height > 0 else { return }
        createParticles()
        startAnimations()
    }
    
    private func createParticles() {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let maxR = min(size.width, size.height) * 0.35
        let count = 120
        
        for i in 0..<count {
            let r = CGFloat.random(in: 1.0...2.0)
            let star = SKShapeNode(circleOfRadius: r)
            
            let isGold = i % 3 == 0
            if isGold {
                star.fillColor = UIColor(red: 0.788, green: 0.659, blue: 0.325, alpha: 1)
                star.strokeColor = UIColor(red: 0.788, green: 0.659, blue: 0.325, alpha: 0.3)
            } else {
                let b = CGFloat.random(in: 0.6...1.0)
                star.fillColor = UIColor(white: b, alpha: 1)
                star.strokeColor = .clear
            }
            
            let angle = CGFloat.random(in: 0...(2 * .pi))
            let dist = CGFloat.random(in: 30...max(size.width, size.height) * 0.6)
            let hx = center.x + cos(angle) * dist
            let hy = center.y + sin(angle) * dist
            star.position = CGPoint(x: hx, y: hy)
            star.alpha = CGFloat.random(in: 0.3...0.9)
            
            // Gold glow for some stars
            if isGold {
                let glow = SKShapeNode(circleOfRadius: r * 4)
                glow.fillColor = UIColor(red: 0.788, green: 0.659, blue: 0.325, alpha: 0.08)
                glow.strokeColor = .clear
                star.addChild(glow)
            }
            
            addChild(star)
            
            particles.append(Particle(
                node: star, homeX: hx, homeY: hy,
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
        let durations: [TimeInterval] = [6, 3, 5, 2]
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
                if dist > 0 {
                    n.position = CGPoint(
                        x: n.position.x + dx / dist * 4,
                        y: n.position.y + dy / dist * 4
                    )
                }
                n.alpha = max(0.1, n.alpha - 0.02)
                if dist > max(size.width, size.height) {
                    n.position = CGPoint(x: p.homeX, y: p.homeY)
                    n.alpha = 0.5
                    n.setScale(1.0)
                }
            }
        }
    }
}
