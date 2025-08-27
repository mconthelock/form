import Cookies from "js-cookie";

export const getCookie = (name) => Cookies.get(name) || "";

export const setCookie = (name, value, minutes = 15) => {
  minutes = parseInt(minutes);
  const expires = minutes / (24 * 60);
  Cookies.set(name, value, { expires: expires });

  const expireTime = Date.now() + minutes * 60 * 1000;
  Cookies.set(`${name}_exp`, expireTime, { expires });
};

export const deleteCookie = (name) => {
  Cookies.remove(name);
};

export const getTimeLeft = (name) => {
  const expireTime = Cookies.get(`${name}_exp`);
  if (!expireTime) return 0;
  return parseInt(expireTime, 10) - Date.now();
};

export const extendSession = (name, minutes = 15) => {
  const value = getCookie(name);
  if (!value) return false;
  setCookie(name, value, minutes);
  return true;
};
