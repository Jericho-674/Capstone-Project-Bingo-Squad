import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportNativePortfolio, NativePortfolioExportError } from "./nativePortfolioExport";

vi.mock("expo-print", () => ({
  printToFileAsync: vi.fn(),
  printAsync: vi.fn(),
}));

vi.mock("expo-sharing", () => ({
  isAvailableAsync: vi.fn(),
  shareAsync: vi.fn(),
}));

const html = "<!doctype html><html><body><h1>Reflection portfolio</h1></body></html>";
const uri = "file:///data/user/0/host.exp.exponent/cache/Print/portfolio.pdf";
const permissionError = new Error(
  "Call to function 'ExpoSharing.shareAsync' has been rejected.\n" +
  "Caused by: Not allowed to read file under given URL.",
);

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
  vi.mocked(Print.printToFileAsync).mockResolvedValue({ uri, numberOfPages: 1 });
  vi.mocked(Sharing.shareAsync).mockResolvedValue(undefined);
  vi.mocked(Print.printAsync).mockResolvedValue(undefined);
});

describe("exportNativePortfolio", () => {
  it.each(["android", "ios"])("preserves PDF sharing on %s", async (platform) => {
    await expect(exportNativePortfolio(html, platform)).resolves.toBe("shared");

    expect(Print.printToFileAsync).toHaveBeenCalledExactlyOnceWith({ html });
    expect(Sharing.shareAsync).toHaveBeenCalledExactlyOnceWith(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: "Export Reflection Portfolio",
    });
    // Share-sheet dismissal resolves too, and must not open a second dialog.
    expect(Print.printAsync).not.toHaveBeenCalled();
  });

  it("opens Android printing from HTML when the PDF cannot be read", async () => {
    vi.mocked(Sharing.shareAsync).mockRejectedValue(permissionError);

    await expect(exportNativePortfolio(html, "android")).resolves.toBe("print-dialog");

    expect(Print.printAsync).toHaveBeenCalledExactlyOnceWith({ html });
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    expect(Print.printToFileAsync).toHaveBeenCalledTimes(1);
  });

  it("can open Android printing when PDF file generation fails", async () => {
    vi.mocked(Print.printToFileAsync).mockRejectedValue(new Error("Could not save PDF"));

    await expect(exportNativePortfolio(html, "android")).resolves.toBe("print-dialog");

    expect(Print.printAsync).toHaveBeenCalledExactlyOnceWith({ html });
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it.each(["android", "ios"])("uses printing when sharing is unavailable on %s", async (platform) => {
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);

    await expect(exportNativePortfolio(html, platform)).resolves.toBe("print-dialog");

    expect(Print.printAsync).toHaveBeenCalledExactlyOnceWith({ html });
    expect(Print.printToFileAsync).not.toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it("uses Android printing if the availability check rejects", async () => {
    vi.mocked(Sharing.isAvailableAsync).mockRejectedValue(new Error("Sharing unavailable"));

    await expect(exportNativePortfolio(html, "android")).resolves.toBe("print-dialog");

    expect(Print.printAsync).toHaveBeenCalledExactlyOnceWith({ html });
    expect(Print.printToFileAsync).not.toHaveBeenCalled();
  });

  it("reports a device export error if Android sharing and printing both fail", async () => {
    const printError = new Error("Print service unavailable");
    vi.mocked(Sharing.shareAsync).mockRejectedValue(permissionError);
    vi.mocked(Print.printAsync).mockRejectedValue(printError);

    await expect(exportNativePortfolio(html, "android")).rejects.toMatchObject({
      name: "NativePortfolioExportError",
      message: expect.stringContaining("this device could not open PDF sharing or printing"),
      cause: printError,
    });
    expect(Print.printAsync).toHaveBeenCalledTimes(1);
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
  });

  it("reports print failures even when sharing is unavailable", async () => {
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);
    vi.mocked(Print.printAsync).mockRejectedValue(new Error("Print service unavailable"));

    await expect(exportNativePortfolio(html, "android")).rejects.toBeInstanceOf(NativePortfolioExportError);
    expect(Print.printAsync).toHaveBeenCalledTimes(1);
  });

  it("does not change iOS sharing failures into Android print fallbacks", async () => {
    vi.mocked(Sharing.shareAsync).mockRejectedValue(permissionError);

    await expect(exportNativePortfolio(html, "ios")).rejects.toBeInstanceOf(NativePortfolioExportError);

    expect(Print.printAsync).not.toHaveBeenCalled();
  });

  it("treats iOS print dismissal as cancellation, not an export failure", async () => {
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);
    vi.mocked(Print.printAsync).mockRejectedValue({ code: "ERR_PRINT_INCOMPLETE" });

    await expect(exportNativePortfolio(html, "ios")).resolves.toBe("cancelled");

    expect(Print.printAsync).toHaveBeenCalledTimes(1);
  });
});
