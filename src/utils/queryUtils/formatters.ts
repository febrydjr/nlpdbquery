
// Format JSON output with proper indentation and readability
export const formatAsJson = (data: any) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error formatting JSON:', error);
    return '// Error formatting JSON data';
  }
};

// Format SQL output with syntax highlighting and readability
export const formatSql = (sql: string) => {
  if (!sql) return '';
  
  // Simple SQL formatter that adds line breaks and indentation
  // for common SQL keywords to improve readability
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 
    'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
    'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT'
  ];
  
  let formattedSql = sql.trim();
  
  // Add line breaks before keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formattedSql = formattedSql.replace(regex, `\n${keyword}`);
  });
  
  // Handle indentation for JOIN clauses
  formattedSql = formattedSql.replace(/\nJOIN/gi, '\n  JOIN');
  formattedSql = formattedSql.replace(/\nLEFT JOIN/gi, '\n  LEFT JOIN');
  formattedSql = formattedSql.replace(/\nRIGHT JOIN/gi, '\n  RIGHT JOIN');
  formattedSql = formattedSql.replace(/\nINNER JOIN/gi, '\n  INNER JOIN');
  
  // Indent WHERE conditions
  formattedSql = formattedSql.replace(/\nWHERE\s+/gi, '\nWHERE\n  ');
  
  // Add indentation to ON clauses
  formattedSql = formattedSql.replace(/\bON\b/gi, '\n    ON');
  
  // Fix any double line breaks
  formattedSql = formattedSql.replace(/\n\s*\n/g, '\n');
  
  return formattedSql;
};
