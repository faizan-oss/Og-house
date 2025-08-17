export const validateAuthResponse = (response) => {
  if (!response) throw new Error('No response from server');
  if (!response.token) throw new Error('Missing authentication token');
  if (!response.user) throw new Error('Missing user data');
  return true;
};