function getIsoLocalTime(): string {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
}

function get24HoursAgoDate(curDate: Date) {
  const curTimestamp = curDate.getTime();
  const returnDate = new Date(curTimestamp - 24 * 60 * 60 * 1000);

  // Set time to 00:00:00
  returnDate.setHours(0, 0, 0, 0);
  return returnDate;
}

function get7DaysAgoDate(curDate: Date) {
  const curTimestamp = curDate.getTime();
  const returnDate = new Date(curTimestamp - 7 * 24 * 60 * 60 * 1000);

  // Set time to 00:00:00
  returnDate.setHours(0, 0, 0, 0);
  return returnDate;
}

// Get the time of the date in HH:MM:SS format
function getTimeFromDate(curDate: Date) {
  return curDate.toTimeString().slice(0, 5);
}


function formatTime(time: number) {
  // time is in seconds. Convert to a user-friendly format
  // 1. Convert to hours, minutes, seconds
  // 2. Format to HH:MM:SS. Sometimes, we don't need hours, or minutes
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time - hours * 3600) / 60);
  const seconds = time - hours * 3600 - minutes * 60;
  let returnString = '';
  if (hours > 0) {
    returnString += hours.toString() + ` hr`;
  }
  if (minutes > 0) {
    returnString += minutes.toString() + ` min `;
  }
  if (seconds > 0) {
    returnString += seconds.toString() + ` sec`;
  }
  return returnString;
}

function convertLitersToOunces(liters: number) {
  return liters * 33.814;
}

export {
  getIsoLocalTime, get24HoursAgoDate, get7DaysAgoDate, getTimeFromDate, formatTime,
  convertLitersToOunces
};
