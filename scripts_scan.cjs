const fs = require("fs");
const path = require("path");

const root = ".";
const skip = new Set([
  "node_modules",
  ".git",
  ".expo",
  "ios",
  "android",
  "dist",
  "build",
  ".expo-shared",
  ".vscode",
]);
const targets = ["BlurView", "LinearGradient", "MotiView"];

const layoutToken =
  /^(flex(-\S+)?|items-\S+|justify-\S+|self-\S+|content-\S+|gap-\S+|space-[xy]-\S+|p([trblxy])?-\S+|m([trblxy])?-\S+|w-\S+|h-\S+|min-w-\S+|min-h-\S+|max-w-\S+|max-h-\S+|aspect-\S+|basis-\S+|grow|shrink)$/;

function findOpenTagEnd(src, start) {
  let i = start + 1,
    dq = false,
    sq = false,
    bt = false,
    brace = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '"' && !sq && !bt) {
      dq = !dq;
      continue;
    }
    if (c === "'" && !dq && !bt) {
      sq = !sq;
      continue;
    }
    if (c === "`" && !dq && !sq) {
      bt = !bt;
      continue;
    }
    if (dq || sq || bt) continue;
    if (c === "{") brace++;
    if (c === "}") brace--;
    if (c === ">" && brace <= 0) return i;
  }
  return -1;
}

function layoutTokens(cls) {
  return cls.split(/\s+/).filter((t) => t && layoutToken.test(t));
}

function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (skip.has(f)) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.tsx$/.test(f)) {
      const src = fs.readFileSync(p, "utf8");
      const tagRe = new RegExp("<(" + targets.join("|") + ")\\b", "g");
      let m;
      while ((m = tagRe.exec(src))) {
        const openEnd = findOpenTagEnd(src, m.index + 1);
        if (openEnd === -1) continue;
        const openTag = src.slice(m.index, openEnd + 1);
        const cm = openTag.match(/className="([^"]*)"/);
        if (!cm) continue;
        const cls = cm[1];
        const toks = layoutTokens(cls);
        if (!toks.length) continue;
        const selfClosing = /\/\s*>$/.test(openTag);
        const line = src.slice(0, m.index).split("\n").length;
        console.log(
          (selfClosing ? "SELF " : "OPEN ") +
            p +
            " | " +
            m[1] +
            " | " +
            line +
            ' | "' +
            cls +
            '" | layout=[' +
            toks.join(",") +
            "]"
        );
      }
    }
  }
}
walk(root);
