import Admin from "./Admin";
import { ALLOWED_CATEGORIES } from "@/lib/policy";
import "./admin.css";

export const dynamic = "force-dynamic";

export default function Page() {
  return <Admin categories={ALLOWED_CATEGORIES} />;
}
