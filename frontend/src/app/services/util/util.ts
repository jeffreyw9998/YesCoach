function getIsoLocalTime(): string{
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
}

function get24HoursAgoDate(curDate: Date){
  const curTimestamp = curDate.getTime();
  const returnDate = new Date(curTimestamp - 24 * 60 * 60 * 1000);

  // Set time to 00:00:00
  returnDate.setHours(0, 0, 0, 0);
  return returnDate;
}
export { getIsoLocalTime, get24HoursAgoDate};
