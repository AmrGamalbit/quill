import ExpoModulesCore

public class FileGuardModule: Module {
    public func definition() -> ModuleDefinition {
        Name("FileGuard")

        AsyncFunction("secure") { (path: String, protect: Bool, recursive: Bool ) throws -> Int in
        try FileGuardModule.secure(path: path, protect: protect, recursive: recursive)
        }

        AsyncFunction("inspect") { (path: String) -> [String: Any] in
        FileGuardModule.inspect(path: path)
        }
    }

    private static func fileURL(_ path: String) -> URL {
        if path.hasPrefix("file://"), let url = URL(string: path) { return url }
        return URL(fileURLWithPath: path)
    }

    private static func secure(path: String, protect: Bool, recursive: Bool) throws -> Int {
        let fm = FileManager.default
        let root = fileURL(path)
        var isDirectory: ObjCBool = false
        guard fm.fileExists(atPath: root.path, isDirectory: &isDirectory) else { return 0 }

        var rootURL = root
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try rootURL.setResourceValues(values)
        if protect {
            try fm.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: root.path)
        }

        guard recursive, protect, isDirectory.boolValue,
              let children = fm.enumerator(at: root, includingPropertiesForKeys: nil) else { return 0 }  // Fixed: includngPropertiesForKeys → includingPropertiesForKeys

        var failures = 0
        for case let child as URL in children {
            do {
                try fm.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: child.path)
            } catch {
                failures += 1
            }
        }
        return failures
    }

    private static func inspect(path: String) -> [String: Any] {
        let url = fileURL(path)
        let excluded = (try? url.resourceValues(forKeys: [.isExcludedFromBackupKey]))?.isExcludedFromBackup ?? false
        let attributes = try? FileManager.default.attributesOfItem(atPath: url.path)
        let protection = (attributes?[.protectionKey] as? FileProtectionType)?.rawValue ?? "unknown"
        return ["excludedFromBackup": excluded, "protection": protection]
    }
}