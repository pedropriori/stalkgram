const DEFAULT_LOCATION_ENDPOINT = "https://ipapi.co";

interface IpApiResponse {
  city?: string;
}

export async function getUserCity(ip?: string): Promise<string> {
  try {
    const formattedIp = ip && ip !== "::1" ? ip : "";
    const endpoint = formattedIp
      ? `${DEFAULT_LOCATION_ENDPOINT}/${formattedIp}/json/`
      : `${DEFAULT_LOCATION_ENDPOINT}/json/`;

    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      return "";
    }

    const data = (await response.json()) as IpApiResponse;
    const city = data.city?.trim();
    return city ?? "";
  } catch (error) {
    console.error("Failed to fetch user city", error);
    return "";
  }
}



