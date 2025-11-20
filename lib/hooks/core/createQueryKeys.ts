/**
 * Query Key Factory Generator
 *
 * Re-exports the createQueryKeys utility from queryConfig.ts
 * This provides a standardized way to create query keys for resources.
 *
 * @example
 * ```typescript
 * // Create query keys for a resource
 * const petKeys = createQueryKeys('pets');
 *
 * // Use the generated keys
 * petKeys.all;              // ['pets']
 * petKeys.lists();          // ['pets', 'list']
 * petKeys.list({ type: 'dog' }); // ['pets', 'list', { type: 'dog' }]
 * petKeys.details();        // ['pets', 'detail']
 * petKeys.detail('123');    // ['pets', 'detail', '123']
 * petKeys.search('fluffy'); // ['pets', 'search', 'fluffy']
 * ```
 *
 * Benefits:
 * - Consistent query key structure across all resources
 * - Type-safe query key creation
 * - Easy to invalidate related queries
 * - Supports filtering and searching patterns
 */
export { createQueryKeys } from '@/lib/config/queryConfig';
