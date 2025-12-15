import { productsApi } from './products';
import { studentsApi } from './students';
import { classesApi } from './classes';
import { enrollmentsApi } from './enrollments';

/**
 * Unified API object that exports all API modules
 * Maintains backward compatibility with existing code
 */
export const api = {
  // Products & Favorites
  ...productsApi,

  // Students
  ...studentsApi,

  // Classes
  ...classesApi,

  // Enrollments
  ...enrollmentsApi,
};

// Also export individual API modules for more granular imports
export { productsApi, studentsApi, classesApi, enrollmentsApi };

