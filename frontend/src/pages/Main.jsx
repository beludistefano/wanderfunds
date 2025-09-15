import TripCard from "../components/tripCard";

export default function Main() {

  return (
    <div>
        <TripCard trip={{ tripID: "ABC", destination: "Aruba", from_date: "Nov 12", to_date: "Nov 25", status: "Confirmed" }} />
    </div>
  );
}