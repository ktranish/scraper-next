"use server";

export async function scrape(url: string) {
  const res = await fetch(
    `${process.env.SCRAPE_URL}/scrape?url=https://${url}`,
  );

  if (!res.ok)
    throw new Error(`Failed to scrape: ${res.status} - ${res.statusText}`);

  // Determine the content type of the response
  const contentType = res.headers.get("Content-Type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json(); // Parse JSON response
  } else {
    data = await res.text(); // Parse as text if it's not JSON
  }

  return data;
}

export async function extract(url: string, selector: string) {
  const res = await fetch(`${process.env.SCRAPE_URL}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      selector,
    }),
  });

  if (!res.ok)
    throw new Error(`Failed to extract: ${res.status} - ${res.statusText}`);

  // Determine the content type of the response
  const contentType = res.headers.get("Content-Type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json(); // Parse JSON response
  } else {
    data = await res.text(); // Parse as text if it's not JSON
  }

  return data;
}
