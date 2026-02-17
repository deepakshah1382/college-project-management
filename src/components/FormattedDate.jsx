import {
  formatLocal,
  formatLocalDate,
  formatUTC,
  formatUTCDate,
} from "@/lib/format-date";
import { useEffect, useState } from "react";

export default function FormattedDate({ date, format = "datetime" }) {
  const [dateString, setDateString] = useState(
    format === "date" ? formatUTCDate(date) : formatUTC(date)
  );

  useEffect(() => {
    setDateString(
      format === "date" ? formatLocalDate(date) : formatLocal(date)
    );
  }, [date, format]);

  return <>{dateString}</>;
}
