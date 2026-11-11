export function Loading() {
  return <div className="card empty" role="status">Loading…</div>;
}
export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="card empty" role="alert">
      <p className="error">{message}</p>
      {retry ? <button className="btn" onClick={retry}>Try again</button> : null}
    </div>
  );
}
