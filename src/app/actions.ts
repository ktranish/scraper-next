"use server";

const CONTENT_TYPE_JSON = "application/json";

async function handleResponse(res: Response): Promise<any> {
  // Determine the content type of the response
  const contentType = res.headers.get("Content-Type")?.toLowerCase();

  if (contentType && contentType.includes(CONTENT_TYPE_JSON)) {
    return res.json(); // Parse JSON response
  } else {
    return res.text(); // Parse as text if it's not JSON
  }
}

export async function scrape(url: string) {
  const res = await fetch(
    `${process.env.SCRAPE_URL}/scrape?url=https://${url}`,
  );

  if (!res.ok) {
    throw new Error(
      `Failed to scrape URL: ${url}. Status: ${res.status} - ${res.statusText}`,
    );
  }

  return handleResponse(res);
}

export async function extract(url: string, selector: string) {
  const res = await fetch(`${process.env.SCRAPE_URL}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": CONTENT_TYPE_JSON,
    },
    body: JSON.stringify({ url, selector }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to extract from URL: ${url} with selector: ${selector}. Status: ${res.status} - ${res.statusText}`,
    );
  }

  return handleResponse(res);
}
