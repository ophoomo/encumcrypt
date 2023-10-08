function encodeData(text){
    let hexString = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i).toString(16); // แปลงตัวอักษรในรูปแบบฐาน 16
      hexString += charCode.padStart(2, '0'); // ใส่ 0 ด้านหน้าถ้าต้องการ
    }
    let lentext  = text.length; // จำนวนตัวอักษร
    let hexlentext = lentext.toString(16);//แปลงตัวเลขเป็นเลขฐาน16
    

    const hexArray = [];
    for (let i = 0; i < hexString.length; i += 2) {
        const hexPair = hexString.substr(i, 2);
        hexArray.push(hexPair);
    }

    const decimalArray = hexArray.map(hex => {
        return parseInt(hex, 16); // แปลงเลขฐาน 16 เป็นเลขฐาน 10
    });

    decimallen = parseInt(hexlentext,16) // เปลี่ยนจาก hexlen เป็นฐาน 10

    const resultpushArray = decimalArray.map(number => number + decimallen);
    const hexArraypush = resultpushArray.map(decimalValue => decimalValue.toString(16));
    var combinedArray = hexArraypush;
    for (let i = 1; i<(hexArraypush.length /2 );i++){
        let group1 = combinedArray.slice(0,i);
        let group2 = combinedArray.slice(i,hexArraypush.length);
        combinedArray = [...group2, ...group1];
    }
    const hexArrayTostring = combinedArray.map(hexValue => String.fromCharCode(parseInt(hexValue, 16)));
    var result = hexArrayTostring.join('');
    return hexArrayTostring; // ส่งค่ากลับ
}

function decodeData(text){
    var hexArray = [];
    text.forEach(function(str) {
        var hexValue = "";
        for (var i = 0; i < str.length; i++) {
          hexValue += str.charCodeAt(i).toString(16);
        }
        hexArray.push(hexValue);
      });

    var funhextodec = hexArray
    for (let i = 1;i<8;i+=2){
        let group1 = funhextodec.slice(0,i);
        let group2 = funhextodec.slice(i,text.length);
        combinedArray = [...group2, ...group1];
    }
    var hexarrayconverst = combinedArray
    var decimalArray = hexarrayconverst.map(function(hex) {
        return parseInt(hex, 16);
      });

    for(let i = 0;i<decimalArray.length;i++){
      decimalArray[i] -= decimalArray.length
    }

    var hexafter = decimalArray.map(function(decimal) {
  return decimal.toString(16);
});

    const textArray = hexafter.map(hexValue => String.fromCharCode(parseInt(hexValue, 16)));
    const textafter = textArray.join(''); // รวมข้อความใน textArray เข้าด้วยกัน

    return textafter
}


console.log("Text : Hello Icesu")
console.log("EncodeData : "+encodeData("Hello Icesu"));
console.log("DecodeData : "+decodeData(encodeData("Hello Icesu")))
