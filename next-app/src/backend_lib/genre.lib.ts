import { dbConnection } from '@/db/dbConnector';
import { RowDataPacket } from 'mysql2';
import { z } from "zod";

// Define the schema for the incoming JSON data
export const genreUpdateSchema = z.object({
    genreIds: z.preprocess((val) => {
        // Handle string input by parsing it
        if (typeof val === 'string') {
            try {
                return JSON.parse(val).map(Number);
            } catch {
                return [];
            }
        }
        // If it's already an array, return it
        return Array.isArray(val) ? val.map(Number) : [];
    }, z.array(z.number()))
});


export async function validateGenreIds(genreIds: number[]) {
  if (genreIds.length === 0) return { valid: true, invalidIds: [] };

  // Convert array to comma-separated string
  const genreIdsStr = genreIds.join(',');

  // console.log(genreIdsStr)
  const sql =       `SELECT gId FROM Genre WHERE gId IN (${genreIdsStr})`
  // console.log(sql)
  const [validGenresRs] = await dbConnection.query<RowDataPacket[]>(
    sql);
  // console.log(validGenresRs)
  const validGenreIds = validGenresRs.map(row => row.gId);
  // console.log(validGenreIds)
  const invalidGenreIds = genreIds.filter(id => !validGenreIds.includes(id));
  // console.log(invalidGenreIds)

  return {
      valid: invalidGenreIds.length === 0,
      invalidIds: invalidGenreIds
  };
}