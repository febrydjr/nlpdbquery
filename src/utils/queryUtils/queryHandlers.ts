import { faker } from "@faker-js/faker";
import { Database, TableSchema, ColumnSchema } from "@/data/mock-data";
import { findClosestTableMatch, findColumnMatch } from "./fuzzyMatching";

// Generate a minimum of 20 records for data tables
const MIN_RECORDS = 20;

/**
 * Process a natural language query and convert it to SQL and data
 */
export const processNaturalLanguageQuery = (
  query: string,
  connectionId: string,
  databases: Database[]
) => {
  const normalizedQuery = query.toLowerCase().trim();
  const currentDB = databases.find((db) => db.id === connectionId);

  if (!currentDB) {
    throw new Error(`Database with connection ID ${connectionId} not found`);
  }

  // Find the appropriate handler for the query type
  if (isShowAllQuery(normalizedQuery)) {
    return handleShowAllQuery(normalizedQuery, currentDB);
  } else if (isFilterQuery(normalizedQuery)) {
    return handleFilterQuery(normalizedQuery, currentDB);
  } else if (isCountQuery(normalizedQuery)) {
    return handleCountQuery(normalizedQuery, currentDB);
  } else if (isJoinQuery(normalizedQuery)) {
    return handleJoinQuery(normalizedQuery, currentDB);
  } else if (isSortQuery(normalizedQuery)) {
    return handleSortQuery(normalizedQuery, currentDB);
  } else if (isEcommerceQuery(normalizedQuery)) {
    return handleEcommerceQuery(normalizedQuery, currentDB);
  } else if (isWarehouseQuery(normalizedQuery)) {
    return handleWarehouseQuery(normalizedQuery, currentDB);
  } else if (isWeddingQuery(normalizedQuery)) {
    return handleWeddingQuery(normalizedQuery, currentDB);
  } else if (isHospitalQuery(normalizedQuery)) {
    return handleHospitalQuery(normalizedQuery, currentDB);
  }

  // Default to a simple table lookup with fuzzy matching
  return handleDefaultQuery(normalizedQuery, currentDB);
};

// Query type checks
const isShowAllQuery = (query: string) => {
  return (
    query.includes("show all") ||
    query.includes("get all") ||
    query.includes("list all") ||
    query.includes("display all")
  );
};

const isFilterQuery = (query: string) => {
  return (
    query.includes("where") ||
    query.includes("with") ||
    query.includes("find") ||
    query.includes("filter") ||
    query.includes("greater than") ||
    query.includes("less than") ||
    query.includes("equal to") ||
    query.includes("more than") ||
    query.includes("at least") ||
    query.includes("at most")
  );
};

const isCountQuery = (query: string) => {
  return query.includes("count") || query.includes("how many");
};

const isJoinQuery = (query: string) => {
  return (
    (query.includes("join") ||
      query.includes("combine") ||
      query.includes("related")) &&
    (query.includes(" and ") || query.includes(" with "))
  );
};

const isSortQuery = (query: string) => {
  return (
    query.includes("sort") ||
    query.includes("order") ||
    query.includes("arranged") ||
    query.includes("ascending") ||
    query.includes("descending")
  );
};

const isEcommerceQuery = (query: string) => {
  return (
    query.includes("product") ||
    query.includes("order") ||
    query.includes("customer") ||
    query.includes("sale") ||
    query.includes("revenue") ||
    query.includes("purchase")
  );
};

const isWarehouseQuery = (query: string) => {
  return (
    query.includes("inventory") ||
    query.includes("stock") ||
    query.includes("warehouse") ||
    query.includes("shipment") ||
    query.includes("supply") 
  );
};

const isWeddingQuery = (query: string) => {
  return (
    query.includes("wedding") ||
    query.includes("event") ||
    query.includes("guest") ||
    query.includes("organizer") ||
    query.includes("vendor")
  );
};

const isHospitalQuery = (query: string) => {
  return (
    query.includes("patient") ||
    query.includes("doctor") ||
    query.includes("appointment") ||
    query.includes("medical") ||
    query.includes("hospital")
  );
};

// Query handlers
export const handleShowAllQuery = (query: string, database: Database) => {
  // Extract table name from query
  const tableWords = query.split(/\s+/);
  const tableIndex = tableWords.findIndex(
    (word) => word === "all" || word === "every" || word === "each"
  );

  let tableName = "";
  if (tableIndex >= 0 && tableIndex < tableWords.length - 1) {
    tableName = tableWords[tableIndex + 1];
    // Handle plural forms by removing trailing 's'
    if (tableName.endsWith("s") && !tableName.endsWith("ss")) {
      tableName = tableName.slice(0, -1);
    }
  }

  // Use fuzzy matching to find the closest table
  const matchedTable = findClosestTableMatch(tableName, database.tables);

  if (!matchedTable) {
    return {
      data: [],
      sqlQuery: `-- No matching table found for query: ${query}`,
      explanation: "Could not find a table matching your query.",
    };
  }

  // Generate fake data for the table
  const data = generateFakeData(matchedTable, MIN_RECORDS);

  return {
    data,
    sqlQuery: `SELECT * FROM ${matchedTable.name};`,
    explanation: `Showing all records from the ${matchedTable.name} table.`,
  };
};

