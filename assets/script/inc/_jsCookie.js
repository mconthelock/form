import Cookies from "js-cookie";

export const getCookie = (name) => Cookies.get(name) || "";

export const setCookie = (name, value, options = {expires: 0.5 / 24}) => {
  Cookies.set(name, value, options);
}