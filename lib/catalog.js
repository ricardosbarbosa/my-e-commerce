export async function loadStorefrontCatalog() {
  const response = await fetch("/api/catalog", { headers: { accept: "application/json" } });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.error || `Catalog request failed with ${response.status}`);
  }

  return response.json();
}
