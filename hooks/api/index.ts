import { productsApi } from './products';
import { studentsApi } from './students';
import { classesApi } from './classes';
import { enrollmentsApi } from './enrollments';
import { attendancesApi } from './attendances';
import { tuitionPeriodsApi } from './tuition-periods';
import { ordersApi } from './orders';
import { billingApi } from './billing';

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

  // Attendances
  ...attendancesApi,

  // Tuition Periods
  ...tuitionPeriodsApi,

  // Orders
  ...ordersApi,

  // Billing
  ...billingApi,
};

// Also export individual API modules for more granular imports
export { productsApi, studentsApi, classesApi, enrollmentsApi, attendancesApi, tuitionPeriodsApi, ordersApi, billingApi };

