// luxora-audit.js
// Run: node luxora-audit.js (project root se)

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

const ok   = (msg) => console.log(`  ${GREEN}[DONE]${RESET}  ${msg}`);
const fail = (msg) => console.log(`  ${RED}[MISS]${RESET}  ${msg}`);
const warn = (msg) => console.log(`  ${YELLOW}[WARN]${RESET}  ${msg}`);
const head = (msg) => console.log(`\n${BOLD}${CYAN}━━━  ${msg}  ━━━${RESET}`);
const line = ()     => console.log(`${DIM}${"─".repeat(55)}${RESET}`);

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readJSON(relPath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
  } catch {
    return null;
  }
}

function readFile(relPath) {
  try {
    return fs.readFileSync(path.join(ROOT, relPath), "utf8");
  } catch {
    return "";
  }
}

function containsPattern(relPath, pattern) {
  const content = readFile(relPath);
  return pattern.test(content);
}

function getAllFiles(dir, ext = [".tsx", ".ts"], found = []) {
  if (!fs.existsSync(path.join(ROOT, dir))) return found;
  const entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(rel, ext, found);
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      found.push(rel);
    }
  }
  return found;
}

// ─────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}`);
console.log("  ██╗     ██╗   ██╗██╗  ██╗ ██████╗ ██████╗  █████╗ ");
console.log("  ██║     ██║   ██║╚██╗██╔╝██╔═══██╗██╔══██╗██╔══██╗");
console.log("  ██║     ██║   ██║ ╚███╔╝ ██║   ██║██████╔╝███████║");
console.log("  ██║     ██║   ██║ ██╔██╗ ██║   ██║██╔══██╗██╔══██║");
console.log("  ███████╗╚██████╔╝██╔╝ ██╗╚██████╔╝██║  ██║██║  ██║");
console.log("  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝");
console.log(`${RESET}${BOLD}           Production Readiness Audit${RESET}`);
console.log(`${DIM}           ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}${RESET}`);
line();

// ─────────────────────────────────────────────
// 1. PROJECT STRUCTURE
// ─────────────────────────────────────────────
head("1. PROJECT STRUCTURE");

const coreFiles = [
  ["app.json / app.config.ts", exists("app.json") || exists("app.config.ts")],
  ["package.json",             exists("package.json")],
  ["tsconfig.json",            exists("tsconfig.json")],
  ["babel.config.js",          exists("babel.config.js") || exists("babel.config.ts")],
  [".env file",                exists(".env") || exists(".env.local")],
  ["eas.json (EAS Build)",     exists("eas.json")],
  ["assets/ folder",           exists("assets")],
  ["app/ folder (Expo Router)",exists("app")],
];

coreFiles.forEach(([label, found]) => (found ? ok : fail)(label));

// ─────────────────────────────────────────────
// 2. SCREENS AUDIT
// ─────────────────────────────────────────────
head("2. SCREENS AUDIT");

const expectedScreens = [
  // Auth
  "app/index.tsx",
  "app/login.tsx",
  "app/register.tsx",
  "app/splash.tsx",
  // Main Tabs
  "app/(tabs)/_layout.tsx",
  "app/(tabs)/home.tsx",
  "app/(tabs)/explore.tsx",
  "app/(tabs)/bookings.tsx",
  "app/(tabs)/profile.tsx",
  // Tours
  "app/tours/index.tsx",
  "app/tours/[id].tsx",
  // Hotels
  "app/hotels/index.tsx",
  "app/hotels/[id].tsx",
  // Packages
  "app/packages/index.tsx",
  "app/packages/[id].tsx",
  // Visa
  "app/visa/index.tsx",
  "app/visa/apply.tsx",
  // Transfers
  "app/transfers/index.tsx",
  // Booking
  "app/booking/checkout.tsx",
  "app/booking/confirmation.tsx",
  "app/booking/payment.tsx",
  // Profile/Settings
  "app/profile/edit.tsx",
  "app/settings/index.tsx",
  "app/settings/notifications.tsx",
];

let screensDone = 0;
let screensMiss = 0;

expectedScreens.forEach((s) => {
  if (exists(s)) {
    ok(s);
    screensDone++;
  } else {
    fail(s);
    screensMiss++;
  }
});

