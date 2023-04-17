function getIsoLocalTime(): string{
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
}

export { getIsoLocalTime};
