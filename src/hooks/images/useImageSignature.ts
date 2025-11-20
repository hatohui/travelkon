import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useImageSignature = () =>
  useQuery({
    queryKey: ["image-signature"],
    queryFn: async () => axios.post("/images/sign").then((res) => res.data),
  });

export default useImageSignature;