export const handleFilterQuery = (query: string, database: Database) => {
  // Extract table and condition from query
  let tableName = "";
  let condition = "";
  let columnName = "";
  let operator = "";
  let value: string | number = "";

  // Find table name with fuzzy matching
  for (const table of database.tables) {
    if (
      query.includes(table.name.toLowerCase()) ||
      query.includes(table.name.toLowerCase() + "s")
    ) {
      tableName = table.name;
      break;
    }
  }

  if (!tableName) {
    // Try to extract from query patterns
    const words = query.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (
        words[i] === "find" ||
        words[i] === "filter" ||
        words[i] === "get" ||
        words[i] === "show"
      ) {
        if (i + 1 < words.length) {
          tableName = words[i + 1];
          // Handle plural forms
          if (tableName.endsWith("s") && !tableName.endsWith("ss")) {
            tableName = tableName.slice(0, -1);
          }
          break;
        }
      }
    }
  }

  // Use fuzzy matching for table name
  const matchedTable = findClosestTableMatch(tableName, database.tables);

  if (!matchedTable) {
    return {
      data: [],
      sqlQuery: `-- No matching table found for query: ${query}`,
      explanation: "Could not find a table matching your query.",
    };
  }

  // Extract condition parts from query
  if (query.includes("where") || query.includes("with")) {
    const conditionParts = query.split(/where|with/)[1].trim();

    // Try to identify column, operator and value
    const comparisonWords = [
      "greater than",
      "less than",
      "more than",
      "at least",
      "at most",
      "equal to",
      "equals",
      "is",
      "contains",
      "starts with",
      "ends with",
    ];

    let foundOperator = "";
    let operatorIndex = -1;

    for (const opWord of comparisonWords) {
      if (conditionParts.includes(opWord)) {
        foundOperator = opWord;
        operatorIndex = conditionParts.indexOf(opWord);
        break;
      }
    }

    if (operatorIndex > 0) {
      // Extract column name (before operator)
      const beforeOp = conditionParts.substring(0, operatorIndex).trim();
      columnName = beforeOp.split(/\s+/).pop() || "";

      // Extract value (after operator)
      const afterOp = conditionParts
        .substring(operatorIndex + foundOperator.length)
        .trim();
      value = afterOp.split(/\s+/)[0];

      // Convert value to number if possible
      if (!isNaN(Number(value))) {
        value = Number(value);
      }

      // Map operator to SQL operator
      switch (foundOperator) {
        case "greater than":
        case "more than":
          operator = ">";
          break;
        case "less than":
          operator = "<";
          break;
        case "at least":
          operator = ">=";
          break;
        case "at most":
          operator = "<=";
          break;
        case "equal to":
        case "equals":
        case "is":
          operator = "=";
          break;
        case "contains":
          operator = "LIKE";
          value = `%${value}%`;
          break;
        case "starts with":
          operator = "LIKE";
          value = `${value}%`;
          break;
        case "ends with":
          operator = "LIKE";
          value = `%${value}`;
          break;
        default:
          operator = "=";
      }
    }
  }

  // Use fuzzy matching for column name if needed
  if (columnName) {
    const matchedColumn = findColumnMatch(columnName, matchedTable.columns);
    if (matchedColumn) {
      columnName = matchedColumn.name;
    }
  }

  // Generate fake data
  let data = generateFakeData(matchedTable, MIN_RECORDS);

  // Apply filter if we have a condition
  if (columnName && operator && value !== "") {
    data = data.filter((record) => {
      const recordValue = record[columnName];

      if (operator === ">" && typeof value === "number") {
        return recordValue > value;
      } else if (operator === "<" && typeof value === "number") {
        return recordValue < value;
      } else if (operator === ">=" && typeof value === "number") {
        return recordValue >= value;
      } else if (operator === "<=" && typeof value === "number") {
        return recordValue <= value;
      } else if (operator === "=") {
        if (typeof value === "string" && typeof recordValue === "string") {
          return recordValue.toLowerCase() === value.toLowerCase();
        }
        return recordValue == value;
      } else if (
        operator === "LIKE" &&
        typeof value === "string" &&
        typeof recordValue === "string"
      ) {
        const pattern = value.replace(/%/g, ".*");
        const regex = new RegExp(pattern, "i");
        return regex.test(recordValue);
      }

      return false;
    });
  }

  // Prepare SQL query
  let sqlQuery = `SELECT * FROM ${matchedTable.name}`;
  if (columnName && operator && value !== "") {
    if (typeof value === "string" && operator !== "LIKE") {
      sqlQuery += ` WHERE ${columnName} ${operator} '${value}'`;
    } else {
      sqlQuery += ` WHERE ${columnName} ${operator} ${value}`;
    }
  }
  sqlQuery += ";";

  return {
    data,
    sqlQuery,
    explanation: `Filtered ${matchedTable.name} where ${columnName} ${operator} ${value}.`,
  };
};

