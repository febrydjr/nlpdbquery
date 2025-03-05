// Database connection types
export type DatabaseType =
  | "static"
  | "supabase"
  | "mysql"
  | "postgresql"
  | "mongodb";

// Configuration for database connections
export interface DatabaseConfig {
  id: string;
  name: string;
  type: DatabaseType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  url?: string;
  createdAt: Date;
  lastConnected?: Date;
}

// Table schema types
export interface ColumnSchema {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isRequired: boolean;
  foreignKeyReference?: {
    table: string;
    column: string;
  };
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface Database {
  id: string;
  name: string;
  tables: TableSchema[];
}

// Query types
export interface Query {
  id: string;
  connectionId: string;
  text: string;
  executedAt: Date;
  duration: number; // in milliseconds
  status: "success" | "error";
  result?: any;
  sqlGenerated?: string;
  explanation?: string;
}

// Sample database connections - 5 different themed connections
export const connections: DatabaseConfig[] = [
  {
    id: "1",
    name: "E-commerce Shop",
    type: "postgresql",
    host: "ecommerce.db.example.com",
    port: 5432,
    username: "shop_admin",
    database: "shop_prod",
    createdAt: new Date("2023-04-15T10:00:00"),
    lastConnected: new Date("2023-05-20T15:30:00"),
  },
  {
    id: "2",
    name: "Warehouse Logistics",
    type: "mysql",
    host: "warehouse.mysql.example.com",
    port: 3306,
    username: "logistics_user",
    database: "warehouse_app",
    createdAt: new Date("2023-03-10T09:15:00"),
    lastConnected: new Date("2023-05-18T11:45:00"),
  },
  {
    id: "3",
    name: "Wedding Planner",
    type: "supabase",
    url: "https://wedding-planner.supabase.co",
    database: "wedding_events",
    createdAt: new Date("2023-02-25T14:30:00"),
    lastConnected: new Date("2023-05-15T10:20:00"),
  },
  {
    id: "4",
    name: "Hospital Management",
    type: "postgresql",
    host: "hospital-db.example.com",
    port: 5432,
    username: "medical_staff",
    database: "patient_records",
    createdAt: new Date("2023-01-05T08:45:00"),
    lastConnected: new Date("2023-05-19T16:10:00"),
  },
  {
    id: "5",
    name: "University Campus",
    type: "mongodb",
    url: "mongodb://campus.example.com:27017",
    database: "university_db",
    createdAt: new Date("2023-03-20T11:20:00"),
    lastConnected: new Date("2023-05-17T14:15:00"),
  },
];

// E-commerce Database Schema
const ecommerceDatabase: Database = {
  id: "1",
  name: "E-commerce Shop",
  tables: [
    {
      name: "products",
      columns: [
        {
          name: "id",
          dataType: "integer",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "description",
          dataType: "text",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "price",
          dataType: "decimal(10,2)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "stock",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "category_id",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "categories", column: "id" },
        },
      ],
    },
    {
      name: "categories",
      columns: [
        {
          name: "id",
          dataType: "integer",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "name",
          dataType: "varchar(50)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "parent_id",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: false,
          foreignKeyReference: { table: "categories", column: "id" },
        },
      ],
    },
    {
      name: "customers",
      columns: [
        {
          name: "id",
          dataType: "integer",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "first_name",
          dataType: "varchar(50)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "last_name",
          dataType: "varchar(50)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "email",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "phone",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "address",
          dataType: "text",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "created_at",
          dataType: "timestamp",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
      ],
    },
    {
      name: "orders",
      columns: [
        {
          name: "id",
          dataType: "integer",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "customer_id",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "customers", column: "id" },
        },
        {
          name: "order_date",
          dataType: "timestamp",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "status",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "total_amount",
          dataType: "decimal(10,2)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
      ],
    },
    {
      name: "order_items",
      columns: [
        {
          name: "id",
          dataType: "integer",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "order_id",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "orders", column: "id" },
        },
        {
          name: "product_id",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "products", column: "id" },
        },
        {
          name: "quantity",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "price",
          dataType: "decimal(10,2)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
      ],
    },
  ],
};

// Warehouse Logistics Database Schema
const warehouseDatabase: Database = {
  id: "2",
  name: "Warehouse Logistics",
  tables: [
    {
      name: "inventory",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "sku",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "quantity",
          dataType: "int",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "location_id",
          dataType: "int",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "locations", column: "id" },
        },
        {
          name: "last_updated",
          dataType: "datetime",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
      ],
    },
    {
      name: "locations",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "name",
          dataType: "varchar(50)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "aisle",
          dataType: "varchar(10)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "shelf",
          dataType: "varchar(10)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "bin",
          dataType: "varchar(10)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
      ],
    },
    {
      name: "shipments",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "tracking_number",
          dataType: "varchar(50)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "carrier",
          dataType: "varchar(50)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "ship_date",
          dataType: "datetime",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "delivery_date",
          dataType: "datetime",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "status",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
      ],
    },
    {
      name: "shipment_items",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "shipment_id",
          dataType: "int",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "shipments", column: "id" },
        },
        {
          name: "inventory_id",
          dataType: "int",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "inventory", column: "id" },
        },
        {
          name: "quantity",
          dataType: "int",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
      ],
    },
    {
      name: "suppliers",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "contact_name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "email",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "phone",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
      ],
    },
  ],
};

