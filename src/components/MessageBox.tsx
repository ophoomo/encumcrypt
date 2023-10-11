interface IMessageBox {
  state: string;
  name: string;
  payload: string;
  ownerMsg?: boolean;
}
function removeEmptyValuesFromArray(arr: (string | null | undefined)[]): string[] {
  // ใช้ filter() เพื่อกรองค่าที่เป็นค่าว่างออก
  const filteredArray = arr.filter(value => value !== null && value !== undefined && value !== '') as string[];
  return filteredArray;
}
export default function MessageBox({ name, payload, state, ...props }: IMessageBox) {
  const decodeData = (encodedText: string): string => {

  let data = '';
  const parts = encodedText.split('%');

  const newarray = removeEmptyValuesFromArray(parts)
  const lentext = newarray.length
  const halfLength = Math.floor(lentext / 2);
  const array1 = newarray.slice(0, halfLength);  // ตั้งแต่ index 0 ถึงครึ่งหนึ่งของอาร์เรย์
  const array2 = newarray.slice(halfLength);  //แบ่งครึ่ง Array
  const mergedArray_decimal = [...array2, ...array1];

  for (let i = 0; i < mergedArray_decimal.length; i++) {
    const charCode = parseInt(mergedArray_decimal[i], 16);
    data += String.fromCharCode(charCode);
  }
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
