import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const useBasePath = (): string => {
  const role = useSelector((state: RootState) => state.auth?.user?.role);
  return role === "store_owner" ? "/store_owner" : "/admin";
};
