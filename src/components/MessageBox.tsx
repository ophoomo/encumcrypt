interface IMessageBox {
  state: string;
  name: string;
  payload: string;
}
export default function MessageBox({ name, payload, state }: IMessageBox) {
  const decodeData = (data: string): string => {
    return data;
  };

  const check_state = () => {
    switch (state) {
      case "Connected":
        return (
          <div>
            <p>{name} joined your room</p>
          </div>
        );
    }
    return (
      <div>
        <h3>{name}</h3>
        <p>{decodeData(payload)}</p>
      </div>
    );
  };
  return <div>{check_state()}</div>;
}
