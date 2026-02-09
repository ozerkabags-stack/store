import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityRef = (searchParams.get("cityRef") || "").trim();
  const q = (searchParams.get("q") || "").trim();

  if (!cityRef) return NextResponse.json({ success: true, data: [] });

  const apiKey = process.env.NP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NP_API_KEY is missing" }, { status: 500 });
  }

  const body = {
    apiKey,
    modelName: "Address",
    calledMethod: "getWarehouses",
    methodProperties: {
      CityRef: cityRef,
      FindByString: q,
      Limit: 10,
      Page: 1,
      Language: "UA",
    },
  };

  const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  const list = json?.data ?? [];

  const mapped = list.map((w: any) => ({
    ref: w.Ref,
    label: w.Description, // напр: "Відділення №12: ...", або "Поштомат №..."
    number: w.Number,
    type: w.TypeOfWarehouse,
  }));

  return NextResponse.json({ success: true, data: mapped });
}
