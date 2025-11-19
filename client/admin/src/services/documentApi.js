import axios from "axios";

const BASE_URL = "http://localhost:5000/api/documents";

export const documentAPI = {
  upload: (formData) =>
    axios.post(`${BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getAll: () => axios.get(BASE_URL),

  delete: (id) => axios.delete(`${BASE_URL}/${id}`),
};
