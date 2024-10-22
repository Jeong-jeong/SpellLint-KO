const esbuild = require("esbuild");
const fs = require('fs-extra');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

const copyTextFixturesPlugin = {
	name: 'copy-text-fixtures',

	setup(build) {
		build.onStart(() => {
			// out에 text-fixtures 폴더 생성
			fs.ensureDirSync('out/test/test-fixtures');

			const files = fs.readdirSync('test/test-fixtures');
			files.forEach((file) => {
				if (file.endsWith('.txt')) {
					fs.copyFileSync(
						path.join('test/test-fixtures', file),
						path.join('out/test/test-fixtures', file)
					);
				}
			});
		});

		console.log('[copy] test fixtures copied');
	},
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'out/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			esbuildProblemMatcherPlugin,
			copyTextFixturesPlugin,
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
