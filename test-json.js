function repairJSON(text) {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '');
    if (clean.endsWith('```')) clean = clean.replace(/```$/, '');
    clean = clean.trim();
    
    // If it doesn't end with ], we have a truncation
    if (!clean.endsWith(']')) {
        console.log("Fixing truncated JSON...");
        // Remove the last incomplete object (anything after the last '{')
        const lastBrace = clean.lastIndexOf('{');
        const lastBracket = clean.lastIndexOf('}');
        
        if (lastBrace > lastBracket) {
            clean = clean.substring(0, lastBrace);
        }
        
        // Remove trailing commas
        clean = clean.replace(/,\s*$/, '');
        
        if (!clean.endsWith(']')) {
            clean += ']';
        }
    }
    return clean;
}

const bad = `[
  {"code": "1.1.0", "value": "Test"},
  {"code": "1.2.0", "va`;

console.log(JSON.parse(repairJSON(bad)));
