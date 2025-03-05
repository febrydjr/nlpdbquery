
import { TableSchema, ColumnSchema } from '@/data/mock-data';

// Function to find similar table names (for typo detection)
export const findSimilarTable = (query: string, tables: TableSchema[]): TableSchema | null => {
  // Get all words from the query
  const words = query.toLowerCase().split(/\s+/);
  
  // For each table, check if a similar name exists in the query
  for (const table of tables) {
    const tableName = table.name.toLowerCase();
    
    // Exact match
    if (words.includes(tableName)) {
      return table;
    }
    
    // Fuzzy match - if a word is at least 70% similar to the table name
    for (const word of words) {
      if (word.length >= 4) { // Only check words of reasonable length
        // Simple Levenshtein distance calculation
        const distance = levenshteinDistance(word, tableName);
        const similarity = 1 - (distance / Math.max(word.length, tableName.length));
        
        if (similarity > 0.7) {
          return table;
        }
      }
    }
  }
  
  return null;
};

// Find the closest matching table name using fuzzy matching
export const findClosestTableMatch = (tableName: string, tables: TableSchema[]): TableSchema | null => {
  if (!tableName || tableName.length < 2) {
    return tables.length > 0 ? tables[0] : null;
  }
  
  // First try exact match
  const exactMatch = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
  if (exactMatch) return exactMatch;
  
  // Then try fuzzy match
  let bestMatch: TableSchema | null = null;
  let bestSimilarity = 0;
  
  for (const table of tables) {
    const distance = levenshteinDistance(tableName.toLowerCase(), table.name.toLowerCase());
    const similarity = 1 - (distance / Math.max(tableName.length, table.name.length));
    
    if (similarity > bestSimilarity && similarity > 0.4) {
      bestSimilarity = similarity;
      bestMatch = table;
    }
  }
  
  return bestMatch;
};

// Find the closest matching column name
export const findColumnMatch = (columnName: string, columns: ColumnSchema[]): ColumnSchema | null => {
  if (!columnName || columnName.length < 2) {
    return columns.length > 0 ? columns[0] : null;
  }
  
  // First try exact match
  const exactMatch = columns.find(c => c.name.toLowerCase() === columnName.toLowerCase());
  if (exactMatch) return exactMatch;
  
  // Then try fuzzy match
  let bestMatch: ColumnSchema | null = null;
  let bestSimilarity = 0;
  
  for (const column of columns) {
    const distance = levenshteinDistance(columnName.toLowerCase(), column.name.toLowerCase());
    const similarity = 1 - (distance / Math.max(columnName.length, column.name.length));
    
    if (similarity > bestSimilarity && similarity > 0.4) {
      bestSimilarity = similarity;
      bestMatch = column;
    }
  }
  
  return bestMatch;
};

// Levenshtein distance for fuzzy matching
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) === a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1, // substitution
          matrix[i][j-1] + 1,   // insertion
          matrix[i-1][j] + 1    // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};
