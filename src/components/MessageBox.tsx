interface IMessageBox {
  state: string;
  name: string;
  payload: string;
}
export default function MessageBox({ name, payload, state }: IMessageBox) {
  const decodeData = (data: string): string => {

    const textArray = data.split('')
    const hexArray_of_textval = textArray.map(textValue => {
        const decimalValue = textValue.charCodeAt(0); // รหัส ASCII ของข้อความ
        return decimalValue.toString(16); // แปลงรหัส ASCII เป็นฐาน 16
      });

    const resultOfdiv_lentext = Math.floor(hexArray_of_textval.length / 2); // รับจำนวน text แล้วหาร 2 
    
    const array1 = hexArray_of_textval.slice(0, resultOfdiv_lentext);  // ตั้งแต่ index 0 ถึงครึ่งหนึ่งของอาร์เรย์
    const array2 = hexArray_of_textval.slice(resultOfdiv_lentext);  //แบ่งครึ่ง Array

    const mergedArray_hex = [...array2, ...array1];
    
    const decimalArray = mergedArray_hex.map(hexValue => {
        return parseInt(hexValue, 16); // แปลงค่าฐาน 16 เป็นตัวเลขในฐาน 10
      });
    
    let lentext  = decimalArray.length;
    
    const subtractedArray = decimalArray.map(number => {
        return number - lentext;
      });
    
    const hexArray_of_decimal = subtractedArray.map(number => {
        return number.toString(16);
    });

    const hex_to_text_arrat = hexArray_of_decimal.map(hexValue => {
        const decimalValue = parseInt(hexValue, 16); // แปลงค่าฐาน 16 เป็น decimal
        return String.fromCharCode(decimalValue); // แปลง decimal เป็นข้อความ
    });

    data = hex_to_text_arrat.join('');

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
