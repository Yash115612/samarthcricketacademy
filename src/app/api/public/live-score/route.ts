import "server-only";
import { NextResponse } from "next/server";

interface InningsScore {
  team: string;
  runs: number;
  wickets: number;
  overs: string;
  isCurrent: boolean;
}

interface LiveScoreResult {
  ok: boolean;
  status: string;
  innings: InningsScore[];
  result: string | null;
  fetched_at: string;
}

async function scrapeCricHeroes(url: string): Promise<LiveScoreResult> {
  const result: LiveScoreResult = {
    ok: true,
    status: "unknown",
    innings: [],
    result: null,
    fetched_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      result.ok = false;
      return result;
    }

    const html = await res.text();

    // Parse __NEXT_DATA__ for rich structured data
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const pageProps = nextData.props?.pageProps;

        // Try various possible data structures
        const matchData = pageProps?.match
          ?? pageProps?.matchInfo
          ?? pageProps?.matchData
          ?? pageProps?.data?.match
          ?? pageProps?.scorecard?.match
          ?? null;

        if (matchData) {
          // Extract status
          const rawStatus = (matchData.status ?? matchData.match_status ?? "").toLowerCase();
          if (rawStatus.includes("live") || rawStatus === "inprogress") {
            result.status = "Live";
          } else if (rawStatus.includes("complet") || rawStatus === "finished") {
            result.status = "Completed";
          } else {
            result.status = "Upcoming";
          }

          // Extract result
          result.result = matchData.result
            ?? matchData.result_text
            ?? matchData.match_result
            ?? null;

          // Extract innings
          const inningsData = matchData.innings
            ?? matchData.scorecard
            ?? pageProps?.scorecard?.innings
            ?? [];

          const inningsArray = Array.isArray(inningsData) ? inningsData : [inningsData];

          for (const inn of inningsArray) {
            if (!inn || typeof inn !== "object") continue;

            const teamName =
              inn.team?.name
              ?? inn.batting_team?.name
              ?? inn.team_name
              ?? "";

            const isCurrent =
              String(inn.status ?? inn.isCurrent ?? "").toLowerCase() === "current"
              || String(inn.is_current ?? "").toLowerCase() === "true"
              || inn.isCurrent === true;

            const runs = Number(inn.runs ?? inn.runs_scored ?? 0);
            const wickets = Number(inn.wickets ?? inn.wickets_lost ?? 0);
            const overs = String(inn.overs ?? inn.overs_bowled ?? "0");

            result.innings.push({
              team: teamName || `Team ${result.innings.length + 1}`,
              runs,
              wickets,
              overs,
              isCurrent,
            });
          }

          // If no innings found via __NEXT_DATA__, try batting summary parsing
          if (result.innings.length === 0) {
            // Look for score patterns in HTML: "154/4 (18.2)"
            const scorePattern = /([A-Za-z\s&]+?)\s*[:\-]?\s*(\d+)\/(\d+)\s*\(?([\d.]+)\)?/g;
            let match2;
            while ((match2 = scorePattern.exec(html)) !== null) {
              const team = match2[1].trim().replace(/^VS\s+/i, "");
              const runs = parseInt(match2[2]);
              const wickets = parseInt(match2[3]);
              const overs = match2[4];
              
              if (team && !isNaN(runs)) {
                result.innings.push({
                  team,
                  runs,
                  wickets,
                  overs,
                  isCurrent: false, // will adjust below
                });
              }
            }
          }
        }
      } catch {
        // Fall through to regex parsing
      }
    }

    // Fallback: parse score patterns directly from HTML
    if (result.innings.length === 0) {
      const scorePattern = /([A-Za-z\s&]+?)\s*[:\-]?\s*(\d+)\/(\d+)\s*\(?([\d.]+)\)?/g;
      let match;
      while ((match = scorePattern.exec(html)) !== null) {
        const [, team, runsStr, wicketsStr, oversStr] = match;
        const runs = parseInt(runsStr, 10);
        const wickets = parseInt(wicketsStr, 10);
        if (runs > 0 || wickets > 0) {
          result.innings.push({
            team: team.trim(),
            runs,
            wickets,
            overs: oversStr || "0",
            isCurrent: result.innings.length === 0,
          });
          if (result.innings.length >= 2) break;
        }
      }

      // Detect live status from HTML indicators
      if (html.includes("LIVE") || html.includes("In Progress") || html.includes("current")) {
        result.status = "Live";
      } else if (html.includes("Completed") || html.includes("Finished")) {
        result.status = "Completed";
      } else {
        result.status = result.innings.length > 0 ? "Live" : "unknown";
      }
    }
  } catch {
    result.ok = false;
  }

  return result;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ ok: false, error: "URL is required" }, { status: 400 });
  }

  // Validate URL is from cricheroes
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("cricheroes")) {
      return NextResponse.json({ ok: false, error: "Only CricHeroes URLs are supported" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid URL" }, { status: 400 });
  }

  const result = await scrapeCricHeroes(url);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
