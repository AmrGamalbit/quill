import SwiftUI
import ExpoModulesCore
import ExpoUI

final class HapticEngineSwiftUIViewProps: UIBaseViewProps {
  @Field var title: String = ""
}

struct HapticEngineSwiftUIView: ExpoSwiftUI.View {
  @ObservedObject public var props: HapticEngineSwiftUIViewProps

  var body: some View {
    VStack {
      Text(props.title)
        .font(.headline)
      Children()
    }
  }
}
