export function safeParseAbstractedData(data: any): any[] {
    if (!data) return [];
    
    let parsed = data;
    // Keep parsing as long as it's a string (handles double or triple stringification)
    let depth = 0;
    while (typeof parsed === 'string' && depth < 5) {
        try {
            parsed = JSON.parse(parsed);
        } catch (e) {
            console.error("Failed to parse abstractedData string:", e);
            break;
        }
        depth++;
    }
    
    // Validate output is array
    if (Array.isArray(parsed)) {
        return parsed;
    }
    
    return [];
}
