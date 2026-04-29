export function apiErrorMessage(error, fallback = 'The request could not be completed. Please try again.') {
  if (error.response?.data instanceof Blob) return fallback;
  return error.response?.data?.message || error.message || fallback;
}