export const handleCountQuery = (query: string, database: Database) => {
  // Extract table name from query
  let tableName = "";
  let groupByColumn = "";

  // Look for table name in query
  for (const table of database.tables) {
    if (
      query.includes(table.name.toLowerCase()) ||
      query.includes(table.name.toLowerCase() + "s")
    ) {
      tableName = table.name;
      break;
    }
  }

  if (!tableName) {
    // Try other patterns
    const words = query.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (words[i] === "count" || words[i] === "many") {
        if (i + 1 < words.length) {
          tableName = words[i + 1];
          // Handle plural forms
          if (tableName.endsWith("s") && !tableName.endsWith("ss")) {
            tableName = tableName.slice(0, -1);
          }
          break;
        }
      }
    }
  }

  // Check for "group by" or "by" pattern
  if (query.includes(" by ")) {
    const byParts = query.split(" by ");
    if (byParts.length > 1) {
      groupByColumn = byParts[1].trim().split(/\s+/)[0];
    }
  }

  // Use fuzzy matching for table name
  const matchedTable = findClosestTableMatch(tableName, database.tables);

  if (!matchedTable) {
    return {
      data: [],
      sqlQuery: `-- No matching table found for query: ${query}`,
      explanation: "Could not find a table matching your query.",
    };
  }

  // Use fuzzy matching for column name if needed
  let matchedColumn = null;
  if (groupByColumn) {
    matchedColumn = findColumnMatch(groupByColumn, matchedTable.columns);
    if (matchedColumn) {
      groupByColumn = matchedColumn.name;
    }
  }

  // Generate fake data
  const rawData = generateFakeData(matchedTable, MIN_RECORDS);

  let data = [];
  let sqlQuery = "";
  let explanation = "";

  if (groupByColumn && matchedColumn) {
    // Count with group by
    const groupCounts = new Map<string | number, number>();

    rawData.forEach((record) => {
      const value = record[groupByColumn];
      groupCounts.set(value, (groupCounts.get(value) || 0) + 1);
    });

    data = Array.from(groupCounts.entries()).map(([value, count]) => ({
      [groupByColumn]: value,
      count,
    }));

    sqlQuery = `SELECT ${groupByColumn}, COUNT(*) as count FROM ${matchedTable.name} GROUP BY ${groupByColumn};`;
    explanation = `Counted ${matchedTable.name} records grouped by ${groupByColumn}.`;
  } else {
    // Simple count
    data = [
      {
        table: matchedTable.name,
        count: rawData.length,
      },
    ];

    sqlQuery = `SELECT COUNT(*) as count FROM ${matchedTable.name};`;
    explanation = `Counted the total number of records in ${matchedTable.name}.`;
  }

  return {
    data,
    sqlQuery,
    explanation,
  };
};

export const handleJoinQuery = (query: string, database: Database) => {
  // Extract table names
  let table1 = "";
  let table2 = "";
  let joinColumn1 = "";
  let joinColumn2 = "";

  // Check join keywords
  const joinPatterns = [
    " join ",
    " and ",
    " with ",
    " combining ",
    " related to ",
  ];

  // Find tables to join
  for (const pattern of joinPatterns) {
    if (query.includes(pattern)) {
      const parts = query.split(pattern);

      // Extract table words around the join pattern
      for (const table of database.tables) {
        const tableLower = table.name.toLowerCase();
        const tablePluralLower = tableLower + "s";

        // Check first part
        if (
          parts[0].includes(tableLower) ||
          parts[0].includes(tablePluralLower)
        ) {
          table1 = table.name;
        }

        // Check second part
        if (
          parts[1].includes(tableLower) ||
          parts[1].includes(tablePluralLower)
        ) {
          table2 = table.name;
        }
      }

      // If we found both tables, break out
      if (table1 && table2) break;
    }
  }

  // If tables not found directly, use fuzzy matching
  if (!table1 || !table2) {
    // Try to find tables from separate parts of the query
    const words = query.split(/\s+/);
    const tableNames = [];

    for (const word of words) {
      // Skip common words and conjunctions
      if (["and", "with", "join", "the", "to", "from"].includes(word)) continue;

      // Get table name candidates
      const wordSingular = word.endsWith("s") ? word.slice(0, -1) : word;
      const tableCandidates = database.tables.filter((table) => {
        const tableLower = table.name.toLowerCase();
        return (
          word === tableLower ||
          word === tableLower + "s" ||
          wordSingular === tableLower
        );
      });

      if (tableCandidates.length > 0) {
        tableNames.push(tableCandidates[0].name);
      }
    }

    if (tableNames.length >= 2) {
      table1 = tableNames[0];
      table2 = tableNames[1];
    } else {
      // Use fuzzy matching as a last resort
      const allTableNames = database.tables.map((t) => t.name.toLowerCase());
      for (const word of words) {
        if (word.length < 3) continue; // Skip short words

        // Find closest match
        let bestSimilarity = 0;
        let bestMatch = "";

        for (const tableName of allTableNames) {
          const similarity = calculateStringSimilarity(word, tableName);
          if (similarity > bestSimilarity && similarity > 0.6) {
            bestSimilarity = similarity;
            bestMatch = tableName;
          }
        }

        if (bestMatch && !table1) {
          table1 =
            database.tables.find((t) => t.name.toLowerCase() === bestMatch)
              ?.name || "";
        } else if (bestMatch && !table2 && bestMatch !== table1.toLowerCase()) {
          table2 =
            database.tables.find((t) => t.name.toLowerCase() === bestMatch)
              ?.name || "";
        }
      }
    }
  }

  // Use fuzzy matching if still needed
  if (!table1) {
    const match = findClosestTableMatch("", database.tables);
    if (match) table1 = match.name;
  }

  if (!table2) {
    // Find a different table from table1
    const otherTables = database.tables.filter((t) => t.name !== table1);
    if (otherTables.length > 0) {
      table2 = otherTables[0].name;
    }
  }

  if (!table1 || !table2 || table1 === table2) {
    return {
      data: [],
      sqlQuery: `-- Could not identify two distinct tables to join from query: ${query}`,
      explanation: "Could not determine which tables to join from your query.",
    };
  }

  // Find actual table objects
  const tableObj1 = database.tables.find((t) => t.name === table1);
  const tableObj2 = database.tables.find((t) => t.name === table2);

  if (!tableObj1 || !tableObj2) {
    return {
      data: [],
      sqlQuery: `-- One or more tables not found: ${table1}, ${table2}`,
      explanation:
        "One or more tables specified in the join query were not found.",
    };
  }

  // Determine join columns
  // First look for foreign keys
  for (const column of tableObj1.columns) {
    if (
      column.name.toLowerCase().includes(table2.toLowerCase()) ||
      column.name.toLowerCase() === "id" + table2.toLowerCase()
    ) {
      joinColumn1 = column.name;
      joinColumn2 = tableObj2.columns.find((c) => c.isPrimaryKey)?.name || "id";
      break;
    }
  }

  if (!joinColumn1) {
    for (const column of tableObj2.columns) {
      if (
        column.name.toLowerCase().includes(table1.toLowerCase()) ||
        column.name.toLowerCase() === "id" + table1.toLowerCase()
      ) {
        joinColumn2 = column.name;
        joinColumn1 =
          tableObj1.columns.find((c) => c.isPrimaryKey)?.name || "id";
        break;
      }
    }
  }

  // If we still don't have join columns, use primary keys
  if (!joinColumn1 || !joinColumn2) {
    joinColumn1 = tableObj1.columns.find((c) => c.isPrimaryKey)?.name || "id";
    joinColumn2 = tableObj2.columns.find((c) => c.isPrimaryKey)?.name || "id";
  }

  // Generate fake data for both tables
  const data1 = generateFakeData(tableObj1, MIN_RECORDS);
  const data2 = generateFakeData(tableObj2, MIN_RECORDS);

  // Perform the join
  const joinedData = [];
  for (let i = 0; i < data1.length; i++) {
    const record1 = data1[i];
    const record2 = data2[i % data2.length]; // Cycle through second table

    const joinedRecord: Record<string, any> = {};

    // Add prefixed fields from first table
    for (const key in record1) {
      joinedRecord[`${table1}.${key}`] = record1[key];
    }

    // Add prefixed fields from second table
    for (const key in record2) {
      joinedRecord[`${table2}.${key}`] = record2[key];
    }

    joinedData.push(joinedRecord);
  }

  // Create SQL query
  const sqlQuery = `SELECT * FROM ${table1}
JOIN ${table2} ON ${table1}.${joinColumn1} = ${table2}.${joinColumn2};`;

  return {
    data: joinedData,
    sqlQuery,
    explanation: `Joined ${table1} with ${table2} using columns ${joinColumn1} and ${joinColumn2}.`,
  };
};

