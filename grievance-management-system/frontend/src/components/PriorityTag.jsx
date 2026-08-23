export default function PriorityTag({ priority }) {
  const slug = (priority || "medium").toLowerCase();
  return <span className={`priority-tag ${slug}`}>{priority}</span>;
}
