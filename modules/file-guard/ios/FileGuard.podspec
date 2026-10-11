Pod::Spec.new do |s|
  s.name           = 'FileGuard'
  s.version        = '1.0.0'
  s.summary        = 'Backup exclusion and data protection for local files'
  s.description    = 'Backup exclusion and data protection for local files'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = { 'DEFINED_MODULE' => 'YES' }
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end