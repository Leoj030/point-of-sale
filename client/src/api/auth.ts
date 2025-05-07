import API from './axios';

export const loginUser = async (username: string, password: string) => {
  const res = await API.post('/auth/login', { username, password });
  return res.data;
};