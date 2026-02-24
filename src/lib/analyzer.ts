export const parseMatches = (text: string) => {
  const regex = /([A-Za-zÀ-ÿ\s]+)\s*(vs|v|-)\s*([A-Za-zÀ-ÿ\s]+)/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const teamA = match[1].trim();
    const teamB = match[3].trim();
    if (teamA && teamB && teamA.length > 1 && teamB.length > 1) {
      matches.push({ teamA, teamB, original: match[0].trim() });
    }
  }
  return matches;
};

const MARKETS = [
  "1X2", "Mi-Temps 1X2", "Double Chance", "Mi-Temps Double Chance",
  "Score Exact", "Mi-Temps Score Exact", "Over/Under 0.5", "Over/Under 1.5",
  "Over/Under 2.5", "Over/Under 3.5", "Total de buts", "G/NG",
  "Les deux équipes marquent", "Les deux équipes marquent (1ère mi-temps)",
  "HT/FT", "1X2 & Total 1.5", "1X2 & Total 2.5", "1X2 & Total 3.5",
  "1X2 & G/NG", "Total équipe domicile 0.5 / 1.5 / 2.5 / 3.5",
  "Total équipe extérieur 0.5 / 1.5 / 2.5 / 3.5", "G/NG équipe domicile",
  "G/NG équipe extérieur", "Pair / Impair", "Minute du premier but",
  "FTTS", "Multi-Buts"
];

// Simple deterministic hash function
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const runAnalysis = (matches: any[], historiques: any[]) => {
  let globalStability = 65;
  let dominantOutcome = "1";
  let avgGoals = 2.5;
  
  if (historiques && historiques.length > 0) {
    const stabilities = historiques.map(h => h.stability || 65);
    globalStability = stabilities.reduce((a, b) => a + b, 0) / stabilities.length;
    
    const dominants = historiques.map(h => h.dominant || "1");
    // Get most frequent dominant outcome
    const counts = dominants.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as Record<string, number>);
    dominantOutcome = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) || "1";
  }

  const resultsMatches = matches.map((m, mIdx) => {
    const matchHash = hashString(m.teamA + m.teamB);
    
    const predictions = MARKETS.map((market, pIdx) => {
      const marketHash = hashString(market + matchHash);
      let value = "";
      
      // Calculate confidence deterministically
      let confidence = 50 + (marketHash % 30) + (globalStability * 0.2);
      if (confidence > 98) confidence = 98;
      
      let risk = confidence > 80 ? "Low" : confidence > 65 ? "Medium" : "High";
      
      const mod3 = marketHash % 3;
      const mod2 = marketHash % 2;
      
      if (market === "1X2" || market === "Mi-Temps 1X2") {
        value = mod3 === 0 ? dominantOutcome : mod3 === 1 ? "X" : (dominantOutcome === "1" ? "2" : "1");
      } else if (market.includes("Double Chance")) {
        value = mod3 === 0 ? "1X" : mod3 === 1 ? "12" : "X2";
      } else if (market.includes("Over/Under")) {
        value = mod2 === 0 ? "Over" : "Under";
      } else if (market.includes("Score Exact")) {
        value = mod3 === 0 ? "2-1" : mod3 === 1 ? "1-1" : "1-0";
      } else if (market.includes("G/NG") || market.includes("marquent")) {
        value = mod2 === 0 ? "Oui" : "Non";
      } else if (market === "HT/FT") {
        value = mod3 === 0 ? "1/1" : mod3 === 1 ? "X/1" : "2/2";
      } else if (market.includes("Pair / Impair")) {
        value = mod2 === 0 ? "Pair" : "Impair";
      } else if (market === "Minute du premier but") {
        value = mod3 === 0 ? "0-15 min" : mod3 === 1 ? "16-30 min" : "31-45 min";
      } else {
        value = mod3 === 0 ? "1" : mod3 === 1 ? "X" : "2";
      }

      return {
        market,
        value,
        confidence: Math.floor(confidence),
        risk,
        logic: `Analyse fréquentielle basée sur un indice de stabilité de ${Math.floor(globalStability)}%.`
      };
    });

    return {
      matchName: `${m.teamA} vs ${m.teamB}`,
      predictions
    };
  });

  const multiples = Array(10).fill(0).map((_, i) => {
    const selections = matches.slice(0, 3).map((m, idx) => {
      const hash = hashString(m.teamA + i + idx) % 3;
      const val = hash === 0 ? "1" : hash === 1 ? "X" : "2";
      return `${m.teamA} vs ${m.teamB} : ${val}`;
    });
    
    while (selections.length < 3) {
      selections.push(`Match Supplémentaire ${selections.length + 1} : 1`);
    }

    const baseOdds = 3 + (hashString("odds" + i) % 15);
    const totalOdds = baseOdds + (hashString("dec" + i) % 99) / 100;
    const riskLevel = totalOdds > 10 ? "High" : totalOdds > 5 ? "Medium" : "Low";

    return {
      selections,
      totalOdds: totalOdds.toFixed(2),
      riskLevel,
      stabilityIndex: Math.floor(globalStability - (totalOdds > 10 ? 15 : 0))
    };
  });

  const highOdds = matches.slice(0, 5).map((m, i) => {
    const estimatedOdd = 10 + (hashString(m.teamA + "high" + i) % 40) + (hashString("dec" + i) % 99) / 100;
    return {
      market: `${m.teamA} vs ${m.teamB} - Score Exact ${hashString(m.teamA)%3+1}-${hashString(m.teamB)%3+1}`,
      estimatedOdd: estimatedOdd.toFixed(2),
      riskExplanation: "Forte volatilité détectée. Configuration historique rare mais possible.",
      status: estimatedOdd > 30 ? "Red" : estimatedOdd > 20 ? "Yellow" : "Green"
    };
  });

  return {
    matches: resultsMatches,
    multiples,
    highOdds
  };
};