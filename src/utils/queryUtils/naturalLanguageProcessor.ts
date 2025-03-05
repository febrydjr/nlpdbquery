
// Import the query handlers
import { 
  processNaturalLanguageQuery,
  handleFilterQuery,
  handleCountQuery,
  handleShowAllQuery,
  handleJoinQuery,
  handleSortQuery,
  handleEcommerceQuery,
  handleWarehouseQuery
} from './queryHandlers';

// Export the natural language processor
export { processNaturalLanguageQuery };

// Export individual processors for use in other modules
export {
  handleFilterQuery,
  handleCountQuery,
  handleShowAllQuery,
  handleJoinQuery,
  handleSortQuery,
  handleEcommerceQuery,
  handleWarehouseQuery
};
