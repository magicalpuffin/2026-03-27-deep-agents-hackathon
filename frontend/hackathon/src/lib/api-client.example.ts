/**
 * Example usage of the API client
 * This file demonstrates how to use the API client functions
 * 
 * To test manually:
 * 1. Start the backend server: cd agent && uv run uvicorn src.api:app --reload
 * 2. Import and use these functions in your React components
 */

import { fetchProcedures, fetchProcedurePFMEA, clearCache, APIError } from './api-client';

/**
 * Example: Fetch all procedures
 */
export async function exampleFetchProcedures() {
  try {
    const procedures = await fetchProcedures();
    console.log('Fetched procedures:', procedures);
    return procedures;
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`API Error: ${error.message} (Status: ${error.status}, Endpoint: ${error.endpoint})`);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

/**
 * Example: Fetch PFMEA items for a specific procedure
 */
export async function exampleFetchPFMEA(procedureId: string) {
  try {
    const pfmeaItems = await fetchProcedurePFMEA(procedureId);
    console.log(`Fetched ${pfmeaItems.length} PFMEA items for procedure ${procedureId}`);
    return pfmeaItems;
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`API Error: ${error.message} (Status: ${error.status}, Endpoint: ${error.endpoint})`);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

/**
 * Example: Fetch all procedures and their PFMEA items
 */
export async function exampleFetchAllData() {
  try {
    // Fetch all procedures
    const procedures = await fetchProcedures();
    console.log(`Found ${procedures.length} procedures`);

    // Fetch PFMEA items for each procedure in parallel
    const pfmeaPromises = procedures.map(p => fetchProcedurePFMEA(p.procedure_id));
    const pfmeaArrays = await Promise.all(pfmeaPromises);
    
    // Flatten all PFMEA items
    const allPFMEAItems = pfmeaArrays.flat();
    console.log(`Total PFMEA items: ${allPFMEAItems.length}`);

    return {
      procedures,
      pfmeaItems: allPFMEAItems
    };
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`API Error: ${error.message} (Status: ${error.status}, Endpoint: ${error.endpoint})`);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

/**
 * Example: Demonstrate caching behavior
 */
export async function exampleCachingBehavior() {
  console.log('First call - will fetch from API');
  const start1 = Date.now();
  await fetchProcedures();
  const duration1 = Date.now() - start1;
  console.log(`First call took ${duration1}ms`);

  console.log('Second call - will use cache');
  const start2 = Date.now();
  await fetchProcedures();
  const duration2 = Date.now() - start2;
  console.log(`Second call took ${duration2}ms (should be much faster)`);

  console.log('Clearing cache...');
  clearCache();

  console.log('Third call - will fetch from API again');
  const start3 = Date.now();
  await fetchProcedures();
  const duration3 = Date.now() - start3;
  console.log(`Third call took ${duration3}ms`);
}

