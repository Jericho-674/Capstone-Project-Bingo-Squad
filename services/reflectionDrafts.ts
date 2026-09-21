export class DeleteDraftError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "DeleteDraftError";
  }
}

export async function deleteReflectionDraft(
  apiBaseUrl: string,
  reflectionId: string,
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}/api/reflections/${encodeURIComponent(reflectionId)}`,
      { method: "DELETE", signal: controller.signal },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new DeleteDraftError(
        typeof data?.message === "string"
          ? data.message
          : "Could not delete this draft. Please try again.",
        response.status,
      );
    }

    if (typeof data?.message !== "string") {
      throw new Error("Invalid deletion response");
    }
  } catch (error) {
    if (error instanceof DeleteDraftError) throw error;

    throw new DeleteDraftError(
      "Could not confirm deletion. Check your connection and reopen Reflection History before trying again.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
