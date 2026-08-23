import { STATUS_SLUG } from "../utils/constants";

export default function StatusStamp({ status }) {
  const slug = STATUS_SLUG[status] || "pending";
  return <span className={`status-stamp ${slug}`}>{status}</span>;
}
