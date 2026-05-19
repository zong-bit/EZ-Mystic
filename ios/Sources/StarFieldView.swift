import SwiftUI
import SpriteKit

/// Tai-Chi inspired particle system — mirrors web version's canvas animation
struct StarFieldView: UIViewRepresentable {
    func makeUIView(context: Context) -> SKView {
        let skView = SKView()
        skView.backgroundColor = .clear
        skView.isOpaque = false
        skView.allowsTransparency = true
        
        let scene = TaiChiScene(size: UIScreen.main.bounds.size)
        scene.backgroundColor = .clear
        scene.scaleMode = .resizeFill
        skView.presentScene(scene)
        
        return skView
    }
    
    func updateUIView(_ uiView: SKView, context: Context) {}
}

class TaiChiScene: SKScene {
    private var particles: [Particle] = []
    private var state: AnimState = .wander
    private var stateTimer: TimeInterval = 0
    private let centerPoint = CGPoint(x: UIScreen.main.bounds.midX, y: UIScreen.main.bounds.midY)
    
    struct Particle {
        let node: SKNode
        var homeX: CGFloat
        var homeY: CGFloat
        var targetAngle: CGFloat
        var targetRadius: CGFloat
        var twinkleSpeed: Double
        var twinklePhase: Double
        var orbitSpeed: CGFloat
    }
    
    enum AnimState: String {
        case wander, attract, spin, burst
    }
    
    override func didMove(to view: SKView) {
        backgroundColor = .clear
        createParticles()
        startStateCycle()
    }
    
    private func createParticles() {
        let count = 200
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        
        for i in 0..<count {
            let star = SKShapeNode(circleOfRadius: CGFloat.random(in: 0.8...2.5))
            
            // Colors: 70% white, 30% gold
            let brightness = CGFloat.random(in: 0.5...1.0)
            if Double.random(in: 0...1) < 0.3 {
                star.fillColor = UIColor(red: brightness * 0.9, green: brightness * 0.8, blue: brightness * 0.4, alpha: 1)
                star.strokeColor = UIColor(red: brightness * 0.9, green: brightness * 0.8, blue: brightness * 0.4, alpha: 0.3)
            } else {
                star.fillColor = UIColor(white: brightness, alpha: 1)
                star.strokeColor = UIColor(white: brightness * 0.8, alpha: 0.2)
            }
            
            // Scatter positions
            let angle = CGFloat.random(in: 0...(2 * .pi))
            let radius = CGFloat.random(in: 50...max(size.width, size.height) * 0.7)
            let homeX = center.x + cos(angle) * radius
            let homeY = center.y + sin(angle) * radius
            star.position = CGPoint(x: homeX, y: homeY)
            
            // Tai-Chi target position on the yin-yang curve
            let t = CGFloat(i) / CGFloat(count) * 2 * .pi
            let taiChiR: CGFloat = min(size.width, size.height) * 0.25
            let taiChiX = center.x + cos(t) * taiChiR * (0.5 + 0.5 * sin(t * 2))
            let taiChiY = center.y + sin(t) * taiChiR * 0.6
            
            // Gold glow for the core
            if i % 10 == 0 {
                let glow = SKShapeNode(circleOfRadius: CGFloat.random(in: 4...8))
                glow.fillColor = UIColor(red: 0.788, green: 0.659, blue: 0.325, alpha: 0.1)
                glow.strokeColor = .clear
                star.addChild(glow)
            }
            
            addChild(star)
            
            let particle = Particle(
                node: star,
                homeX: homeX,
                homeY: homeY,
                targetAngle: t,
                targetRadius: taiChiR,
                twinkleSpeed: Double.random(in: 0.5...3.0),
                twinklePhase: Double.random(in: 0...(2 * .pi)),
                orbitSpeed: CGFloat.random(in: 0.3...1.0)
            )
            particles.append(particle)
            
            // Initial twinkle
            let fadeDuration = Double.random(in: 0.5...2.0)
            star.run(SKAction.fadeAlpha(to: CGFloat.random(in: 0.3...0.9), duration: fadeDuration))
        }
    }
    
