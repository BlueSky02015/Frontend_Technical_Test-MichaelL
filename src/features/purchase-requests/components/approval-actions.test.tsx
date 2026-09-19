import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import { resetDb } from "@/api/mock-db";
import { repositories } from "@/api/repositories";
import { renderWithQueryClient } from "@/test/test-utils";
import { ApprovalActions } from "@/features/purchase-requests/components/approval-actions";
import type { PurchaseRequest } from "@/types/domain";

async function getSubmittedRequest(): Promise<PurchaseRequest> {
  const all = await repositories.purchaseRequests.list();
  const submitted = all.find((pr) => pr.status === "SUBMITTED");
  if (!submitted) throw new Error("Expected a seeded SUBMITTED request for this test");
  return submitted;
}

describe("ApprovalActions", () => {
  beforeEach(() => {
    resetDb();
  });

  it("requires a rejection reason before the Reject button can be confirmed", async () => {
    const user = userEvent.setup();
    const request = await getSubmittedRequest();
    renderWithQueryClient(<ApprovalActions request={request} />);

    await user.click(screen.getByRole("button", { name: /reject/i }));
    await user.click(screen.getByRole("button", { name: /reject request/i }));

    expect(await screen.findByText(/rejection reason is required/i)).toBeInTheDocument();
    // The request must still be SUBMITTED — nothing was persisted.
    const stillSubmitted = await repositories.purchaseRequests.getById(request.id);
    expect(stillSubmitted?.status).toBe("SUBMITTED");
  });

  it("rejects the request once a reason is provided, without a page reload", async () => {
    const user = userEvent.setup();
    const request = await getSubmittedRequest();
    renderWithQueryClient(<ApprovalActions request={request} />);

    await user.click(screen.getByRole("button", { name: /reject/i }));
    await user.type(screen.getByLabelText(/rejection reason/i), "Not enough budget this quarter.");
    await user.click(screen.getByRole("button", { name: /reject request/i }));

    await waitFor(async () => {
      const updated = await repositories.purchaseRequests.getById(request.id);
      expect(updated?.status).toBe("REJECTED");
      expect(updated?.rejectionReason).toBe("Not enough budget this quarter.");
    });
  });

  it("approves the request when Approve is confirmed", async () => {
    const user = userEvent.setup();
    const request = await getSubmittedRequest();
    renderWithQueryClient(<ApprovalActions request={request} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Approve" }));

    await waitFor(async () => {
      const updated = await repositories.purchaseRequests.getById(request.id);
      expect(updated?.status).toBe("APPROVED");
    });
  });
});
