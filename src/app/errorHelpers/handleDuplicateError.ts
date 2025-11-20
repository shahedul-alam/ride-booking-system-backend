import { TGenericErrorResponse } from "../interfaces/error.interface";
import httpStatus from "http-status-codes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // Regex to find the value within double quotes (e.g., "duplicate@email.com")
  const matchedArray = err.message.match(/"([^"]*)"/);

  // Default value to use if the regex fails to find the quoted text
  let duplicateValue = "Unknown value";

  // --- FIX START: Null Check ---
  // Ensure the regex match was successful before trying to access index [1]
  if (matchedArray && matchedArray[1]) {
    duplicateValue = matchedArray[1];
  }
  // --- FIX END ---

  return {
    statusCode: httpStatus.BAD_REQUEST, // 400
    message: `Duplicate key error. The value "${duplicateValue}" already exists.`,
    errorSources: [
      {
        path: "", // Mongoose errors often don't provide a clean path here
        message: `${duplicateValue} already exists.`,
      },
    ],
  };
};