export const handleSortQuery = (query: string, database: Database) => {
  // Extract table name and sort column
  let tableName = "";
  let sortColumn = "";
  let isAscending = true;

  // Look for table name in query
  for (const table of database.tables) {
    if (
      query.includes(table.name.toLowerCase()) ||
      query.includes(table.name.toLowerCase() + "s")
    ) {
      tableName = table.name;
      break;
    }
  }

  if (!tableName) {
    // Try other patterns
    const words = query.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (words[i] === "sort" || words[i] === "order") {
        if (
          i + 1 < words.length &&
          words[i + 1] === "by" &&
          i + 2 < words.length
        ) {
          // Skip the "by" and get the next word
          sortColumn = words[i + 2];
        }

        // Look for the table before the sort keyword
        if (i > 0) {
          tableName = words[i - 1];
          // Handle plural forms
          if (tableName.endsWith("s") && !tableName.endsWith("ss")) {
            tableName = tableName.slice(0, -1);
          }
        }
      }
    }
  }

  // Check for sorting direction
  isAscending = !(
    query.includes("descending") ||
    query.includes("desc") ||
    query.includes("highest") ||
    query.includes("largest") ||
    query.includes("biggest")
  );

  // Use fuzzy matching for table name
  const matchedTable = findClosestTableMatch(tableName, database.tables);

  if (!matchedTable) {
    return {
      data: [],
      sqlQuery: `-- No matching table found for query: ${query}`,
      explanation: "Could not find a table matching your query.",
    };
  }

  // If sort column not found, look for keywords
  if (!sortColumn) {
    const sortKeywords = ["by", "on", "using", "with"];

    for (const keyword of sortKeywords) {
      const pattern = ` ${keyword} `;
      if (query.includes(pattern)) {
        const afterKeyword = query.split(pattern)[1].trim().split(/\s+/)[0];
        sortColumn = afterKeyword;
        break;
      }
    }
  }

  // Use fuzzy matching for column name
  if (sortColumn) {
    const matchedColumn = findColumnMatch(sortColumn, matchedTable.columns);
    if (matchedColumn) {
      sortColumn = matchedColumn.name;
    }
  } else {
    // Default to first non-ID column or ID if nothing else
    sortColumn =
      matchedTable.columns.find((c) => !c.isPrimaryKey)?.name ||
      matchedTable.columns[0].name;
  }

  // Generate fake data
  const data = generateFakeData(matchedTable, MIN_RECORDS);

  // Sort the data
  data.sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];

    if (typeof valA === "string" && typeof valB === "string") {
      return isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return isAscending ? valA - valB : valB - valA;
    }
  });

  // Build SQL query
  const sqlQuery = `SELECT * FROM ${matchedTable.name} ORDER BY ${sortColumn} ${
    isAscending ? "ASC" : "DESC"
  };`;

  return {
    data,
    sqlQuery,
    explanation: `Sorted ${matchedTable.name} by ${sortColumn} in ${
      isAscending ? "ascending" : "descending"
    } order.`,
  };
};

export const handleEcommerceQuery = (query: string, database: Database) => {
  // Check for specific e-commerce patterns
  let result;

  if (
    query.includes("top selling") ||
    query.includes("best selling") ||
    query.includes("most popular")
  ) {
    // Top selling products query
    result = handleTopSellingProducts(database);
  } else if (query.includes("revenue") || query.includes("sales")) {
    // Revenue or sales query
    result = handleRevenueQuery(database);
  } else if (
    query.includes("customer") &&
    (query.includes("order") || query.includes("purchase"))
  ) {
    // Customer orders query
    result = handleCustomerOrdersQuery(database);
  } else if (query.includes("product") && query.includes("categor")) {
    // Products by category
    result = handleProductsByCategoryQuery(database);
  } else {
    // Default to products query
    result = handleProductsQuery(database);
  }

  return result;
};