    private func startStateCycle() {
        let sequence = SKAction.sequence([
            // Wander: 8s of floating
            SKAction.run { self.state = .wander; self.stateTimer = 8.0 },
            SKAction.wait(forDuration: 8.0),
            // Attract: 3s gathering to center
            SKAction.run { self.state = .attract; self.stateTimer = 3.0 },
            SKAction.wait(forDuration: 3.0),
            // Spin: 6s of Tai-Chi rotation
            SKAction.run { self.state = .spin; self.stateTimer = 6.0 },
            SKAction.wait(forDuration: 6.0),
            // Burst: 3s expanding outward
            SKAction.run { self.state = .burst; self.stateTimer = 3.0 },
            SKAction.wait(forDuration: 3.0),
        ])
        run(SKAction.repeatForever(sequence))
        
        // Continuous update loop
        let updateLoop = SKAction.repeatForever(
            SKAction.sequence([
                SKAction.run { self.updateParticles() },
                SKAction.wait(forDuration: 0.05)  // ~20fps for particles, fine for stars
            ])
        )
        run(updateLoop)
    }
    
    private func updateParticles() {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let time = CACurrentMediaTime()
        
        for p in particles {
            let node = p.node
            let progress: CGFloat
            
            switch state {
            case .wander:
                // Slow drift around home position
                let driftX = sin(time * p.twinkleSpeed + p.twinklePhase) * 15
                let driftY = cos(time * p.twinkleSpeed * 0.7 + p.twinklePhase * 1.3) * 15
                node.position = CGPoint(x: p.homeX + driftX, y: p.homeY + driftY)
                node.alpha = 0.3 + CGFloat(sin(time * p.twinkleSpeed + p.twinklePhase)) * 0.3
                
            case .attract:
                // Move toward Tai-Chi orbit position
                let t = CGFloat(p.targetAngle + time * 0.3)
                let tx = center.x + cos(t) * p.targetRadius * (0.5 + 0.3 * sin(t * 2))
                let ty = center.y + sin(t) * p.targetRadius * 0.6
                node.position = CGPoint(
                    x: node.position.x + (tx - node.position.x) * 0.05,
                    y: node.position.y + (ty - node.position.y) * 0.05
                )
                node.alpha = min(1.0, node.alpha + 0.02)
                
            case .spin:
                // Rotate in Tai-Chi formation
                let speed = time * 0.5
                let t = CGFloat(p.targetAngle + speed)
                let r = p.targetRadius * (0.5 + 0.3 * sin(t * 2 + speed * 0.5))
                let tx = center.x + cos(t + speed * 0.3) * r
                let ty = center.y + sin(t + speed * 0.3) * r * 0.6
                node.position = CGPoint(
                    x: node.position.x + (tx - node.position.x) * 0.08,
                    y: node.position.y + (ty - node.position.y) * 0.08
                )
                node.alpha = 0.6 + CGFloat(sin(time * p.twinkleSpeed * 1.5 + p.twinklePhase)) * 0.3
                node.setScale(1.0 + CGFloat(sin(time * p.twinkleSpeed + p.twinklePhase)) * 0.2)
                
            case .burst:
                // Explode outward
                let dx = node.position.x - center.x
                let dy = node.position.y - center.y
                let dist = sqrt(dx * dx + dy * dy)
                if dist > 0 {
                    let normX = dx / dist
                    let normY = dy / dist
                    node.position = CGPoint(
                        x: node.position.x + normX * 3,
                        y: node.position.y + normY * 3
                    )
                }
                node.alpha = max(0, node.alpha - 0.005)
                
                // Reset if too far
                if dist > max(size.width, size.height) {
                    node.position = CGPoint(x: p.homeX, y: p.homeY)
                    node.alpha = 0.5
                }
            }
        }
    }
}
