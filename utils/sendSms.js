const axios = require("axios");

const sendSMS = (bookingData, number) => {
  return new Promise((resolve, reject) => {
    try {
      const phoneNumber = number;
      const patientName = bookingData.patientsName;
      const doctorName = bookingData.doctordisplayName;
      const slot = bookingData.slot_initials;
      const bookingAddress = bookingData.slot_initials.split(",")[3];
      axios({
        method: "POST",
        url: `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=3ab8b5e9-6e33-11ec-b710-0200cd936042&to=${phoneNumber}&from=PSMATE&templatename=Appointment+Confirmed+Template+1&var1=${patientName}&var2=${
          slot?.split(",")[3] === "Video Consultation" ? "online" : "inclinic"
        }&var3=${doctorName}&var4=${
          slot?.split(",")[0] +
          " " +
          slot?.split(",")[1] +
          " " +
          slot?.split(",")[2]
        }&var5=${
          bookingAddress === "undefined" ? "Google meet" : bookingAddress
        }`
      })
        .then(function (response) {
          resolve({ status: 1, message: "Success" });
        })
        .catch(function (error) {
          console.log(error);
          reject({ status: 0, message: "failure" });
        });
    } catch (error) {
      console.log(error);
      reject({ status: 0, message: "Server error" });
    }
  });
};

module.exports = sendSMS;
