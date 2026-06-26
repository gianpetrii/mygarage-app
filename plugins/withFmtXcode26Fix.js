/**
 * Workaround para Xcode 26.x: el pod `fmt` (RCT-Folly) falla con errores
 * consteval en format-inl.h. Compilar solo `fmt` con C++17 desactiva ese path.
 *
 * https://github.com/fmtlib/fmt/issues/4740
 * https://github.com/facebook/react-native/issues/55601
 *
 * Va como plugin porque prebuild regenera el Podfile desde cero.
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = 'Xcode 26 fmt workaround';
const FIX_BLOCK = `
    # ${MARKER}: fmt consteval fails with Apple Clang 21+ (Xcode 26.x)
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |config|
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end
`;

const withFmtXcode26Fix = (config) => {
  return withDangerousMod(config, [
    'ios',
    (mod) => {
      const podfilePath = path.join(mod.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (contents.includes(MARKER)) {
        return mod;
      }

      const anchor =
        '    # This is necessary for Xcode 14, because it signs resource bundles by default';
      if (contents.includes(anchor)) {
        contents = contents.replace(anchor, `${FIX_BLOCK}\n${anchor}`);
        fs.writeFileSync(podfilePath, contents);
      }

      return mod;
    },
  ]);
};

module.exports = withFmtXcode26Fix;
