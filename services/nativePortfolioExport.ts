import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type NativeExportResult = "shared" | "print-dialog" | "cancelled";

export class NativePortfolioExportError extends Error {
  constructor(cause: unknown) {
    super(
      "Your portfolio loaded, but this device could not open PDF sharing or printing. Try again, or export from the web app on your laptop.",
      { cause },
    );
    this.name = "NativePortfolioExportError";
  }
}

export async function exportNativePortfolio(
  html: string,
  platform: string,
): Promise<NativeExportResult> {
  try {
    try {
      if (await Sharing.isAvailableAsync()) {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: "Export Reflection Portfolio",
        });
        // Dismissing the share sheet also resolves; this does not confirm a save.
        return "shared";
      }
    } catch (error) {
      if (platform !== "android") throw error;
      // Android may reject access to the generated PDF. Render the original HTML
      // in its print dialog instead of trying to share/read the same rejected URI.
    }

    await Print.printAsync({ html });
    return "print-dialog";
  } catch (error) {
    // iOS rejects when its print dialog is dismissed without starting a job.
    if (
      platform === "ios" &&
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ERR_PRINT_INCOMPLETE"
    ) {
      return "cancelled";
    }
    throw new NativePortfolioExportError(error);
  }
}
