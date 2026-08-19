export default function LoadingState({ label = '正在加载...' }) {
  return (
    <div className="loading-state">
      <div className="loading-ring" />
      <p>{label}</p>
    </div>
  );
}
