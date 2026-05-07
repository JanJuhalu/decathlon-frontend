import { useEffect, useState } from "react";
import type { Sportlane } from "../models/Sportlane";

function Sportlased() {
  const [sportlased, setSportlased] = useState<Sportlane[]>([]);
  const [nimi, setNimi] = useState("");
  const [teade, setTeade] = useState("");

  useEffect(() => {
    fetch(import.meta.env.VITE_BACK_URL + "/sportlased")
      .then(res => res.json())
      .then(json => setSportlased(json));
  }, []);

  const lisaSportlane = () => {
    if (nimi.trim() === "") {
      setTeade("Sportlase nimi on kohustuslik");
      return;
    }

    const uusSportlane: Sportlane = {
      nimi: nimi
    };

    fetch(import.meta.env.VITE_BACK_URL + "/sportlased", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(uusSportlane)
    })
      .then(res => res.json())
      .then(json => {
        setSportlased(json);
        setNimi("");
        setTeade("Sportlane lisatud");
      });
  };

  const kustutaSportlane = (id: number | undefined) => {
    if (id === undefined) {
      return;
    }

    fetch(import.meta.env.VITE_BACK_URL + "/sportlased/" + id, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(json => {
        setSportlased(json);
        setTeade("Sportlane kustutatud");
      });
  };

  return (
    <div>
      <h2>Sportlased</h2>

      <input
        value={nimi}
        onChange={(e) => setNimi(e.target.value)}
        placeholder="Sportlase nimi"
      />

      <button onClick={lisaSportlane}>Lisa sportlane</button>

      <div>{teade}</div>

      <hr />

      {sportlased.length === 0 && <div>Sportlasi ei ole lisatud</div>}

      {sportlased.map(sportlane =>
        <div key={sportlane.id} className="sportlane">
          <span>{sportlane.nimi}</span>
          <button onClick={() => kustutaSportlane(sportlane.id)}>
            Kustuta
          </button>
        </div>
      )}
    </div>
  );
}

export default Sportlased;