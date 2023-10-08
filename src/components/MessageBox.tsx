interface IMessageBox {
  state: string;
  name: string;
  payload: string;
}
export default function MessageBox({ name, payload }: IMessageBox) {
  const decodeData = (data: string): string => {
    return data;
  };
  return (
    <div>
      <h1>{name}</h1>
      <p>{decodeData(payload)}</p>
    </div>
  );
}