// Auto-discover any EXTRA screens not in list above
const allFoundScreens = getAllFiles("app");
const expectedSet = new Set(expectedScreens.map((s) => s.replace(/\\/g, "/")));
const extras = allFoundScreens.filter(
  (f) => !expectedSet.has(f.replace(/\\/g, "/"))
);
if (extras.length > 0) {
  console.log(`\n  ${YELLOW}[EXTRA screens found in project:]${RESET}`);
  extras.forEach((f) => warn(f));
}

// ─────────────────────────────────────────────
// 3. DEPENDENCIES
// ─────────────────────────────────────────────
head("3. KEY DEPENDENCIES");

const pkg = readJSON("package.json") || {};
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

const depChecks = [
  // Core
  ["expo",                         "Core"],
  ["expo-router",                  "Navigation"],
  ["react-native",                 "Core"],
  ["typescript",                   "TypeScript"],
  // State
  ["zustand",                      "State Management"],
  // Backend
  ["@supabase/supabase-js",        "Supabase (if used)"],
  // UI / UX
  ["expo-linear-gradient",         "Gradients"],
  ["expo-blur",                    "Blur Effects"],
  ["react-native-reanimated",      "Animations"],
  ["react-native-gesture-handler", "Gestures"],
  // Auth
  ["expo-secure-store",            "Secure Storage (Auth tokens)"],
  // Notifications
  ["expo-notifications",           "Push Notifications"],
  // Media
  ["expo-image",                   "Optimized Images"],
  ["expo-image-picker",            "Image Picker"],
  // Payments
  ["@stripe/stripe-react-native",  "Stripe Payments"],
  // Analytics / Crash
  ["@sentry/react-native",         "Sentry Crash Reporting"],
  // Network
  ["axios",                        "HTTP Client"],
  // Dev
  ["eas-cli",                      "EAS Build CLI"],
];

depChecks.forEach(([dep, label]) => {
  if (allDeps[dep]) {
    ok(`${dep}  ${DIM}(${label})${RESET}`);
  } else {
    fail(`${dep}  ${DIM}(${label})${RESET}`);
  }
});

// ─────────────────────────────────────────────
// 4. CODE QUALITY CHECKS
// ─────────────────────────────────────────────
head("4. CODE QUALITY CHECKS");

const allTSX = getAllFiles("app");

let hasLoading = 0, hasError = 0, hasTryCatch = 0, hasDummy = 0;

