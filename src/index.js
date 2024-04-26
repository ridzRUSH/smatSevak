const express = require("express");
const data = require("../data/avaliableime.js");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function getNewDate(date, days) {
  const dateObject = new Date(date);
  dateObject.setDate(dateObject.getDate() + days);
  const updatedDateString = dateObject.toISOString().slice(0, 10);
  return updatedDateString;
}

function getDayOfWeek(givenDate) {
  /* this return day of givenDate date  */
  const [year, month, day] = givenDate.split("-");
  const date = new Date(year, month - 1, day);

  const dayIndex = date.getDay();

  return weekdays[dayIndex];
}

function compareTimes(appointmentTime, doctorsTimeStart, doctorsTimeEnd) {
  /* 
  function use to compare time interval and return proper value according to that 
  for a proper interval return 1;
  for next proper interval return -1;
  for not in any possible interval return 0;
  */

  const [hours1, minutes1] = appointmentTime.split(":").map(Number);
  const [hours2, minutes2] = doctorsTimeStart.split(":").map(Number);
  const [hours3, minutes3] = doctorsTimeEnd.split(":").map(Number);
  const clintTime = new Date(2000, 0, 1, hours1, minutes1, 0);
  const docSt = new Date(2000, 0, 1, hours2, minutes2, 0);
  const docE = new Date(2000, 0, 1, hours3, minutes3, 0);

  if (docSt <= clintTime && clintTime <= docE) {
    return 1;
  } else if (clintTime < docSt) {
    return -1;
  } else {
    return 0;
  }
}
app.get("/", (req, res) => {
  res.send({ message: " please go to this route /check-availability " });
});

app.post("/check-availability", async (req, res) => {
  const date = req.body.date;
  const time = req.body.time;
  if (!date || !time) res.send({ error: "please provide valid field" });

  /* 
  this route provide response according to the response of intervals 
  
  */

  const today = getDayOfWeek(date);
  const dataObj = JSON.parse(data).availabilityTimings;
  let isAvailable = false;
  let nextDay = true;

  for (let i = 0; i < dataObj[today].length; i++) {
    let element = dataObj[today][i];
    let slot = compareTimes(time, element.start, element.end);
    if (slot === 1) {
      nextDay = false;
      isAvailable = true;
      res.send({ isAvailable });
      break;
    } else if (slot === -1) {
      nextDay = false;
      res.send({
        isAvailable,
        nextAvailableSlot: {
          date: getNewDate(date, 0),
          time: dataObj[today][i].start,
        },
      });
      break;
    }
  }

  if (nextDay) {
    let skipDay = 0;
    let index = ((weekdays.indexOf(today) + 1) % 7);
    if (index == 0) {
      index++;
      skipDay++;
    }

    res.send({
      isAvailable,
      nextAvailableSlot: {
        date: getNewDate(date, skipDay + 1),
        time: dataObj[weekdays[index]][0].start,
      },
    });
  }
});

app.listen(3000, () => {
  console.log("App is up on 3000");
});