export const handleWarehouseQuery = (query: string, database: Database) => {
  // Check for specific warehouse patterns
  let result;

  if (
    query.includes("low stock") ||
    query.includes("out of stock") ||
    query.includes("reorder")
  ) {
    // Low stock items query
    result = handleLowStockQuery(database);
  } else if (query.includes("shipment") || query.includes("delivery")) {
    // Shipments query
    result = handleShipmentsQuery(database);
  } else if (query.includes("location") || query.includes("zone")) {
    // Inventory by location
    result = handleInventoryLocationQuery(database);
  } else {
    // Default inventory query
    result = handleInventoryQuery(database);
  }

  return result;
};

export const handleWeddingQuery = (query: string, database: Database) => {
  // Check for specific wedding patterns
  let result;

  if (query.includes("guest list") || query.includes("guests")) {
    // Guest list query
    result = handleGuestListQuery(database);
  } else if (query.includes("event") || query.includes("wedding")) {
    // Events query
    result = handleEventsQuery(database);
  } else if (query.includes("vendor")) {
    // Vendors query
    result = handleVendorsQuery(database);
  } else {
    // Default to events query
    result = handleEventsQuery(database);
  }

  return result;
};

export const handleHospitalQuery = (query: string, database: Database) => {
  // Check for specific hospital patterns
  let result;

  if (query.includes("patient") && query.includes("appointment")) {
    // Patient appointments query
    result = handlePatientAppointmentsQuery(database);
  } else if (query.includes("doctor")) {
    // Doctors query
    result = handleDoctorsQuery(database);
  } else if (query.includes("patient")) {
    // Patients query
    result = handlePatientsQuery(database);
  } else {
    // Default to patients query
    result = handlePatientsQuery(database);
  }

  return result;
};

// Helper functions for specialized queries
const handleDefaultQuery = (query: string, database: Database) => {
  // Extract table name from query using fuzzy matching
  let tableName = "";
  const words = query.split(/\s+/);

  // Find the most likely table name
  for (const word of words) {
    if (word.length < 3) continue; // Skip short words

    const singular = word.endsWith("s") ? word.slice(0, -1) : word;

    for (const table of database.tables) {
      if (
        word === table.name.toLowerCase() ||
        word === table.name.toLowerCase() + "s" ||
        singular === table.name.toLowerCase()
      ) {
        tableName = table.name;
        break;
      }
    }

    if (tableName) break;
  }

  // If no direct match, use fuzzy matching
  if (!tableName) {
    const match = findClosestTableMatch("", database.tables);
    if (match) tableName = match.name;
  }

  // If still no table, just use the first one
  if (!tableName && database.tables.length > 0) {
    tableName = database.tables[0].name;
  }

  const table = database.tables.find((t) => t.name === tableName);

  if (!table) {
    return {
      data: [],
      sqlQuery: `-- No matching table found for query: ${query}`,
      explanation: "Could not determine which table you want to query.",
    };
  }

  // Generate fake data
  const data = generateFakeData(table, MIN_RECORDS);

  return {
    data,
    sqlQuery: `SELECT * FROM ${table.name};`,
    explanation: `Showing records from the ${table.name} table.`,
  };
};

// Special handlers for e-commerce and warehouse
const handleTopSellingProducts = (database: Database) => {
  // Find products table
  const productsTable = database.tables.find(
    (t) =>
      t.name.toLowerCase() === "product" ||
      t.name.toLowerCase() === "products" ||
      t.name.toLowerCase().includes("product")
  );

  if (!productsTable) {
    return {
      data: [],
      sqlQuery: `-- No products table found in the database`,
      explanation: "Could not find a products table in this database.",
    };
  }

  // Generate fake product data
  const products = generateFakeData(productsTable, MIN_RECORDS);

  // Add sales_count field
  const productsWithSales = products.map((product) => ({
    ...product,
    sales_count: faker.number.int({ min: 10, max: 1000 }),
  }));

  // Sort by sales count
  productsWithSales.sort((a, b) => b.sales_count - a.sales_count);

  return {
    data: productsWithSales,
    sqlQuery: `SELECT p.*, COUNT(order_items.id) as sales_count 
FROM products p
JOIN order_items ON p.id = order_items.product_id
GROUP BY p.id
ORDER BY sales_count DESC;`,
    explanation: "Showing top selling products based on order counts.",
  };
};

