import ExpoModulesCore

public class HapticEngineModuleSharedObject: SharedObject {
  var count: Int = 0

  override public func sharedObjectDidRelease() {
    super.sharedObjectDidRelease()
  }
}
