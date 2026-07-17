"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  existingAwb?: string | null;
  trackingUrl?: string | null;
};

export default function CreateDelhiveryShipmentButton({
  orderId,
  existingAwb,
  trackingUrl,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleCreateShipment() {
    const confirmed = window.confirm(
      "Create a live Delhivery shipment for this order?"
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/delhivery/admin-create-shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          confirmLiveShipment: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to create Delhivery shipment"
        );
      }

      setSuccess(
        `Shipment created successfully. AWB: ${result.shipment.awb}`
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create shipment"
      );
    } finally {
      setLoading(false);
    }
  }

  if (existingAwb) {
    return (
      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-800">
          Delhivery shipment created
        </p>

        <p className="mt-1 text-sm text-green-700">
          AWB: {existingAwb}
        </p>

        {trackingUrl && (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block font-medium text-blue-600 underline"
          >
            Track Shipment
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleCreateShipment}
        disabled={loading}
        className="rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Creating Shipment..."
          : "Create Delhivery Shipment"}
      </button>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 text-sm font-medium text-green-600">
          {success}
        </p>
      )}
    </div>
  );
}