// Wedding Planner Database Schema

const weddingDatabase: Database = {
  id: "3",
  name: "Wedding Planner",
  tables: [
    {
      name: "events",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "date",
          dataType: "date",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "location",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "organizer_id",
          dataType: "int",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "organizers", column: "id" },
        },
      ],
    },
    {
      name: "organizers",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "email",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "phone",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
      ],
    },
    {
      name: "guests",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "event_id",
          dataType: "int",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "events", column: "id" },
        },
        {
          name: "name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "email",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "phone",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "rsvp_status",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
      ],
    },
    {
      name: "vendors",
      columns: [
        {
          name: "id",
          dataType: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "service",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: true,
        },
        {
          name: "contact_name",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "email",
          dataType: "varchar(100)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
        {
          name: "phone",
          dataType: "varchar(20)",
          isPrimaryKey: false,
          isForeignKey: false,
          isRequired: false,
        },
      ],
    },
  ],
};

const hospitalDatabase: Database = {
  id: "4",
  name: "Hospital Management",
  tables: [
    {
      name: "patients",
      columns: [
        { name: "id", dataType: "integer", isPrimaryKey: true, isForeignKey: false, isRequired: true },
        { name: "first_name", dataType: "varchar(50)", isPrimaryKey: false, isForeignKey: false, isRequired: true },
        { name: "last_name", dataType: "varchar(50)", isPrimaryKey: false, isForeignKey: false, isRequired: true },
        { name: "dob", dataType: "date", isPrimaryKey: false, isForeignKey: false, isRequired: true },
        { name: "gender", dataType: "varchar(10)", isPrimaryKey: false, isForeignKey: false, isRequired: true },
        { name: "address", dataType: "text", isPrimaryKey: false, isForeignKey: false, isRequired: false },
        { name: "phone", dataType: "varchar(20)", isPrimaryKey: false, isForeignKey: false, isRequired: false },
        { name: "email", dataType: "varchar(100)", isPrimaryKey: false, isForeignKey: false, isRequired: false },
                { name: "blood_type", dataType: "varchar(5)", isPrimaryKey: false, isForeignKey: false, isRequired: false },
                { name: "emergency_contact", dataType: "varchar(100)", isPrimaryKey: false, isForeignKey: false, isRequired: false },
                { name: "insurance_number", dataType: "varchar(50)", isPrimaryKey: false, isForeignKey: false, isRequired: false },
                { name: "medical_history", dataType: "text", isPrimaryKey: false, isForeignKey: false, isRequired: false }
        
      ]
    },
    {
      name: "doctors",
      columns: [
        { name: "id", dataType: "integer", isPrimaryKey: true, isForeignKey: false, isRequired: true },
        { name: "first_name", dataType: "varchar(50)", isPrimaryKey: false, isForeignKey: false, isRequired: true },
        { name: "last_name", dataType: "varchar(50)", isPrimaryKey: false, isForeignKey: false, isRequired: true },
        { name: "specialization", dataType: "varchar(100)", isPrimaryKey: false, isForeignKey: false, isRequired: true },
        { name: "phone", dataType: "varchar(20)", isPrimaryKey: false, isForeignKey: false, isRequired: false },
        { name: "email", dataType: "varchar(100)", isPrimaryKey: false, isForeignKey: false, isRequired: false },
        { name: "salary", dataType: "decimal(10, 2)", isPrimaryKey: false, isForeignKey: false, isRequired: true }
      ]
    },
    {
      name: "appointments",
      columns: [
        { name: "id", dataType: "integer", isPrimaryKey: true, isForeignKey: false, isRequired: true },
        {
          name: "patient_id",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "patients", column: "id" }
        },
        {
          name: "doctor_id",
          dataType: "integer",
          isPrimaryKey: false,
          isForeignKey: true,
          isRequired: true,
          foreignKeyReference: { table: "doctors", column: "id" }
        },
        { name: "appointment_date", dataType: "timestamp", isPrimaryKey: false, isForeignKey: false, isRequired: true },
        { name: "reason", dataType: "text", isPrimaryKey: false, isForeignKey: false, isRequired: false },
        { name: "status", dataType: "varchar(20)", isPrimaryKey: false, isForeignKey: false, isRequired: true },
                { name: "notes", dataType: "text", isPrimaryKey: false, isForeignKey: false, isRequired: false },
                { name: "duration_minutes", dataType: "integer", isPrimaryKey: false, isForeignKey: false, isRequired: false },
                { name: "room_number", dataType: "varchar(10)", isPrimaryKey: false, isForeignKey: false, isRequired: false },
                { name: "follow_up_required", dataType: "boolean", isPrimaryKey: false, isForeignKey: false, isRequired: false }
        
      ]
    }
  ]
};

