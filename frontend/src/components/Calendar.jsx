import { useState } from "react";
import "../css/components/calendar.css";

function getDaysRange(start, end) {
  if (!start || !end) {
    return [];
  }

  const startSliced = start.slice(0, 10);
  const endSliced = end.slice(0, 10);

  const [startYear, startMonth, startDay] = startSliced.split("-").map(Number);
  const [endYear, endMonth, endDay] = endSliced.split("-").map(Number);

  const current = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  const days = [];

  while (current <= endDate) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    days.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export default function Calendar({ startDate, endDate, expenses }) {
  const [calendarStartDate, setCalendarStartDate] = useState(startDate);
  const [calendarEndDate, setCalendarEndDate] = useState(endDate);
  const [calendarItems, setCalendarItems] = useState(expenses);

  const [dateError, setDateError] = useState(false);

  const days = getDaysRange(startDate, endDate);

  const calendarItemsByDate = new Map();

  days.forEach((eachDay) => {
    calendarItemsByDate.set(eachDay, []);
  });

  calendarItems.forEach((item) => {
    if (item.expected_date != null) {
      const key = item.expected_date.slice(0, 10);
      if (calendarItemsByDate.has(key)) {
        calendarItemsByDate.get(key).push(item);
      }
    }
  });

  return (
    <div className="itineraryContainer">
      <div id="itineraryTitle">
        <h2>Calendar</h2>
      </div>
      <div className="itineraryGrid">
        {days.map((dateString) => {
          const itemsForDay = calendarItemsByDate.get(dateString) || [];

          return (
            <div key={dateString} className="itineraryDay">
              <div className="itineraryDayHeader">{dateString}</div>

              {itemsForDay.length === 0 ? (
                <div className="itineraryEmpty">No items</div>
              ) : (
                <ul className="itineraryList">
                  {itemsForDay.map((it) => (
                    <li key={it.id} className="itineraryCard">
                      <div className="itineraryCardTitle">{it.name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
