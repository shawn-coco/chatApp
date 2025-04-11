import tauriConfig from "../../src-tauri/tauri.conf.json";
import { DEFAULT_INPUT_TEMPLATE } from "../constant";

// 浏览器环境中的默认配置
const defaultBuildConfig = {
  version: "v" + tauriConfig.package.version,
  commitDate: "browser",
  commitHash: "browser",
  buildMode: "browser",
  isApp: false,
  template: DEFAULT_INPUT_TEMPLATE,
};

export const getBuildConfig = () => {
  // 检查是否处于浏览器环境
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // 在浏览器环境中提供静态数据
    return defaultBuildConfig;
  }

  // 以下代码只在 Node.js 环境中执行
  try {
    const buildMode = process.env.BUILD_MODE ?? "standalone";
    const isApp = !!process.env.BUILD_APP;
    const version = "v" + tauriConfig.package.version;

    // 使用这种方式避免 webpack 静态分析
    let commitInfo = {
      commitDate: "unknown",
      commitHash: "unknown",
    };

    try {
      // 使用 eval 和字符串拼接来阻止 webpack 静态分析
      // eslint-disable-next-line no-eval
      const cp = eval("require")("child_process");
      
      commitInfo.commitDate = cp
        .execSync('git log -1 --format="%at000" --date=unix')
        .toString()
        .trim();
      commitInfo.commitHash = cp
        .execSync('git log --pretty=format:"%H" -n 1')
        .toString()
        .trim();
    } catch (e) {
      console.error("[Build Config] No git or not from git repo.", e);
    }

    return {
      version,
      ...commitInfo,
      buildMode,
      isApp,
      template: process.env.DEFAULT_INPUT_TEMPLATE ?? DEFAULT_INPUT_TEMPLATE,
    };
  } catch (error) {
    console.error("[Build Config] Error:", error);
    return defaultBuildConfig;
  }
};

export type BuildConfig = ReturnType<typeof getBuildConfig>;5
