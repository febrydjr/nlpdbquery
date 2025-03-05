import { faker } from "@faker-js/faker";
import {
  Database,
  TableSchema,
  ColumnSchema,
  DatabaseConfig,
  Query,
} from "@/data/mock-data";

/**
 * Generate a random database record based on column definitions
 */
export const generateFakeRecord = (
  columns: ColumnSchema[]
): Record<string, any> => {
  const record: Record<string, any> = {};

  columns.forEach((column) => {
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
    } else if (name === "dob") {
      record[name] = faker.date.birthdate({ mode: "age", min: 18, max: 65 }).toISOString().split("T")[0];
    } else if (name === "gender") {
      record[name] = faker.helpers.arrayElement(["Male", "Female", "Other"]);
    } else if (
      name === "created_at" ||
      name === "last_updated" ||
      name === "order_date" ||
      name === "appointment_date" ||
      name === "ship_date" ||
      name === "delivery_date"
    ) {
      record[name] = faker.date.past().toISOString();
    } else if (name === "status" || name === "rsvp_status") {
      record[name] = faker.helpers.arrayElement([
        "pending",
        "completed",
        "shipped",
        "delivered",
        "cancelled",
        "confirmed",
        "declined",
      ]);
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
      record[name] = parseFloat(faker.finance.amount());
    } else {
      record[name] = faker.word.words({ count: { min: 1, max: 3 } });
    }
  });

  return record;
};

/**
 * Generate a set of records for a table
 */
export const generateFakeRecords = (
  tableName: string,
  columns: ColumnSchema[],
  count: number = 10
): Record<string, any>[] => {
  return Array.from({ length: count }, () => generateFakeRecord(columns));
};

/**
 * Generate sample query results based on table and columns
 */
export const generateQueryResults = (
  tableName: string,
  columns: ColumnSchema[],
  count: number = 10
): Record<string, any>[] => {
  return generateFakeRecords(tableName, columns, count);
};

/**
 * Generate sample database connections
 */
export const generateFakeConnections = (
  count: number = 5
): DatabaseConfig[] => {
  const dbTypes: (
    | "postgresql"
    | "mysql"
    | "supabase"
    | "mongodb"
    | "static"
  )[] = ["postgresql", "mysql", "supabase", "mongodb", "static"];

  return Array.from({ length: count }, (_, index) => {
    const type = dbTypes[index % dbTypes.length];
    const id = (index + 1).toString();

    const baseConfig: DatabaseConfig = {
      id,
      name: faker.company.name() + " DB",
      type: type as any,
      createdAt: faker.date.past(),
      lastConnected: faker.date.recent(),
    };

    // Add type-specific properties
    if (type === "postgresql" || type === "mysql") {
      return {
        ...baseConfig,
        host: `${faker.internet.domainWord()}.example.com`,
        port: type === "postgresql" ? 5432 : 3306,
        username: faker.internet.userName(),
        database: faker.internet.domainWord(),
      };
    } else if (type === "supabase" || type === "mongodb") {
      return {
        ...baseConfig,
        url: `https://${faker.internet.domainWord()}.${
          type === "supabase" ? "supabase.co" : "mongodb.com"
        }`,
        database: faker.internet.domainWord(),
      };
    }

    return baseConfig;
  });
};

/**
 * Generate a sample query history
 */
export const generateFakeQueryHistory = (
  connectionIds: string[],
  count: number = 15
): Query[] => {
  return Array.from({ length: count }, (_, index) => {
    const connectionId = connectionIds[index % connectionIds.length];
    const success = faker.datatype.boolean(0.8); // 80% success rate

    return {
      id: faker.string.uuid(),
      connectionId,
      text: faker.helpers.arrayElement([
        "Show all products",
        "Find customers who ordered more than 10 items",
        "List all warehouse inventory below 20 units",
        "Show pending shipments",
        "Find events scheduled for next month",
        "Display patients admitted this week",
        "Count students by major",
      ]),
      executedAt: faker.date.recent(),
      duration: faker.number.int({ min: 50, max: 500 }),
      status: success ? "success" : "error",
      sqlGenerated: success
        ? faker.helpers.arrayElement([
            "SELECT * FROM products ORDER BY name",
            "SELECT c.* FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id HAVING COUNT(o.id) > 10",
            "SELECT * FROM inventory WHERE quantity < 20",
            "SELECT * FROM shipments WHERE status = 'pending'",
            "SELECT * FROM events WHERE start_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 MONTH)",
            "SELECT * FROM patients WHERE admission_date > DATE_SUB(NOW(), INTERVAL 1 WEEK)",
            "SELECT major, COUNT(*) FROM students GROUP BY major",
          ])
        : undefined,
      explanation: success
        ? "This query retrieves data based on the specified conditions."
        : undefined,
    };
  });
};
