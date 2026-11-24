import {messages} from "./translations.mjs";

export const languages = ["vi", "en", "ja"];
const localeNames = {vi: "vi-VN", en: "en-US", ja: "ja-JP"};
const preferenceKey = "mo-phong-tu-dien-language";
let language = "vi";
const generatedMessages = new Map();

export function getLanguage() { return language; }
export function getLocale() { return localeNames[language]; }

export function setLanguage(value, storage) {
  language = languages.includes(value) ? value : "vi";
  try { storage?.setItem(preferenceKey, language); } catch { /* Language still works for this session. */ }
  return language;
}

export function restoreLanguage(storage) {
  let value;
  try { value = storage?.getItem(preferenceKey); } catch { /* First use defaults to Vietnamese. */ }
  return setLanguage(value);
}

export function t(source, ...values) {
  const template = Array.isArray(source);
  const key = template ? source.map((part, i) => part + (i < values.length ? `{${i}}` : "")).join("") : source;
  const translated = language === "vi" ? key : messages[key]?.[language === "en" ? 0 : 1] ?? key;
  const result = template ? translated.replace(/\{(\d+)\}/g, (_, index) => String(values[Number(index)])) : translated;
  if (template && Object.hasOwn(messages, key)) {
    if (generatedMessages.size >= 10000) generatedMessages.delete(generatedMessages.keys().next().value);
    generatedMessages.set(result, {key, values});
  }
  return result;
}

export function translateGenerated(text) {
  const entry = generatedMessages.get(text);
  if (!entry) return t(text);
  const pattern = language === "vi" ? entry.key : messages[entry.key]?.[language === "en" ? 0 : 1] ?? entry.key;
  return pattern.replace(/\{(\d+)\}/g, (_, index) => String(entry.values[Number(index)]));
}

// Bind only the authored HTML. Project names, tags and other user values have no bindings.
export function bindStaticUI(root) {
  const texts = [];
  const attrs = [];
  const walker = root.ownerDocument.createTreeWalker(root, 4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue;
    const key = text.trim();
    if (Object.hasOwn(messages, key) && !node.parentElement.closest("script, style, [data-language-name]")) {
      texts.push({node, key, prefix: text.slice(0, text.indexOf(key)), suffix: text.slice(text.indexOf(key) + key.length)});
    }
  }
  for (const node of root.querySelectorAll("*")) {
    for (const name of ["title", "aria-label", "placeholder"]) {
      const source = node.getAttribute(name);
      if (source && Object.hasOwn(messages, source)) attrs.push({node, name, source});
    }
  }
  return () => {
    for (const {node, key, prefix, suffix} of texts) node.nodeValue = prefix + t(key) + suffix;
    for (const {node, name, source} of attrs) node.setAttribute(name, t(source));
  };
}
