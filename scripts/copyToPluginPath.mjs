import { readFileSync, existsSync, copyFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

/**
 * Copy build files to Obsidian plugin directory
 */
async function copyToPluginPath() {
  const configPath = join(rootDir, ".obsidian-plugin-path.json");

  // Check if config file exists
  if (!existsSync(configPath)) {
    console.log("⚠️  .obsidian-plugin-path.json not found. Skipping copy to plugin path.");
    console.log(
      "💡 Create .obsidian-plugin-path.json with 'pluginPath' field to enable auto-copy."
    );
    return;
  }

  try {
    // Read config
    const configContent = readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    const pluginPath = config.pluginPath?.trim();

    // Check if plugin path is configured
    if (!pluginPath) {
      console.log("⚠️  pluginPath not configured in .obsidian-plugin-path.json. Skipping copy.");
      return;
    }

    // Check if plugin path exists
    if (!existsSync(pluginPath)) {
      console.log(`⚠️  Plugin path does not exist: ${pluginPath}`);
      console.log("💡 Please check the path in .obsidian-plugin-path.json");
      return;
    }

    // Files to copy from build directory
    const filesToCopy = [
      { src: "build/main.js", dest: "main.js" },
      { src: "build/styles.css", dest: "styles.css" },
      { src: "build/manifest.json", dest: "manifest.json" },
    ];

    console.log(`📦 Copying files to plugin directory: ${pluginPath}`);

    // Copy each file
    for (const { src, dest } of filesToCopy) {
      const srcPath = join(rootDir, src);
      const destPath = join(pluginPath, dest);

      if (!existsSync(srcPath)) {
        console.log(`⚠️  Source file not found: ${src}`);
        continue;
      }

      // Ensure destination directory exists
      const destDir = dirname(destPath);
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }

      copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${src} → ${destPath}`);
    }

    console.log("✨ Copy completed successfully!");
  } catch (error) {
    console.error("❌ Error copying files to plugin path:", error.message);
    process.exit(1);
  }
}

copyToPluginPath();
