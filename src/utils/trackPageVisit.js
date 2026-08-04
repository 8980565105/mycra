import api from "../services/api";
import { ROUTES } from "../services/routes";

export const trackPageVisit = async (page) => {
  try {
    await api.post(ROUTES.pageVisit.create, { page });
  } catch (err) {
    console.error(
      "Page visit tracking failed:",
      err?.response?.data || err.message,
    );
  }
};
