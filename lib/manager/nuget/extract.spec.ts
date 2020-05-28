import { readFileSync } from 'fs';
import * as path from 'path';
import { ExtractConfig } from '../common';
import { extractPackageFile } from './extract';

describe('lib/manager/nuget/extract', () => {
  describe('extractPackageFile()', () => {
    let config: ExtractConfig;
    beforeEach(() => {
      config = {
        localDir: path.resolve('lib/manager/nuget/__fixtures__'),
      };
    });
    it('returns empty for invalid csproj', async () => {
      expect(
        await extractPackageFile('nothing here', 'bogus', config)
      ).toMatchSnapshot();
    });
    it('extracts all dependencies', async () => {
      const packageFile = 'sample.csproj';
      const sample = readFileSync(
        path.join(config.localDir, packageFile),
        'utf8'
      );
      const res = await extractPackageFile(sample, packageFile, config);
      expect(res.deps).toMatchSnapshot();
    });

    it('considers NuGet.config', async () => {
      const packageFile = 'with-config-file/with-config-file.csproj';
      const contents = readFileSync(
        path.join(config.localDir, packageFile),
        'utf8'
      );

      expect(
        await extractPackageFile(contents, packageFile, config)
      ).toMatchSnapshot();
    });
    it('considers lower-case nuget.config', async () => {
      const packageFile =
        'with-lower-case-config-file/with-lower-case-config-file.csproj';
      const contents = readFileSync(
        path.join(config.localDir, packageFile),
        'utf8'
      );

      expect(
        await extractPackageFile(contents, packageFile, config)
      ).toMatchSnapshot();
    });
    it('considers pascal-case NuGet.Config', async () => {
      const packageFile =
        'with-pascal-case-config-file/with-pascal-case-config-file.csproj';
      const contents = readFileSync(
        path.join(config.localDir, packageFile),
        'utf8'
      );

      expect(
        await extractPackageFile(contents, packageFile, config)
      ).toMatchSnapshot();
    });
    it('handles malformed NuGet.config', async () => {
      const packageFile =
        'with-malformed-config-file/with-malformed-config-file.csproj';
      const contents = readFileSync(
        path.join(config.localDir, packageFile),
        'utf8'
      );

      expect(
        await extractPackageFile(contents, packageFile, config)
      ).toMatchSnapshot();
    });
    it('handles NuGet.config without package sources', async () => {
      const packageFile =
        'without-package-sources/without-package-sources.csproj';
      const contents = readFileSync(
        path.join(config.localDir, packageFile),
        'utf8'
      );

      expect(
        await extractPackageFile(contents, packageFile, config)
      ).toMatchSnapshot();
    });

    describe('.config/dotnet-tools.json', () => {
      const packageFile = '.config/dotnet-tools.json';
      const contents = `{
  "version": 1,
  "isRoot": true,
  "tools": {
    "minver-cli": {
      "version": "2.0.0",
      "commands": ["minver"]
    }
  }
}`;
      it('works', async () => {
        expect(
          await extractPackageFile(contents, packageFile, config)
        ).toMatchSnapshot();
      });

      it('with-config', async () => {
        expect(
          await extractPackageFile(
            contents,
            `with-config-file/${packageFile}`,
            config
          )
        ).toMatchSnapshot();
      });

      it('wrong version', async () => {
        expect(
          await extractPackageFile(
            contents.replace('"version": 1,', '"version": 2,'),
            packageFile,
            config
          )
        ).toBeNull();
      });

      it('does not throw', async () => {
        expect(await extractPackageFile('{{', packageFile, config)).toBeNull();
      });
    });
  });
});
