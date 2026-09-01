import { describe, expect, it } from "vitest";
import { formatDauer, formatZeit, parseZeit } from "./zeit.js";

describe("parseZeit", () => {
  it("liest eine Uhrzeit als Minuten seit Mitternacht", () => {
    expect(parseZeit("08:00")).toBe(480);
    expect(parseZeit("00:00")).toBe(0);
    expect(parseZeit("23:59")).toBe(1439);
  });

  it("weist eine unlesbare Uhrzeit zurück", () => {
    expect(() => parseZeit("8 Uhr")).toThrow(/Ungültige Uhrzeit/);
    expect(() => parseZeit("25:00")).toThrow(/Ungültige Uhrzeit/);
  });
});

describe("formatZeit", () => {
  it("schreibt die Uhrzeit zweistellig", () => {
    expect(formatZeit(480)).toBe("08:00");
    expect(formatZeit(1439)).toBe("23:59");
  });

  it("markiert Zeiten am Folgetag", () => {
    expect(formatZeit(1470)).toBe("00:30+1");
  });
});

describe("formatDauer", () => {
  it("schreibt Dauern unter einer Stunde in Minuten", () => {
    expect(formatDauer(43)).toBe("43min");
  });

  it("schreibt längere Dauern als Stunden und Minuten", () => {
    expect(formatDauer(144)).toBe("2h24");
  });
});