export const staticDatabases: Database[] = [
  ecommerceDatabase,
  warehouseDatabase,
  weddingDatabase,
  hospitalDatabase,
];

// Import the Faker utility for generating dynamic data
import { generateFakeQueryHistory } from "@/utils/fakerUtils";

// Generate dynamic query history based on connections
export const queryHistory: Query[] = generateFakeQueryHistory(
  connections.map((conn) => conn.id),
  25 // Generate 15 sample queries
);

// Function to get sample query results based on SQL query and database tables
export const getQueryResults = (
  sql: string,
  connectionId: string = "1"
): any => {
  // Import the fakerUtils dynamically to avoid circular dependencies
  const { generateFakeRecords } = require("../utils/fakerUtils");

  // Find the relevant database
  const database =
    staticDatabases.find((db) => db.id === connectionId) || staticDatabases[0];

  // Parse the SQL query to determine which table is being queried
  const sqlLower = sql.toLowerCase();
  let tableName = "";
  let limit = 20;

  // Very simple SQL parsing
  database.tables.forEach((table) => {
    if (sqlLower.includes(table.name.toLowerCase())) {
      tableName = table.name;
    }
  });

  // If we found a table, generate fake records for it
  if (tableName) {
    const table = database.tables.find((t) => t.name === tableName);
    if (table) {
      // Look for a LIMIT clause to determine how many records to generate
      const limitMatch = sqlLower.match(/limit\s+(\d+)/i);
      if (limitMatch && limitMatch[1]) {
        limit = parseInt(limitMatch[1], 10);
      }

      return generateFakeRecords(tableName, table.columns, limit);
    }
  }

  // Default fallback for generic queries
  return [];
};
