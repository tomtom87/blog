// UTC so the build machine's timezone can't shift the day.
const fmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export const formatDate = (d: Date) => fmt.format(d);
