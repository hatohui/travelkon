import a from "axios";

const axios = a.create({
  baseURL: "/api",
  withCredentials: true,
});

export default axios;
