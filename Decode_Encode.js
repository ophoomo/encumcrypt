function encodeData(text){
    let text_to_hex = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i).toString(16); // แปลงตัวอักษรในรูปแบบฐาน 16
        text_to_hex += charCode.padStart(2, '0'); // ใส่ 0 ด้านหน้าถ้าต้องการ
    }
    const hexArray_1 = [];                                  //เอาhexที่แปลงมาจาก text ใส่ใน array
    for (let i = 0; i < text_to_hex.length; i += 2) {
        const hexPair = text_to_hex.substr(i, 2);
        hexArray_1.push(hexPair);
    }

    let lentext  = text.length;                       // จำนวนตัวอักษร

    const decimalArray_1 = hexArray_1.map(hex => {
        return parseInt(hex, 16);                     // แปลงเลขฐาน 16 เป็นเลขฐาน 10
    });

    const result_decimal_push_lentext = decimalArray_1.map(number => number + lentext); // เอาฐาน 16 ที่แปลงเป็นฐาน 10 มาบวกกับ จำนวนตัวอักษร

    const numberOfTexts = result_decimal_push_lentext.length;  // นับจำนวนข้อความแล้วหาร 2 ถ้ามัเศษให้ปัดขึ้น
    const resultOfdiv_lentext = Math.ceil(numberOfTexts / 2);

    
    const array1 = result_decimal_push_lentext.slice(0, resultOfdiv_lentext);  // ตั้งแต่ index 0 ถึงครึ่งหนึ่งของอาร์เรย์
    const array2 = result_decimal_push_lentext.slice(resultOfdiv_lentext);  //แบ่งครึ่ง Array

    const mergedArray_decimal = [...array2, ...array1];

    const hexArray = mergedArray_decimal.map(item => {
        const decimalValue = parseInt(item, 10);  // แปลงเลขในฐาน 10 เป็น decimal
        return decimalValue.toString(16);          // แปลง decimal เป็น hex
      });

      const Data = hexArray.map(hexValue => {
        const decimalValue = parseInt(hexValue, 16); // แปลงค่าฐาน 16 เป็นตัวเลขในฐาน 10
        return String.fromCharCode(decimalValue); // แปลงตัวเลขในฐาน 10 เป็นข้อความ
      });
      return Data
}

function decodeData(textArray){

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

    const Data = hex_to_text_arrat.join('');
    return Data
}

console.log("Text : Hello icesu")
console.log("EncodeData : "+encodeData("Hello icesu"));
console.log("DecodeData : "+decodeData(encodeData("Hello icesu")))