
# Natural Query Explorer

## Overview

Natural Query Explorer is an interactive web application that allows users to connect to databases and query them using natural language. It provides an intuitive interface for database exploration, schema visualization, query execution, and result visualization.

## Features

### Connection Management
- **Connection Selection**: Choose from multiple database connections
- **Connection Types**: Support for PostgreSQL, MySQL, MongoDB, Supabase, and static data sources
- **Visual Indicators**: Selected connections highlighted for better user experience
- **Horizontal Scrolling**: Navigate through multiple connection options

### Database Schema Exploration
- **Table Visualization**: Browse database tables in a structured format
- **Column Details**: View column names, data types, and constraints
- **Primary/Foreign Key Indicators**: Visual identification of key relationships
- **Schema Navigation**: Collapsible UI for easy schema browsing

### Natural Language Querying
- **AI-Powered Queries**: Convert natural language to SQL queries
- **Fuzzy Matching**: Detect and correct table name typos
- **Query Templates**: Support for common query patterns across different domains
- **Context-Aware**: Queries optimized for each database domain (e-commerce, logistics, etc.)

### Query Interface
- **Intuitive Input**: Easy-to-use text area for entering natural language queries
- **Query Execution**: One-click execution of queries
- **Query Explanation**: Detailed explanation of generated SQL queries
- **Loading States**: Visual feedback during query processing

### Query Results
- **Responsive Table**: View query results in a clean, scrollable format
- **Multiple Output Formats**: View results as Table, JSON, or SQL
- **Expandable Height**: Adjustable view for handling large result sets
- **Sticky Header**: Table headers remain visible during scrolling

### Query History
- **Historical Tracking**: Keep record of previously executed queries
- **Query Reuse**: Re-run previous queries with a single click
- **Execution Metadata**: View execution time and query status
- **Chronological Order**: Most recent queries displayed first

## Technical Stack

### Frontend
- **Framework**: React with TypeScript
- **UI Components**: Shadcn UI component library
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Query for data fetching
- **Routing**: React Router for navigation
- **Icons**: Lucide React for iconography

### Data Management
- **Mock Data**: Faker.js for dynamic data generation
- **Query Processing**: Custom natural language processing utilities
- **Data Transformation**: Custom formatters for different output types

### Development Tools
- **Build System**: Vite for fast development and production builds
- **Type Safety**: TypeScript for enhanced developer experience
- **Code Organization**: Component-based architecture

## Getting Started

1. **Clone the Repository**
   ```
   git clone [repository-url]
   cd natural-query-explorer
   ```

2. **Install Dependencies**
   ```
   npm install
   ```

3. **Run Development Server**
   ```
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite)

## Project Structure

- `/src/components`: UI components
- `/src/data`: Mock data and database configurations
- `/src/pages`: Application pages
- `/src/utils`: Utility functions for query processing
- `/src/hooks`: Custom React hooks

## Future Enhancements

- Live database connections
- Query optimization suggestions
- Advanced visualization options
- User accounts and saved queries
- Export functionality for query results
