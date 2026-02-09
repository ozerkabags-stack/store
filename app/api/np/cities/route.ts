import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const apiKey = process.env.NP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NP_API_KEY is missing" }, { status: 500 });
  }

  const body = {
    apiKey,
    modelName: "Address",
    calledMethod: "searchSettlements",
    methodProperties: {
      CityName: q,
      Limit: 10,
      Page: 1,
    },
  };

  const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  const addresses = json?.data?.[0]?.Addresses ?? [];

const mapped = addresses.map((a: any) => ({
  label: a.Present,        // что показываем человеку
  cityRef: a.DeliveryCity, // нужно для отделений
}));

return NextResponse.json({ success: true, data: mapped });

}
