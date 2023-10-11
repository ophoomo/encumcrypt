interface IMessageBox {
  state: string;
  name: string;
  payload: string;
  ownerMsg?: boolean;
}
export default function MessageBox({ name, payload, state, ...props }: IMessageBox) {
  const decodeData = (data: string): string => {
    return data;
  };

  const check_state = () => {
    switch (state) {
      case "Connected":
        return (
          <div className="flex-center text-xs">
            <p><span className="text-red-800" style={{letterSpacing: 0.4}}>{name}</span> เข้าร่วมห้องสนทนา</p>
          </div>
        );
    }

    return (
      <div className={`w-full flex flex-col ${props.ownerMsg ? 'items-end' : ''}`}>
        <div className={`w-min flex flex-col ${props.ownerMsg ? 'text-right' : ''}`}>
          <p className={`text-xs mr-2 mb-1`}>
            { name }
          </p>
          <p className={`
             px-3 lg:px-4 py-2 rounded-lg w-min min-w-40 max-w-[90%]
             ${props.ownerMsg ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-black'}
          `}>
            {decodeData(payload)}
          </p>
        </div>
      </div>
    );
  };
  return <div>{check_state()}</div>;
}
