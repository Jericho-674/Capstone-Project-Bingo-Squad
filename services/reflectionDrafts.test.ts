import { afterEach, describe, expect, it, vi } from "vitest";
import { DeleteDraftError, deleteReflectionDraft } from "./reflectionDrafts";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("deleteReflectionDraft", () => {
  it("sends one DELETE to the configured backend and clears its timeout", async () => {
    vi.useFakeTimers();
    const request = vi.fn().mockResolvedValue(
      Response.json({ message: "Draft deleted successfully" }),
    );
    vi.stubGlobal("fetch", request);

    await deleteReflectionDraft("https://backend.example///", "42");

    expect(request).toHaveBeenCalledExactlyOnceWith(
      "https://backend.example/api/reflections/42",
      expect.objectContaining({ method: "DELETE", signal: expect.any(AbortSignal) }),
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    [409, "Only draft reflections can be deleted"],
    [404, "Reflection not found"],
    [500, "Failed to delete draft"],
  ])("rejects HTTP %s so the caller keeps the reflection visible", async (status, message) => {
    const request = vi.fn().mockResolvedValue(Response.json({ message }, { status }));
    vi.stubGlobal("fetch", request);

    await expect(deleteReflectionDraft("https://backend.example", "42"))
      .rejects.toMatchObject({ name: "DeleteDraftError", message, status });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("does not report success for an HTML tunnel page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Tunnel unavailable</html>")));

    await expect(deleteReflectionDraft("https://backend.example", "42"))
      .rejects.toThrow("Could not confirm deletion");
  });

  it("does not report success for an invalid JSON acknowledgement", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({})));

    await expect(deleteReflectionDraft("https://backend.example", "42"))
      .rejects.toBeInstanceOf(DeleteDraftError);
  });

  it("explains an uncertain network outcome without retrying deletion", async () => {
    const request = vi.fn().mockRejectedValue(new TypeError("Network request failed"));
    vi.stubGlobal("fetch", request);

    await expect(deleteReflectionDraft("https://backend.example", "42"))
      .rejects.toThrow("reopen Reflection History before trying again");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("aborts an unresponsive request and releases the pending timeout", async () => {
    vi.useFakeTimers();
    const request = vi.fn((_url: string, { signal }: RequestInit) => new Promise((_resolve, reject) => {
      signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    }));
    vi.stubGlobal("fetch", request);

    const pending = expect(deleteReflectionDraft("https://backend.example", "42"))
      .rejects.toThrow("Could not confirm deletion");
    await vi.advanceTimersByTimeAsync(15000);
    await pending;

    expect(request).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