const handleRevenueQuery = (database: Database) => {
  // Create revenue data by category or time period
  const categories = ["Electronics", "Clothing", "Home", "Sports", "Books"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  // Decide if by category or by month
  const byCategory = Math.random() > 0.5;

  const data = byCategory
    ? categories.map((category) => ({
        category,
        revenue: faker.number.float({
          min: 5000,
          max: 50000,
          multipleOf: 0.01,
        }),
        orders: faker.number.int({ min: 50, max: 500 }),
        average_order: faker.number.float({
          min: 50,
          max: 200,
          multipleOf: 0.01,
        }),
      }))
    : months.map((month) => ({
        month,
        revenue: faker.number.float({
          min: 10000,
          max: 100000,
          multipleOf: 0.01,
        }),
        orders: faker.number.int({ min: 100, max: 1000 }),
        growth:
          faker.number.float({ min: -10, max: 30, multipleOf: 0.1 }) + "%",
      }));

  const sqlQuery = byCategory
    ? `SELECT 
  c.name as category, 
  SUM(oi.price * oi.quantity) as revenue,
  COUNT(DISTINCT o.id) as orders,
  AVG(o.total) as average_order
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY revenue DESC;`
    : `SELECT 
  DATE_FORMAT(o.created_at, '%b') as month,
  SUM(oi.price * oi.quantity) as revenue,
  COUNT(DISTINCT o.id) as orders,
  CONCAT(ROUND((SUM(oi.price * oi.quantity) / LAG(SUM(oi.price * oi.quantity)) OVER (ORDER BY DATE_FORMAT(o.created_at, '%m')) - 1) * 100, 1), '%') as growth
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
GROUP BY month
ORDER BY MONTH(o.created_at);`;

  return {
    data,
    sqlQuery,
    explanation: byCategory
      ? "Showing revenue breakdown by product category."
      : "Showing monthly revenue data for the past 6 months.",
  };
};

const handleCustomerOrdersQuery = (database: Database) => {
  // Create customer orders data
  const data = Array.from({ length: MIN_RECORDS }, () => ({
    customer_name: faker.person.fullName(),
    email: faker.internet.email(),
    total_orders: faker.number.int({ min: 1, max: 20 }),
    total_spent: faker.number.float({ min: 50, max: 2000, multipleOf: 0.01 }),
    last_order_date: faker.date
      .recent({ days: 60 })
      .toISOString()
      .split("T")[0],
    status: faker.helpers.arrayElement(["Active", "Inactive", "New"]),
  }));

  return {
    data,
    sqlQuery: `SELECT 
  c.name as customer_name,
  c.email,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent,
  MAX(o.created_at) as last_order_date,
  CASE 
    WHEN MAX(o.created_at) > DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 'Active'
    WHEN MAX(o.created_at) > DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY) THEN 'Inactive'
    ELSE 'New'
  END as status
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
ORDER BY total_spent DESC;`,
    explanation:
      "Showing customer order summary with status based on recent activity.",
  };
};

const handleProductsByCategoryQuery = (database: Database) => {
  // Create products by category
  const categories = ["Electronics", "Clothing", "Home", "Sports", "Books"];

  const data = [];
  for (const category of categories) {
    // Add 3-5 products per category
    const productsCount = faker.number.int({ min: 3, max: 5 });
    for (let i = 0; i < productsCount; i++) {
      data.push({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        category,
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 0, max: 100 }),
        rating: faker.number.float({ min: 1, max: 5, multipleOf: 0.1 }),
      });
    }
  }

  return {
    data,
    sqlQuery: `SELECT 
  p.id,
  p.name,
  c.name as category,
  p.price,
  p.stock,
  AVG(r.rating) as rating
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, c.name, p.price, p.stock
ORDER BY c.name, p.name;`,
    explanation:
      "Showing products grouped by category with average customer ratings.",
  };
};

const handleProductsQuery = (database: Database) => {
  // Find products table
  const productsTable = database.tables.find(
    (t) =>
      t.name.toLowerCase() === "product" ||
      t.name.toLowerCase() === "products" ||
      t.name.toLowerCase().includes("product")
  );

  if (!productsTable) {
    // Create a generic products result
    const data = Array.from({ length: MIN_RECORDS }, () => ({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 0, max: 100 }),
    }));

    return {
      data,
      sqlQuery: `SELECT * FROM products;`,
      explanation: "Showing all products in the catalog.",
    };
  }

  // Generate fake product data
  const products = generateFakeData(productsTable, MIN_RECORDS);

  return {
    data: products,
    sqlQuery: `SELECT * FROM ${productsTable.name};`,
    explanation: `Showing all products from the ${productsTable.name} table.`,
  };
};

const handleLowStockQuery = (database: Database) => {
  // Find inventory or products table
  const inventoryTable = database.tables.find(
    (t) =>
      t.name.toLowerCase() === "inventory" ||
      t.name.toLowerCase().includes("stock") ||
      t.name.toLowerCase().includes("product")
  );

  if (!inventoryTable) {
    // Create generic low stock inventory data
    const data = Array.from({ length: 10 }, () => ({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      current_stock: faker.number.int({ min: 0, max: 10 }),
      reorder_level: faker.number.int({ min: 10, max: 25 }),
      status: "Low Stock",
      last_restock: faker.date.recent({ days: 30 }).toISOString().split("T")[0],
    }));

    return {
      data,
      sqlQuery: `SELECT 
  p.id,
  p.name,
  p.sku,
  i.quantity as current_stock,
  p.reorder_level,
  CASE 
    WHEN i.quantity = 0 THEN 'Out of Stock'
    WHEN i.quantity < p.reorder_level THEN 'Low Stock'
    ELSE 'In Stock'
  END as status,
  i.last_restock_date
FROM products p
JOIN inventory i ON p.id = i.product_id
WHERE i.quantity < p.reorder_level
ORDER BY i.quantity ASC;`,
      explanation: "Showing products with inventory below the reorder level.",
    };
  }

  // Generate inventory data
  const inventory = generateFakeData(inventoryTable, MIN_RECORDS).map(
    (item) => ({
      ...item,
      current_stock: faker.number.int({ min: 0, max: 10 }),
      reorder_level: faker.number.int({ min: 15, max: 25 }),
      status: faker.helpers.arrayElement(["Out of Stock", "Low Stock"]),
      last_restock: faker.date.recent({ days: 30 }).toISOString().split("T")[0],
    })
  );

  return {
    data: inventory,
    sqlQuery: `SELECT * FROM ${inventoryTable.name} WHERE quantity < reorder_level ORDER BY quantity ASC;`,
    explanation:
      "Showing inventory items with low stock levels that need reordering.",
  };
};

