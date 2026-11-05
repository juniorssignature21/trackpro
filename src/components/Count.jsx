import { useCountUp } from '../lib/hooks';

export default function Count({ to, suffix = '', className, as: Tag = 'span' }) {
  const [ref, text] = useCountUp(to);
  return <Tag ref={ref} className={className}>{text}{suffix}</Tag>;
}