allTSX.forEach((f) => {
  const c = readFile(f);
  if (/isLoading|ActivityIndicator|loading.*true/i.test(c))  hasLoading++;
  if (/error|catch|onError/i.test(c))                         hasError++;
  if (/try\s*\{/.test(c))                                     hasTryCatch++;
  if (/dummy|hardcoded|\/\/ mock|MOCK_DATA|fakeData/i.test(c)) hasDummy++;
});

hasLoading > 3  ? ok(`Loading states found (${hasLoading} files)`)  : fail(`Loading states — only ${hasLoading} files have them`);
hasError  > 3   ? ok(`Error handling found (${hasError} files)`)    : fail(`Error handling — only ${hasError} files have it`);
hasTryCatch > 2 ? ok(`try/catch blocks found (${hasTryCatch} files)`) : warn(`try/catch — only ${hasTryCatch} files`);
hasDummy === 0  ? ok("No dummy/hardcoded data detected")            : fail(`Dummy/hardcoded data in ${hasDummy} files — replace with real API`);

// ─────────────────────────────────────────────
// 5. DESIGN SYSTEM CHECK
// ─────────────────────────────────────────────
head("5. LUXORA DESIGN SYSTEM");

const colorTokens = ["#0A0A0F", "#C9A84C", "#F0C040", "#0E0E15"];
const themeFile = exists("constants/Colors.ts")
  ? "constants/Colors.ts"
  : exists("constants/theme.ts")
  ? "constants/theme.ts"
  : exists("theme.ts")
  ? "theme.ts"
  : null;

themeFile ? ok(`Theme file found: ${themeFile}`) : warn("No dedicated theme/colors file found");

if (themeFile) {
  const themeContent = readFile(themeFile);
  colorTokens.forEach((color) => {
    themeContent.includes(color)
      ? ok(`Color token ${color} defined`)
      : fail(`Color token ${color} MISSING in theme`);
  });
}

// Check emoji usage
let emojiFiles = 0;
const emojiPattern = /[\u{1F300}-\u{1FFFF}]/u;
allTSX.forEach((f) => {
  if (emojiPattern.test(readFile(f))) emojiFiles++;
});
emojiFiles === 0
  ? ok("No emojis found (Unicode symbols only — correct!)")
  : fail(`Emojis found in ${emojiFiles} files — replace with Unicode symbols`);

// ─────────────────────────────────────────────
// 6. APP CONFIG CHECK
// ─────────────────────────────────────────────
head("6. APP CONFIG (app.json)");

const appJSON = readJSON("app.json");
if (appJSON) {
  const expo = appJSON.expo || {};

  expo.name         ? ok(`App name: "${expo.name}"`)           : fail("App name not set");
  expo.slug         ? ok(`Slug: "${expo.slug}"`)               : fail("Slug not set");
  expo.version      ? ok(`Version: ${expo.version}`)           : fail("Version not set");
  expo.icon         ? ok("App icon configured")                : fail("App icon missing");
  expo.splash       ? ok("Splash screen configured")           : fail("Splash screen missing");
  expo.android?.package
    ? ok(`Android package: ${expo.android.package}`)
    : fail("Android package name not set (needed for Play Store)");
  expo.ios?.bundleIdentifier
    ? ok(`iOS bundle ID: ${expo.ios.bundleIdentifier}`)
    : fail("iOS bundle identifier not set (needed for App Store)");
  expo.scheme
    ? ok(`Deep link scheme: ${expo.scheme}`)
    : warn("Deep link scheme not configured");
  expo.plugins?.length > 0
    ? ok(`Expo plugins: ${expo.plugins.length} configured`)
    : warn("No Expo plugins configured");
} else {
  fail("app.json not found or invalid");
}

// ─────────────────────────────────────────────
// 7. EAS BUILD CHECK
// ─────────────────────────────────────────────
head("7. EAS BUILD CONFIG");

const easJSON = readJSON("eas.json");
if (easJSON) {
  ok("eas.json exists");
  easJSON.build?.development ? ok("Development build profile")   : warn("No development build profile");
  easJSON.build?.preview     ? ok("Preview build profile")       : warn("No preview build profile");
  easJSON.build?.production  ? ok("Production build profile")    : fail("No production build profile");
} else {
  fail("eas.json missing — run: eas build:configure");
}

// ─────────────────────────────────────────────
// 8. LOCALIZATION CHECK
// ─────────────────────────────────────────────
head("8. LOCALIZATION (Arabic/RTL)");

exists("locales") || exists("i18n") || exists("translations")
  ? ok("i18n folder found")
  : fail("No localization folder (Arabic support missing)");

const hasI18n = allDeps["i18n-js"] || allDeps["react-i18next"] || allDeps["expo-localization"];
hasI18n
  ? ok("i18n library installed")
  : fail("No i18n library — Arabic/RTL support not implemented");

// ─────────────────────────────────────────────
// FINAL SCORE
// ─────────────────────────────────────────────
head("FINAL SUMMARY");

const totalScreensExpected = expectedScreens.length;
const screenPct = Math.round((screensDone / totalScreensExpected) * 100);

console.log(`\n  Screens Done   : ${GREEN}${screensDone}${RESET} / ${totalScreensExpected}  (${screenPct}%)`);
console.log(`  Screens Missing: ${RED}${screensMiss}${RESET}\n`);

const phases = [
  { phase: "Phase 1 — Backend/Auth Integration",    done: hasDummy === 0 && hasLoading > 3 },
  { phase: "Phase 2 — Booking & Payment Flow",      done: allDeps["@stripe/stripe-react-native"] != null },
  { phase: "Phase 3 — EAS Build & App Store Setup", done: easJSON?.build?.production != null },
  { phase: "Phase 4 — Arabic/RTL Support",          done: hasI18n != null },
  { phase: "Phase 5 — Analytics & Crash Reporting", done: allDeps["@sentry/react-native"] != null },
];

phases.forEach(({ phase, done }) => (done ? ok : fail)(phase));

line();
console.log(`\n${BOLD}  Run from LUXORA project root:${RESET}`);
console.log(`  ${CYAN}node luxora-audit.js${RESET}\n`);