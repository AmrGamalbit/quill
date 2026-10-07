import ExpoModulesCore
import CoreHaptics

struct HapticEvent: Record {
  @Field var type: String = "transient"
  @Field var time: Double = 0
  @Field var duration: Double = 0.1
  @Field var intensity: Double = 1
  @Field var endIntensity: Double? = nil
  @Field var sharpness: Double = 0.5
}

public class HapticEngineModule: Module {
  private var engine: CHHapticEngine?
  private var player: CHHapticPatternPlayer?

  public func definition() -> ModuleDefinition {
    Name("HapticEngine")

    Function("isSupported") { () -> Bool in 
    CHHapticEngine.capabilitiesForHardware().supportsHaptics
    }

    Function("play") { (events: [HapticEvent]) in
    try self.play(events)
    }

    Function("cancel") {
      try? self.player?.stop(atTime: CHHapticTimeImmediate)
    }

    OnAppEntersForeground { self.prepare() }
    OnDestroy { self.engine?.stop() }
  }

  private func prepare() {
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
    do {
      let e = try CHHapticEngine()
      e.isAutoShutdownEnabled = true
      e.resetHandler = { [weak self] in try? self?.engine?.start() }
      e.stoppedHandler = { _ in }
      try e.start()
      engine = e
    } catch { engine = nil }
  }
  private func play(_ events: [HapticEvent]) throws {
    if engine == nil { prepare() }
    guard let engine = engine, !events.isEmpty else { return }
    try? player?.stop(atTime: CHHapticTimeImmediate)
    try engine.start()

    var chEvents: [CHHapticEvent] = []
    var curves: [CHHapticParameterCurve] = []

    for e in events {
      let continuous = e.type == "continuous"
      let end = e.endIntensity ?? e.intensity
      let peak = max(e.intensity, end, 0.01)

      chEvents.append(CHHapticEvent(
        eventType: continuous ? .hapticContinuous : .hapticTransient,
        parameters: [
          CHHapticEventParameter(parameterID: .hapticIntensity, value: Float(peak)),
          CHHapticEventParameter(parameterID: .hapticSharpness, value: Float(e.sharpness)),
        ],
        relativeTime: e.time,
        duration: continuous ? e.duration : 0
      ))

      if continuous && end != e.intensity {
        curves.append(CHHapticParameterCurve(
          parameterID: .hapticIntensityControl,
          controlPoints: [
            .init(relativeTime: 0, value: Float(e.intensity / peak)),
            .init(relativeTime: e.duration, value: Float(end / peak))
          ],
          relativeTime: e.time
        ))
      }
    }

    let pattern = try CHHapticPatern(events: chEvents, parameterCurves: curves)
    let p = try engine.makePlayer(with: pattern)
    player = p
    try p.start(atTime: CHHapticTimeImmediate)
  }
}