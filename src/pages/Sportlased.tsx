import { useEffect, useState } from "react";
import type { Sportlane } from "../models/Sportlane";
import type { SportlanePage } from "../models/SportlanePage";

function Sportlased() {
  const [sportlased, setSportlased] = useState<Sportlane[]>([]);
  const [nimi, setNimi] = useState("");
  const [riik, setRiik] = useState("");
  const [aktiivneRiik, setAktiivneRiik] = useState("");
  const [sortBy, setSortBy] = useState("nimi");
  const [direction, setDirection] = useState("asc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [teade, setTeade] = useState("");

  const [spordialad, setSpordialad] = useState<{ [key: number]: string }>({});
  const [tulemused, setTulemused] = useState<{ [key: number]: string }>({});

  const laeSportlased = () => {
    let url = import.meta.env.VITE_BACK_URL +
      "/sportlased?page=" + page +
      "&size=5" +
      "&sortBy=" + sortBy +
      "&direction=" + direction;

    if (aktiivneRiik !== "") {
      url = url + "&riik=" + aktiivneRiik;
    }

    fetch(url)
      .then(res => res.json())
      .then((json: SportlanePage) => {
        setSportlased(json.content);
        setTotalPages(json.totalPages);
      });
  };

  useEffect(() => {
    laeSportlased();
  }, [page, aktiivneRiik, sortBy, direction]);

  const lisaSportlane = () => {
    if (nimi.trim() === "") {
      setTeade("Sportlase nimi on kohustuslik");
      return;
    }

    if (riik.trim() === "") {
      setTeade("Riik on kohustuslik");
      return;
    }

    const uusSportlane: Sportlane = {
      nimi: nimi,
      riik: riik
    };

    fetch(import.meta.env.VITE_BACK_URL + "/sportlased", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(uusSportlane)
    })
      .then(res => res.json())
      .then(() => {
        setNimi("");
        setRiik("");
        setTeade("Sportlane lisatud");
        setPage(0);
        laeSportlased();
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
      .then(() => {
        setTeade("Sportlane kustutatud");
        laeSportlased();
      });
  };

  const lisaTulemus = (id: number | undefined) => {
    if (id === undefined) {
      return;
    }

    const spordiala = spordialad[id];
    const tulemus = tulemused[id];

    if (spordiala === undefined || spordiala.trim() === "") {
      setTeade("Spordiala on kohustuslik");
      return;
    }

    if (tulemus === undefined || tulemus.trim() === "") {
      setTeade("Tulemus on kohustuslik");
      return;
    }

    const uusTulemus = {
      spordiala: spordiala,
      tulemus: Number(tulemus)
    };

    fetch(import.meta.env.VITE_BACK_URL + "/sportlased/" + id + "/tulemus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(uusTulemus)
    })
      .then(res => res.json())
      .then(() => {
        setTeade("Tulemus lisatud");
        setSpordialad({ ...spordialad, [id]: "" });
        setTulemused({ ...tulemused, [id]: "" });
        laeSportlased();
      });
  };

  const arvutaKogupunktid = (sportlane: Sportlane) => {
    if (sportlane.tulemused === undefined || sportlane.tulemused === null) {
      return 0;
    }

    return sportlane.tulemused.reduce((summa, tulemus) => summa + tulemus.punktid, 0);
  };

  const filtreeriRiigiJargi = () => {
    setPage(0);
    setAktiivneRiik(riik);
  };

  const tyhjendaFilter = () => {
    setPage(0);
    setAktiivneRiik("");
  };

  return (
    <div>
      <h2>Sportlased</h2>

      <div>
        <input
          value={nimi}
          onChange={(e) => setNimi(e.target.value)}
          placeholder="Sportlase nimi"
        />

        <input
          value={riik}
          onChange={(e) => setRiik(e.target.value)}
          placeholder="Riik"
        />

        <button onClick={lisaSportlane}>Lisa sportlane</button>
      </div>

      <div>
        <button onClick={filtreeriRiigiJargi}>Filtreeri riigi järgi</button>
        <button onClick={tyhjendaFilter}>Tühjenda filter</button>
      </div>

      <div>
        <select value={sortBy} onChange={(e) => {
          setPage(0);
          setSortBy(e.target.value);
        }}>
          <option value="nimi">Sorteeri nime järgi</option>
          <option value="punktid">Sorteeri punktide järgi</option>
        </select>

        <select value={direction} onChange={(e) => {
          setPage(0);
          setDirection(e.target.value);
        }}>
          <option value="asc">Kasvavalt</option>
          <option value="desc">Kahanevalt</option>
        </select>
      </div>

      <div>{teade}</div>

      <hr />

      {aktiivneRiik !== "" && <div>Aktiivne filter: {aktiivneRiik}</div>}

      {sportlased.length === 0 && <div>Sportlasi ei leitud</div>}

      {sportlased.map(sportlane =>
        <div key={sportlane.id} className="sportlane">
          <div>
            <h3>{sportlane.nimi}</h3>
            <div>Riik: {sportlane.riik}</div>
            <div>Kogupunktid: {arvutaKogupunktid(sportlane)}</div>

            <h4>Tulemused</h4>

            {sportlane.tulemused === undefined || sportlane.tulemused === null || sportlane.tulemused.length === 0
              ? <div>Tulemusi ei ole</div>
              : sportlane.tulemused.map(tulemus =>
                  <div key={tulemus.id}>
                    {tulemus.spordiala}: {tulemus.tulemus} tulemus, {tulemus.punktid} punkti
                  </div>
                )
            }

            <div>
              <select
                value={sportlane.id === undefined ? "" : spordialad[sportlane.id] || ""}
                onChange={(e) => {
                  if (sportlane.id !== undefined) {
                    setSpordialad({ ...spordialad, [sportlane.id]: e.target.value });
                  }
                }}
              >
                <option value="">Vali spordiala</option>
                <option value="100m">100m</option>
                <option value="kaugushüpe">Kaugushüpe</option>
              </select>

              <input
                type="number"
                value={sportlane.id === undefined ? "" : tulemused[sportlane.id] || ""}
                onChange={(e) => {
                  if (sportlane.id !== undefined) {
                    setTulemused({ ...tulemused, [sportlane.id]: e.target.value });
                  }
                }}
                placeholder="Tulemus"
              />

              <button onClick={() => lisaTulemus(sportlane.id)}>
                Lisa tulemus
              </button>
            </div>
          </div>

          <button onClick={() => kustutaSportlane(sportlane.id)}>
            Kustuta sportlane
          </button>
        </div>
      )}

      <div>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Eelmine
        </button>

        <span>Leht {page + 1} / {totalPages === 0 ? 1 : totalPages}</span>

        <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
          Järgmine
        </button>
      </div>
    </div>
  );
}

export default Sportlased;