const handleShipmentsQuery = (database: Database) => {
  // Find shipments table
  const shipmentsTable = database.tables.find(
    (t) =>
      t.name.toLowerCase() === "shipment" ||
      t.name.toLowerCase() === "shipments" ||
      t.name.toLowerCase().includes("delivery")
  );

  if (!shipmentsTable) {
    // Create generic shipments data
    const statusOptions = [
      "Processing",
      "Shipped",
      "In Transit",
      "Delivered",
      "Delayed",
    ];

    const data = Array.from({ length: MIN_RECORDS }, () => {
      const status = faker.helpers.arrayElement(statusOptions);
      const shipDate = faker.date.recent({ days: 30 });

      return {
        id: faker.string.uuid(),
        tracking_number: faker.string.alphanumeric(12).toUpperCase(),
        order_id: faker.string.numeric(6),
        customer: faker.person.fullName(),
        status,
        ship_date: shipDate.toISOString().split("T")[0],
        estimated_delivery: new Date(
          shipDate.getTime() + 7 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        carrier: faker.helpers.arrayElement(["FedEx", "UPS", "USPS", "DHL"]),
      };
    });

    return {
      data,
      sqlQuery: `SELECT 
  s.id,
  s.tracking_number,
  s.order_id,
  c.name as customer,
  s.status,
  s.ship_date,
  s.estimated_delivery,
  s.carrier
FROM shipments s
JOIN orders o ON s.order_id = o.id
JOIN customers c ON o.customer_id = c.id
ORDER BY s.ship_date DESC;`,
      explanation:
        "Showing recent shipments with delivery status and tracking information.",
    };
  }

  // Generate shipments data
  const shipments = generateFakeData(shipmentsTable, MIN_RECORDS);

  return {
    data: shipments,
    sqlQuery: `SELECT * FROM ${shipmentsTable.name} ORDER BY created_at DESC;`,
    explanation: `Showing shipment records from the ${shipmentsTable.name} table.`,
  };
};

const handleInventoryLocationQuery = (database: Database) => {
  // Create inventory by location data
  const locations = [
    "Zone A",
    "Zone B",
    "Zone C",
    "Warehouse 1",
    "Warehouse 2",
  ];

  const data = [];
  for (const location of locations) {
    // Add 3-5 items per location
    const itemsCount = faker.number.int({ min: 4, max: 6 });
    for (let i = 0; i < itemsCount; i++) {
      data.push({
        id: faker.string.uuid(),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        name: faker.commerce.productName(),
        location,
        quantity: faker.number.int({ min: 5, max: 100 }),
        bin_number: faker.string.alphanumeric(5).toUpperCase(),
        last_updated: faker.date
          .recent({ days: 10 })
          .toISOString()
          .split("T")[0],
      });
    }
  }

  return {
    data,
    sqlQuery: `SELECT 
  i.id,
  p.sku,
  p.name,
  l.name as location,
  i.quantity,
  i.bin_number,
  i.updated_at as last_updated
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN locations l ON i.location_id = l.id
ORDER BY l.name, i.bin_number;`,
    explanation:
      "Showing inventory organized by warehouse location and bin number.",
  };
};

const handleInventoryQuery = (database: Database) => {
  // Find inventory table
  const inventoryTable = database.tables.find(
    (t) =>
      t.name.toLowerCase() === "inventory" ||
      t.name.toLowerCase().includes("stock")
  );

  if (!inventoryTable) {
    // Create generic inventory data
    const data = Array.from({ length: MIN_RECORDS }, () => ({
      id: faker.string.uuid(),
      product: faker.commerce.productName(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      quantity: faker.number.int({ min: 0, max: 200 }),
      location: faker.helpers.arrayElement([
        "Warehouse A",
        "Warehouse B",
        "Zone 1",
        "Zone 2",
      ]),
      last_updated: faker.date.recent({ days: 30 }).toISOString().split("T")[0],
    }));

    return {
      data,
      sqlQuery: `SELECT 
  i.id,
  p.name as product,
  p.sku,
  i.quantity,
  l.name as location,
  i.updated_at as last_updated
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN locations l ON i.location_id = l.id
ORDER BY p.name;`,
      explanation: "Showing current inventory levels for all products.",
    };
  }

  // Generate inventory data
  const inventory = generateFakeData(inventoryTable, MIN_RECORDS);

  return {
    inventory,
    sqlQuery: `SELECT * FROM ${inventoryTable.name};`,
    explanation: `Showing inventory records from the ${inventoryTable.name} table.`,
  };
};

// Helper functions for wedding queries
const handleGuestListQuery = (database: Database) => {
  // Find guests table
  const guestsTable = database.tables.find(
    (t) => t.name.toLowerCase() === "guests"
  );

  if (!guestsTable) {
    return {
      data: [],
      sqlQuery: `-- No guests table found in the database`,
      explanation: "Could not find a guests table in this database.",
    };
  }

  // Generate fake guest data
  const guests = generateFakeData(guestsTable, MIN_RECORDS);

  return {
    data: guests,
    sqlQuery: `SELECT * FROM guests;`,
    explanation: "Showing all guests for the events.",
  };
};

const handleEventsQuery = (database: Database) => {
  // Find events table
  const eventsTable = database.tables.find(
    (t) => t.name.toLowerCase() === "events"
  );

  if (!eventsTable) {
    return {
      data: [],
      sqlQuery: `-- No events table found in the database`,
      explanation: "Could not find an events table in this database.",
    };
  }

  // Generate fake event data
  const events = generateFakeData(eventsTable, MIN_RECORDS);

  return {
    data: events,
    sqlQuery: `SELECT * FROM events;`,
    explanation: "Showing all events.",
  };
};

const handleVendorsQuery = (database: Database) => {
  // Find vendors table
  const vendorsTable = database.tables.find(
    (t) => t.name.toLowerCase() === "vendors"
  );

  if (!vendorsTable) {
    return {
      data: [],
      sqlQuery: `-- No vendors table found in the database`,
      explanation: "Could not find a vendors table in this database.",
    };
  }

  // Generate fake vendor data
  const vendors = generateFakeData(vendorsTable, MIN_RECORDS);

  return {
    data: vendors,
    sqlQuery: `SELECT * FROM vendors;`,
    explanation: "Showing all vendors.",
  };
};

// Helper functions for hospital queries
const handlePatientAppointmentsQuery = (database: Database) => {
  // Find appointments table
  const appointmentsTable = database.tables.find(
    (t) => t.name.toLowerCase() === "appointments"
  );

  if (!appointmentsTable) {
    return {
      data: [],
      sqlQuery: `-- No appointments table found in the database`,
      explanation: "Could not find an appointments table in this database.",
    };
  }

  // Generate fake appointment data
  const appointments = generateFakeData(appointmentsTable, MIN_RECORDS);
  // write a inventory




  return {
    data: appointments,
    sqlQuery: `SELECT * FROM appointments;`,
    explanation: "Showing all patient appointments.",
  };
};

const handleDoctorsQuery = (database: Database) => {
  // Find doctors table
  const doctorsTable = database.tables.find(
    (t) => t.name.toLowerCase() === "doctors"
  );

  if (!doctorsTable) {
    return {
      data: [],
      sqlQuery: `-- No doctors table found in the database`,
      explanation: "Could not find a doctors table in this database.",
    };
  }

  // Generate fake doctor data
  const doctors = generateFakeData(doctorsTable, MIN_RECORDS);

  return {
    data: doctors,
    sqlQuery: `SELECT * FROM doctors;`,
    explanation: "Showing all doctors.",
  };
};

const handlePatientsQuery = (database: Database) => {
  // Find patients table
  const patientsTable = database.tables.find(
    (t) => t.name.toLowerCase() === "patients"
  );

  if (!patientsTable) {
    return {
      data: [],
      sqlQuery: `-- No patients table found in the database`,
      explanation: "Could not find a patients table in this database.",
    };
  }

  // Generate fake patient data
  const patients = generateFakeData(patientsTable, MIN_RECORDS);

  return {
    data: patients,
    sqlQuery: `SELECT * FROM patients;`,
    explanation: "Showing all patients.",
  };
};

// Helper function to generate fake data based on the schema
function generateFakeData(table: TableSchema, count: number = 10): any[] {
  return Array.from({ length: count }, () => {
    const record: Record<string, any> = {};

    table.columns.forEach((column) => {
      const { name, dataType } = column;

      // Generate appropriate data based on column name and data type
      if (column.isPrimaryKey) {
        record[name] = faker.string.uuid();
      } else if (name.includes("id") && !column.isPrimaryKey) {
        record[name] = faker.number.int({ min: 1, max: 1000 });
      } else if (name.includes("name") || name.includes("title")) {
        if (name.includes("first")) {
          record[name] = faker.person.firstName();
        } else if (name.includes("last")) {
          record[name] = faker.person.lastName();
        } else {
          record[name] = faker.commerce.productName();
        }
      } else if (name.includes("email")) {
        record[name] = faker.internet.email();
      } else if (name.includes("phone")) {
        record[name] = faker.phone.number();
      } else if (name.includes("address")) {
        record[name] = faker.location.streetAddress();
      } else if (name.includes("city")) {
        record[name] = faker.location.city();
      } else if (name.includes("state")) {
        record[name] = faker.location.state();
      } else if (name.includes("zip") || name.includes("postal")) {
        record[name] = faker.location.zipCode();
      } else if (name.includes("country")) {
        record[name] = faker.location.country();
      } else if (name.includes("description")) {
        record[name] = faker.commerce.productDescription();
      } else if (
        name.includes("price") ||
        name.includes("amount") ||
        name.includes("cost")
      ) {
        record[name] = parseFloat(faker.commerce.price());
      } else if (
        name.includes("quantity") ||
        name.includes("stock") ||
        name.includes("count")
      ) {
        record[name] = faker.number.int({ min: 1, max: 100 });
      } else if (name.includes("date") || name.includes("time")) {
        record[name] = faker.date.recent().toISOString();
      } else if (
        dataType?.toLowerCase().includes("boolean") ||
        name.includes("is_")
      ) {
        record[name] = faker.datatype.boolean();
      } else if (
        dataType?.toLowerCase().includes("int") ||
        dataType?.toLowerCase().includes("number")
      ) {
        record[name] = faker.number.int({ min: 1, max: 1000 });
      } else if (
        dataType?.toLowerCase().includes("decimal") ||
        dataType?.toLowerCase().includes("float")
      ) {
        record[name] = parseFloat(
          faker.finance.amount({ min: 1, max: 1000, dec: 2 })
        );
      } else {
        record[name] = faker.word.words({ count: { min: 1, max: 3 } });
      }
    });

    return record;
  });
}

// Helper for measuring string similarity
function calculateStringSimilarity(a: string, b: string): number {
  if (a.length === 0 || b.length === 0) return 0;
  if (a === b) return 1;

  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower === bLower) return 1;
  if (aLower.includes(bLower) || bLower.includes(aLower)) return 0.8;

  const intersection = new Set(
    [...aLower].filter((char) => bLower.includes(char))
  );
  const union = new Set([...aLower, ...bLower]);

  return intersection.size / union.size;
}
